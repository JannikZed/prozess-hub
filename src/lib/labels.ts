import type {
  Channel,
  Confidence,
  LifecycleState,
  PartnerType,
  Priority,
  TaskState,
  TaskType,
} from './types'

export const lifecycleLabels: Record<LifecycleState, string> = {
  intake: 'Eingang',
  awaiting_internal: 'Intern wartend',
  awaiting_partner: 'Partner wartend',
  ready_for_erp: 'ERP-bereit',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
}

export const priorityLabels: Record<Priority, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
}

export const confidenceLabels: Record<Confidence, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
}

export const partnerTypeLabels: Record<PartnerType, string> = {
  customer: 'Kunde',
  supplier: 'Lieferant',
  carrier: 'Frachtführer',
  unknown: 'Unbekannt',
}

export const channelLabels: Record<Channel, string> = {
  email: 'E-Mail',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  phone: 'Telefon',
}

export const taskStateLabels: Record<TaskState, string> = {
  open: 'Offen',
  blocked: 'Blockiert',
  awaiting_approval: 'Freigabe',
  executing: 'In Ausführung',
  done: 'Erledigt',
}

export const taskTypeLabels: Record<TaskType, string> = {
  contract_call: 'Vertragsabruf',
  order: 'Auftrag',
  contract: 'Vertrag',
  delivery_note: 'Lieferschein',
  price_update: 'Preisupdate',
  incoming_invoice: 'Eingangsrechnung',
  certification: 'Zertifikat',
  create_quote: 'Angebot erstellen',
  revise_quote: 'Angebot revidieren',
  create_order: 'Auftrag anlegen',
  adjust_delivery: 'Lieferung anpassen',
  reply: 'Antwort',
  inquiry: 'Anfrage',
  complaint: 'Reklamation',
  weighbridge: 'Waage',
  route: 'Tour',
  other: 'Sonstiges',
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `vor ${Math.max(1, mins)} Min.`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  return `vor ${days} Tag${days === 1 ? '' : 'en'}`
}
