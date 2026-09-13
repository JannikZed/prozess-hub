import type { Channel, Confidence, LifecycleState, Priority, TaskState } from '@/lib/types'
import {
  channelLabels,
  confidenceLabels,
  lifecycleLabels,
  priorityLabels,
  taskStateLabels,
} from '@/lib/labels'

const lifecycleStyles: Record<LifecycleState, string> = {
  intake: 'bg-sky-100 text-sky-800 ring-sky-200',
  awaiting_internal: 'bg-amber-100 text-amber-900 ring-amber-200',
  awaiting_partner: 'bg-violet-100 text-violet-800 ring-violet-200',
  ready_for_erp: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  completed: 'bg-slate-100 text-slate-600 ring-slate-200',
  cancelled: 'bg-rose-100 text-rose-800 ring-rose-200',
}

const priorityStyles: Record<Priority, string> = {
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
  medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  low: 'bg-slate-50 text-slate-600 ring-slate-200',
}

const taskStateStyles: Record<TaskState, string> = {
  open: 'bg-sky-50 text-sky-800 ring-sky-200',
  blocked: 'bg-rose-50 text-rose-800 ring-rose-200',
  awaiting_approval: 'bg-amber-50 text-amber-900 ring-amber-200',
  executing: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  done: 'bg-slate-100 text-slate-500 ring-slate-200',
}

const confidenceDot: Record<Confidence, string> = {
  high: 'bg-emerald-500',
  medium: 'bg-amber-400',
  low: 'bg-rose-500',
}

const channelIconStyles: Record<Channel, string> = {
  email: 'bg-blue-100 text-blue-700',
  whatsapp: 'bg-green-100 text-green-700',
  telegram: 'bg-sky-100 text-sky-700',
  phone: 'bg-orange-100 text-orange-700',
}

const channelShort: Record<Channel, string> = {
  email: '✉',
  whatsapp: 'WA',
  telegram: 'TG',
  phone: '☎',
}

export function LifecycleBadge({ state }: { state: LifecycleState }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${lifecycleStyles[state]}`}
    >
      {lifecycleLabels[state]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${priorityStyles[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  )
}

export function TaskStateBadge({ state }: { state: TaskState }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${taskStateStyles[state]}`}
    >
      {taskStateLabels[state]}
    </span>
  )
}

export function ConfidenceLight({
  confidence,
  showLabel = false,
}: {
  confidence: Confidence
  showLabel?: boolean
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`Konfidenz: ${confidenceLabels[confidence]}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${confidenceDot[confidence]}`} />
      {showLabel && (
        <span className="text-[11px] text-slate-600">{confidenceLabels[confidence]}</span>
      )}
    </span>
  )
}

export function ChannelIcons({ channels }: { channels: Channel[] }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {channels.map((c) => (
        <span
          key={c}
          title={channelLabels[c]}
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[9px] font-bold ${channelIconStyles[c]}`}
        >
          {channelShort[c]}
        </span>
      ))}
    </span>
  )
}
