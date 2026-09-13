'use client'

import type { Channel, CommunicationDraft } from '@/lib/types'
import { channelLabels } from '@/lib/labels'

const channels: Channel[] = ['email', 'whatsapp', 'telegram', 'phone']

interface ComposeBarProps {
  draft: CommunicationDraft
  onChange: (draft: CommunicationDraft) => void
  onSend: () => void
  disabled?: boolean
}

export function ComposeBar({ draft, onChange, onSend, disabled }: ComposeBarProps) {
  const toValue = Array.isArray(draft.to) ? draft.to.join(', ') : draft.to

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2.5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Kanal
        </label>
        <select
          value={draft.channel}
          onChange={(e) =>
            onChange({ ...draft, channel: e.target.value as Channel })
          }
          className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          aria-label="Kanal wählen"
        >
          {channels.map((c) => (
            <option key={c} value={c}>
              {channelLabels[c]}
            </option>
          ))}
        </select>
        {draft.suggestedByAi && (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200">
            KI-Entwurf
          </span>
        )}
      </div>

      <div className="mb-2 grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={toValue}
          onChange={(e) => {
            const raw = e.target.value
            const to = raw.includes(',')
              ? raw.split(',').map((s) => s.trim()).filter(Boolean)
              : raw
            onChange({ ...draft, to })
          }}
          placeholder="Empfänger"
          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          aria-label="Empfänger"
        />
        {(draft.channel === 'email' || draft.subject !== undefined) && (
          <input
            type="text"
            value={draft.subject ?? ''}
            onChange={(e) => onChange({ ...draft, subject: e.target.value })}
            placeholder="Betreff"
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            aria-label="Betreff"
          />
        )}
      </div>

      <textarea
        value={draft.body}
        onChange={(e) => onChange({ ...draft, body: e.target.value, suggestedByAi: false })}
        rows={3}
        placeholder="Nachricht verfassen…"
        className="mb-2 w-full resize-y rounded-md border border-slate-200 px-2.5 py-1.5 text-sm leading-relaxed focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        aria-label="Nachrichtentext"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !draft.body.trim()}
          className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Senden
        </button>
      </div>
    </div>
  )
}
