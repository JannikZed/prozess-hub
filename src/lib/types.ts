export type PartnerType = 'customer' | 'supplier' | 'carrier' | 'unknown'
export type Channel = 'email' | 'whatsapp' | 'telegram' | 'phone'
export type LifecycleState =
  | 'intake'
  | 'awaiting_internal'
  | 'awaiting_partner'
  | 'ready_for_erp'
  | 'completed'
  | 'cancelled'
export type Priority = 'high' | 'medium' | 'low'
export type Confidence = 'high' | 'medium' | 'low'
export type TaskState = 'open' | 'blocked' | 'awaiting_approval' | 'executing' | 'done'
export type EventDirection = 'inbound' | 'outbound' | 'internal'
export type TimelineEventType =
  | 'email_in'
  | 'email_out'
  | 'whatsapp_in'
  | 'whatsapp_out'
  | 'telegram_in'
  | 'telegram_out'
  | 'phone_note'
  | 'system'
export type AttachmentType = 'pdf' | 'xlsx' | 'image' | 'docx'
export type FieldStatus = 'ok' | 'warning' | 'error'
export type CallDirection = 'inbound' | 'outbound'

export type TaskType =
  | 'contract_call'
  | 'order'
  | 'contract'
  | 'delivery_note'
  | 'price_update'
  | 'incoming_invoice'
  | 'certification'
  | 'create_quote'
  | 'revise_quote'
  | 'create_order'
  | 'adjust_delivery'
  | 'reply'
  | 'inquiry'
  | 'complaint'
  | 'weighbridge'
  | 'route'
  | 'other'

export interface Process {
  id: string
  title: string
  partnerName: string
  partnerType: PartnerType
  channelMix: Channel[]
  lifecycleState: LifecycleState
  negotiationSummary: string
  priority: Priority
  confidence: Confidence
  assignedTo?: string
  openTaskCount: number
  lastActivityAt: string
  tags?: string[]
}

export interface Attachment {
  name: string
  type: AttachmentType
  sizeKb: number
}

export interface SuggestedFollowUp {
  id: string
  label: string
  taskType: TaskType
  prefillDraft?: CommunicationDraft
}

export interface TimelineEvent {
  id: string
  processId: string
  channel: Channel
  direction: EventDirection
  type: TimelineEventType
  timestamp: string
  from?: string
  to?: string | string[]
  subject?: string
  bodyPreview: string
  bodyFull?: string
  attachments?: Attachment[]
  linkedTaskIds?: string[]
  durationMinutes?: number
  callDirection?: CallDirection
  suggestedFollowUps?: SuggestedFollowUp[]
}

export interface FieldValidation {
  field: string
  label: string
  value: string | number
  status: FieldStatus
  message?: string
  erpReference?: string
}

export interface CommunicationDraft {
  channel: Channel
  to: string | string[]
  subject?: string
  body: string
  suggestedByAi: boolean
}

export interface Decision {
  id: string
  label: string
  options: { id: string; label: string; consequence?: string }[]
  selectedOptionId?: string
}

export interface BaseErpDraft {
  fields: FieldValidation[]
  notes?: string
}

export interface ContractCallDraft extends BaseErpDraft {
  kind: 'contract_call'
  contractNumber: string
  product: string
  quantityTons: number
  deliveryWindow: string
  callReference?: string
}

export interface OrderDraft extends BaseErpDraft {
  kind: 'order'
  orderNumber?: string
  product: string
  quantityTons: number
  unitPriceEur: number
  deliveryDate: string
}

export interface PriceUpdateDraft extends BaseErpDraft {
  kind: 'price_update'
  product: string
  oldPriceEur: number
  newPriceEur: number
  validFrom: string
  supplierRef?: string
}

export interface DeliveryNoteDraft extends BaseErpDraft {
  kind: 'delivery_note'
  deliveryNoteNumber: string
  product: string
  declaredTons: number
  actualTons?: number
  warehouse?: string
}

export interface QuoteDraft extends BaseErpDraft {
  kind: 'quote'
  quoteNumber?: string
  product: string
  quantityTons: number
  unitPriceEur: number
  validUntil: string
  revision?: number
}

export interface IncomingInvoiceDraft extends BaseErpDraft {
  kind: 'incoming_invoice'
  invoiceNumber: string
  amountEur: number
  dueDate: string
  matchedOrderRef?: string
}

export interface CertificationDraft extends BaseErpDraft {
  kind: 'certification'
  certificateType: string
  certificateNumber: string
  validUntil: string
  product?: string
}

export interface CreateOrderDraft extends BaseErpDraft {
  kind: 'create_order'
  product: string
  quantityTons: number
  unitPriceEur: number
  requestedDelivery: string
  customerRef?: string
}

export interface AdjustDeliveryDraft extends BaseErpDraft {
  kind: 'adjust_delivery'
  deliveryRef: string
  originalDate: string
  newDate: string
  reason: string
}

export interface WeighbridgeDraft extends BaseErpDraft {
  kind: 'weighbridge'
  ticketNumber: string
  declaredTons: number
  weighedTons: number
  deviationPercent: number
  vehiclePlate?: string
}

export interface RouteDraft extends BaseErpDraft {
  kind: 'route'
  routeId: string
  origin: string
  destination: string
  plannedDeparture: string
  carrierName?: string
}

export interface ComplaintDraft extends BaseErpDraft {
  kind: 'complaint'
  complaintRef: string
  category: string
  relatedDelivery?: string
  claimedAmountEur?: number
}

export interface InquiryDraft extends BaseErpDraft {
  kind: 'inquiry'
  topic: string
  product?: string
  quantityTons?: number
}

export interface ReplyDraft extends BaseErpDraft {
  kind: 'reply'
  relatedSubject: string
  intent: string
}

export type ErpDraft =
  | ContractCallDraft
  | OrderDraft
  | PriceUpdateDraft
  | DeliveryNoteDraft
  | QuoteDraft
  | IncomingInvoiceDraft
  | CertificationDraft
  | CreateOrderDraft
  | AdjustDeliveryDraft
  | WeighbridgeDraft
  | RouteDraft
  | ComplaintDraft
  | InquiryDraft
  | ReplyDraft

export interface Task {
  id: string
  processId: string
  taskType: TaskType
  title: string
  state: TaskState
  confidence: Confidence
  sourceEventIds: string[]
  groupId?: string
  groupIndex?: number
  groupTotal?: number
  erpDraft?: ErpDraft
  communicationDraft?: CommunicationDraft
  decisions?: Decision[]
  blockingReason?: string
}

export interface ProcessHubState {
  processes: Process[]
  events: TimelineEvent[]
  tasks: Task[]
  selectedProcessId: string | null
  focusedTaskId: string | null
}

export type ProcessHubAction =
  | { type: 'HYDRATE'; seed: { processes: Process[]; events: TimelineEvent[]; tasks: Task[]; initialSelectedProcessId: string } }
  | { type: 'SELECT_PROCESS'; processId: string }
  | { type: 'FOCUS_TASK'; taskId: string | null }
  | { type: 'UPDATE_COMM_DRAFT'; taskId: string; draft: CommunicationDraft }
  | { type: 'UPDATE_ERP_FIELD'; taskId: string; field: string; value: string | number }
  | { type: 'SELECT_DECISION'; taskId: string; decisionId: string; optionId: string }
  | { type: 'SEND_MESSAGE'; processId: string; draft: CommunicationDraft; linkedTaskId?: string }
  | { type: 'BOOK_ERP'; taskId: string }
  | { type: 'REQUEST_APPROVAL'; taskId: string }
  | { type: 'COMPLETE_TASK'; taskId: string }
