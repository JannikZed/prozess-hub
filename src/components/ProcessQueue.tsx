'use client'

import { useMemo, useState } from 'react'
import type { LifecycleState, Priority, Process } from '@/lib/types'
import { formatRelative, lifecycleLabels, partnerTypeLabels, priorityLabels } from '@/lib/labels'
import { ChannelIcons, ConfidenceLight, LifecycleBadge, PriorityBadge } from './Badges'

const lifecycleOptions: LifecycleState[] = [
  'intake',
  'awaiting_internal',
  'awaiting_partner',
  'ready_for_erp',
  'completed',
  'cancelled',
]

const priorityOptions: Priority[] = ['high', 'medium', 'low']

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

interface ProcessQueueProps {
  processes: Process[]
  selectedProcessId: string | null
  onSelect: (id: string) => void
}

export function ProcessQueue({ processes, selectedProcessId, onSelect }: ProcessQueueProps) {
  const [search, setSearch] = useState('')
  const [lifecycle, setLifecycle] = useState<LifecycleState | 'all'>('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return processes
      .filter((p) => {
        if (lifecycle !== 'all' && p.lifecycleState !== lifecycle) return false
        if (priority !== 'all' && p.priority !== priority) return false
        if (!q) return true
        const hay = [p.title, p.partnerName, ...(p.tags ?? []), p.id].join(' ').toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => {
        const t = new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
        if (t !== 0) return t
        return priorityRank[a.priority] - priorityRank[b.priority]
      })
  }, [processes, search, lifecycle, priority])

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-slate-50/80">
      <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Prozess-Warteschlange</h2>
          <span className="text-[11px] text-slate-500">{filtered.length} von {processes.length}</span>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche Titel, Partner, Tags…"
          className="mb-2 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          aria-label="Prozesse durchsuchen"
        />
        <div className="flex gap-2">
          <select
            value={lifecycle}
            onChange={(e) => setLifecycle(e.target.value as LifecycleState | 'all')}
            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            aria-label="Filter Lebenszyklus"
          >
            <option value="all">Alle Status</option>
            {lifecycleOptions.map((s) => (
              <option key={s} value={s}>
                {lifecycleLabels[s]}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority | 'all')}
            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            aria-label="Filter Priorität"
          >
            <option value="all">Alle Prio</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {priorityLabels[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto" role="listbox" aria-label="Prozesse">
        {filtered.map((p) => {
          const selected = p.id === selectedProcessId
          return (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(p.id)}
                className={`w-full border-b border-slate-100 px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
                  selected
                    ? 'bg-emerald-50/90 ring-1 ring-inset ring-emerald-200'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-sm font-medium text-slate-900">{p.title}</span>
                  <ConfidenceLight confidence={p.confidence} />
                </div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">{p.partnerName}</span>
                  <span>·</span>
                  <span>{partnerTypeLabels[p.partnerType]}</span>
                </div>
                <div className="mb-1.5 flex flex-wrap items-center gap-1">
                  <LifecycleBadge state={p.lifecycleState} />
                  <PriorityBadge priority={p.priority} />
                  {p.openTaskCount > 0 && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {p.openTaskCount} Aufgaben
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <ChannelIcons channels={p.channelMix} />
                  <span className="text-[10px] text-slate-400">{formatRelative(p.lastActivityAt)}</span>
                </div>
                {p.tags && p.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-100 px-1 py-0.5 text-[10px] text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-slate-500">Keine Prozesse gefunden.</li>
        )}
      </ul>
    </aside>
  )
}
