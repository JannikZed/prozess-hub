'use client'

import { useState } from 'react'
import type { TimelineEvent } from '@/lib/types'
import { channelLabels, formatTimestamp } from '@/lib/labels'

const channelBar: Record<TimelineEvent['channel'], string> = {
  email: 'border-l-blue-500',
  whatsapp: 'border-l-green-500',
  telegram: 'border-l-sky-500',
  phone: 'border-l-orange-500',
}

const directionLabel: Record<TimelineEvent['direction'], string> = {
  inbound: 'Eingehend',
  outbound: 'Ausgehend',
  internal: 'Intern',
}

interface TimelineEventCardProps {
  event: TimelineEvent
  onFollowUp?: (followUpId: string) => void
}

export function TimelineEventCard({ event, onFollowUp }: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const body = expanded ? event.bodyFull ?? event.bodyPreview : event.bodyPreview
  const canExpand = Boolean(event.bodyFull && event.bodyFull !== event.bodyPreview)

  return (
    <article
      className={`rounded-lg border border-slate-200 border-l-4 bg-white p-3 shadow-sm ${channelBar[event.channel]}`}
    >
      <header className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">
          {channelLabels[event.channel]}
        </span>
        <span>{directionLabel[event.direction]}</span>
        <span>·</span>
        <time dateTime={event.timestamp}>{formatTimestamp(event.timestamp)}</time>
        {event.type === 'phone_note' && event.durationMinutes != null && (
          <>
            <span>·</span>
            <span>
              {event.durationMinutes} Min.
              {event.callDirection
                ? ` (${event.callDirection === 'inbound' ? 'eingehend' : 'ausgehend'})`
                : ''}
            </span>
          </>
        )}
      </header>

      {(event.from || event.to) && (
        <div className="mb-1 text-[11px] text-slate-600">
          {event.from && (
            <div>
              <span className="text-slate-400">Von: </span>
              {event.from}
            </div>
          )}
          {event.to && (
            <div>
              <span className="text-slate-400">An: </span>
              {Array.isArray(event.to) ? event.to.join(', ') : event.to}
            </div>
          )}
        </div>
      )}

      {event.subject && (
        <h4 className="mb-1 text-sm font-semibold text-slate-900">{event.subject}</h4>
      )}

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{body}</p>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-emerald-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {expanded ? 'Weniger anzeigen' : 'Vollständig anzeigen'}
        </button>
      )}

      {event.attachments && event.attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {event.attachments.map((a) => (
            <span
              key={a.name}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700 ring-1 ring-slate-200"
              title={`${a.type.toUpperCase()} · ${a.sizeKb} KB`}
            >
              <span className="font-semibold uppercase text-slate-500">{a.type}</span>
              {a.name}
              <span className="text-slate-400">{a.sizeKb} KB</span>
            </span>
          ))}
        </div>
      )}

      {event.suggestedFollowUps && event.suggestedFollowUps.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="w-full text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Vorgeschlagene Follow-ups
          </span>
          {event.suggestedFollowUps.map((sf) => (
            <button
              key={sf.id}
              type="button"
              onClick={() => onFollowUp?.(sf.id)}
              className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {sf.label}
            </button>
          ))}
        </div>
      )}
    </article>
  )
}
