'use client'

import { useMemo, useState, useEffect } from 'react'
import type { CommunicationDraft, Process, Task, TimelineEvent } from '@/lib/types'
import { partnerTypeLabels, taskTypeLabels } from '@/lib/labels'
import { ConfidenceLight, LifecycleBadge, PriorityBadge, TaskStateBadge } from './Badges'
import { TimelineEventCard } from './TimelineEventCard'
import { ComposeBar } from './ComposeBar'

interface ConversationPanelProps {
  process: Process | null
  events: TimelineEvent[]
  tasks: Task[]
  focusedTaskId: string | null
  onFocusTask: (taskId: string | null) => void
  onUpdateDraft: (taskId: string, draft: CommunicationDraft) => void
  onSend: (processId: string, draft: CommunicationDraft, linkedTaskId?: string) => void
}

const emptyDraft = (): CommunicationDraft => ({
  channel: 'email',
  to: '',
  subject: '',
  body: '',
  suggestedByAi: false,
})

export function ConversationPanel({
  process,
  events,
  tasks,
  focusedTaskId,
  onFocusTask,
  onUpdateDraft,
  onSend,
}: ConversationPanelProps) {
  const focusedTask = tasks.find((t) => t.id === focusedTaskId) ?? null
  const [localDraft, setLocalDraft] = useState<CommunicationDraft>(emptyDraft())

  useEffect(() => {
    if (focusedTask?.communicationDraft) {
      setLocalDraft(focusedTask.communicationDraft)
    } else if (process) {
      setLocalDraft({
        ...emptyDraft(),
        to: '',
        subject: `RE: ${process.title}`,
      })
    } else {
      setLocalDraft(emptyDraft())
    }
  }, [focusedTaskId, focusedTask?.communicationDraft, process?.id])

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [events]
  )

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.groupIndex != null && b.groupIndex != null) return a.groupIndex - b.groupIndex
        if (a.state === 'done' && b.state !== 'done') return 1
        if (a.state !== 'done' && b.state === 'done') return -1
        return a.title.localeCompare(b.title, 'de')
      }),
    [tasks]
  )

  if (!process) {
    return (
      <section className="flex h-full items-center justify-center bg-slate-100/50 text-sm text-slate-500">
        Prozess links auswählen, um Konversation und Aufgaben zu sehen.
      </section>
    )
  }

  const handleDraftChange = (draft: CommunicationDraft) => {
    setLocalDraft(draft)
    if (focusedTask) {
      onUpdateDraft(focusedTask.id, draft)
    }
  }

  const handleSend = () => {
    onSend(process.id, localDraft, focusedTask?.id)
    if (!focusedTask) {
      setLocalDraft((d) => ({ ...d, body: '', suggestedByAi: false }))
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col bg-slate-50/40">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">{process.title}</h2>
          <LifecycleBadge state={process.lifecycleState} />
          <PriorityBadge priority={process.priority} />
          <ConfidenceLight confidence={process.confidence} showLabel />
        </div>
        <div className="mb-2 text-xs text-slate-500">
          {process.partnerName} · {partnerTypeLabels[process.partnerType]}
          {process.assignedTo ? ` · Zugewiesen: ${process.assignedTo}` : ''}
        </div>
        <div className="rounded-md border border-emerald-100 bg-emerald-50/70 px-3 py-2">
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            Verhandlungsstand
          </div>
          <p className="text-sm leading-snug text-emerald-950">{process.negotiationSummary}</p>
        </div>
      </header>

      {sortedTasks.length > 0 && (
        <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Aufgabenstapel
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sortedTasks.map((t) => {
              const active = t.id === focusedTaskId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onFocusTask(active ? null : t.id)}
                  className={`min-w-[180px] max-w-[220px] shrink-0 rounded-lg border px-2.5 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    active
                      ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  } ${t.state === 'done' ? 'opacity-60' : ''}`}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <TaskStateBadge state={t.state} />
                    {t.groupIndex != null && t.groupTotal != null && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {t.groupIndex}/{t.groupTotal}
                      </span>
                    )}
                  </div>
                  <div className="line-clamp-2 text-xs font-medium text-slate-900">{t.title}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{taskTypeLabels[t.taskType]}</span>
                    <ConfidenceLight confidence={t.confidence} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        {sortedEvents.map((ev) => (
          <TimelineEventCard key={ev.id} event={ev} />
        ))}
        {sortedEvents.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">Noch keine Ereignisse.</p>
        )}
      </div>

      <ComposeBar draft={localDraft} onChange={handleDraftChange} onSend={handleSend} />
    </section>
  )
}
