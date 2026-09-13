'use client'

import type { Decision, ErpDraft, FieldValidation, Task } from '@/lib/types'
import { taskTypeLabels } from '@/lib/labels'
import { ConfidenceLight, TaskStateBadge } from './Badges'

const statusStyles: Record<FieldValidation['status'], string> = {
  ok: 'border-emerald-200 bg-emerald-50/50',
  warning: 'border-amber-300 bg-amber-50',
  error: 'border-rose-300 bg-rose-50',
}

const statusDot: Record<FieldValidation['status'], string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-400',
  error: 'bg-rose-500',
}

function erpKindLabel(draft: ErpDraft): string {
  const map: Record<ErpDraft['kind'], string> = {
    contract_call: 'Vertragsabruf',
    order: 'Auftrag',
    price_update: 'Preisupdate',
    delivery_note: 'Lieferschein',
    quote: 'Angebot',
    incoming_invoice: 'Eingangsrechnung',
    certification: 'Zertifikat',
    create_order: 'Auftrag anlegen',
    adjust_delivery: 'Lieferung anpassen',
    weighbridge: 'Waage',
    route: 'Tour',
    complaint: 'Reklamation',
    inquiry: 'Anfrage',
    reply: 'Antwort',
  }
  return map[draft.kind]
}

interface ActionPanelProps {
  task: Task | null
  onUpdateField: (taskId: string, field: string, value: string | number) => void
  onSelectDecision: (taskId: string, decisionId: string, optionId: string) => void
  onBookErp: (taskId: string) => void
  onRequestApproval: (taskId: string) => void
  onCompleteTask: (taskId: string) => void
}

function FieldRow({
  field,
  disabled,
  onChange,
}: {
  field: FieldValidation
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className={`rounded-md border px-2.5 py-2 ${statusStyles[field.status]}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
          <span className={`h-2 w-2 rounded-full ${statusDot[field.status]}`} />
          {field.label}
        </label>
        {field.erpReference && (
          <span className="truncate text-[10px] text-slate-400" title={field.erpReference}>
            {field.erpReference}
          </span>
        )}
      </div>
      <input
        type="text"
        value={String(field.value)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-slate-200/80 bg-white px-2 py-1 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:bg-slate-50 disabled:text-slate-500"
        aria-label={field.label}
      />
      {field.message && (
        <p
          className={`mt-1 text-[11px] ${
            field.status === 'error'
              ? 'text-rose-700'
              : field.status === 'warning'
                ? 'text-amber-800'
                : 'text-slate-500'
          }`}
        >
          {field.message}
        </p>
      )}
    </div>
  )
}

function DecisionBlock({
  decision,
  disabled,
  onSelect,
}: {
  decision: Decision
  disabled?: boolean
  onSelect: (optionId: string) => void
}) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-3">
      <legend className="px-1 text-xs font-semibold text-slate-800">{decision.label}</legend>
      <div className="mt-1 space-y-1.5">
        {decision.options.map((opt) => {
          const selected = decision.selectedOptionId === opt.id
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-sm transition-colors ${
                selected
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:bg-slate-50'
              } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                type="radio"
                name={decision.id}
                value={opt.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onSelect(opt.id)}
                className="mt-0.5 accent-emerald-600"
              />
              <span>
                <span className="font-medium text-slate-900">{opt.label}</span>
                {opt.consequence && (
                  <span className="mt-0.5 block text-[11px] text-slate-500">{opt.consequence}</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function ActionPanel({
  task,
  onUpdateField,
  onSelectDecision,
  onBookErp,
  onRequestApproval,
  onCompleteTask,
}: ActionPanelProps) {
  if (!task) {
    return (
      <aside className="flex h-full flex-col items-center justify-center border-l border-slate-200 bg-white px-6 text-center">
        <div className="mb-2 text-2xl" aria-hidden>
          ◫
        </div>
        <p className="text-sm font-medium text-slate-700">Keine Aufgabe fokussiert</p>
        <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-500">
          Wählen Sie eine Aufgabe im Stapel der Mitte, um ERP-Entwurf, Entscheidungen und Aktionen zu
          sehen. Esc entfernt den Fokus.
        </p>
      </aside>
    )
  }

  const done = task.state === 'done'
  const executing = task.state === 'executing'

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-slate-200 bg-white">
      <div className="shrink-0 border-b border-slate-200 px-3 py-3">
        <div className="mb-1 flex items-center gap-2">
          <TaskStateBadge state={task.state} />
          <ConfidenceLight confidence={task.confidence} showLabel />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">{task.title}</h2>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {taskTypeLabels[task.taskType]}
          {task.groupIndex != null && task.groupTotal != null
            ? ` · Batch ${task.groupIndex}/${task.groupTotal}`
            : ''}
        </p>
        {task.blockingReason && (
          <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-800">
            <span className="font-semibold">Blockiert: </span>
            {task.blockingReason}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {task.erpDraft && (
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              ERP-Entwurf · {erpKindLabel(task.erpDraft)}
            </h3>
            <div className="space-y-2">
              {task.erpDraft.fields.map((f) => (
                <FieldRow
                  key={f.field}
                  field={f}
                  disabled={done || executing}
                  onChange={(value) => {
                    const numericFields = [
                      'quantityTons',
                      'oldPriceEur',
                      'newPriceEur',
                      'unitPriceEur',
                      'declaredTons',
                      'actualTons',
                      'weighedTons',
                      'deviationPercent',
                      'claimedAmountEur',
                      'amountEur',
                      'revision',
                    ]
                    const parsed = numericFields.includes(f.field) && value !== '' && !Number.isNaN(Number(value))
                      ? Number(value)
                      : value
                    onUpdateField(task.id, f.field, parsed)
                  }}
                />
              ))}
            </div>
            {task.erpDraft.notes && (
              <p className="mt-2 text-[11px] text-slate-500">{task.erpDraft.notes}</p>
            )}
          </section>
        )}

        {task.decisions && task.decisions.length > 0 && (
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Entscheidungen
            </h3>
            <div className="space-y-3">
              {task.decisions.map((d) => (
                <DecisionBlock
                  key={d.id}
                  decision={d}
                  disabled={done || executing}
                  onSelect={(optionId) => onSelectDecision(task.id, d.id, optionId)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="shrink-0 space-y-2 border-t border-slate-200 bg-slate-50 px-3 py-3">
        <button
          type="button"
          disabled={done || executing}
          onClick={() => onBookErp(task.id)}
          className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          In ERP buchen
        </button>
        <button
          type="button"
          disabled={done || executing || task.state === 'awaiting_approval'}
          onClick={() => onRequestApproval(task.id)}
          className="w-full rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Freigabe anfordern
        </button>
        <button
          type="button"
          disabled={done}
          onClick={() => onCompleteTask(task.id)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Aufgabe erledigen
        </button>
      </div>
    </aside>
  )
}
