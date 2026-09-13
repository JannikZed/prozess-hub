import type {
  CommunicationDraft,
  ErpDraft,
  FieldValidation,
  ProcessHubAction,
  ProcessHubState,
  TimelineEvent,
} from './types'

function patchFields(draft: ErpDraft, field: string, value: string | number): FieldValidation[] {
  return draft.fields.map((f) => (f.field === field ? { ...f, value } : f))
}

function updateErpField(draft: ErpDraft, field: string, value: string | number): ErpDraft {
  const fields = patchFields(draft, field, value)

  switch (draft.kind) {
    case 'contract_call':
      return {
        ...draft,
        fields,
        contractNumber: field === 'contractNumber' ? String(value) : draft.contractNumber,
        product: field === 'product' ? String(value) : draft.product,
        quantityTons: field === 'quantityTons' ? Number(value) : draft.quantityTons,
        deliveryWindow: field === 'deliveryWindow' ? String(value) : draft.deliveryWindow,
        callReference: field === 'callReference' ? String(value) : draft.callReference,
      }
    case 'order':
      return {
        ...draft,
        fields,
        product: field === 'product' ? String(value) : draft.product,
        quantityTons: field === 'quantityTons' ? Number(value) : draft.quantityTons,
        unitPriceEur: field === 'unitPriceEur' ? Number(value) : draft.unitPriceEur,
        deliveryDate: field === 'deliveryDate' ? String(value) : draft.deliveryDate,
        orderNumber: field === 'orderNumber' ? String(value) : draft.orderNumber,
      }
    case 'price_update':
      return {
        ...draft,
        fields,
        product: field === 'product' ? String(value) : draft.product,
        oldPriceEur: field === 'oldPriceEur' ? Number(value) : draft.oldPriceEur,
        newPriceEur: field === 'newPriceEur' ? Number(value) : draft.newPriceEur,
        validFrom: field === 'validFrom' ? String(value) : draft.validFrom,
        supplierRef: field === 'supplierRef' ? String(value) : draft.supplierRef,
      }
    case 'delivery_note':
      return {
        ...draft,
        fields,
        deliveryNoteNumber:
          field === 'deliveryNoteNumber' ? String(value) : draft.deliveryNoteNumber,
        product: field === 'product' ? String(value) : draft.product,
        declaredTons: field === 'declaredTons' ? Number(value) : draft.declaredTons,
        actualTons: field === 'actualTons' ? Number(value) : draft.actualTons,
        warehouse: field === 'warehouse' ? String(value) : draft.warehouse,
      }
    case 'quote':
      return {
        ...draft,
        fields,
        quoteNumber: field === 'quoteNumber' ? String(value) : draft.quoteNumber,
        product: field === 'product' ? String(value) : draft.product,
        quantityTons: field === 'quantityTons' ? Number(value) : draft.quantityTons,
        unitPriceEur: field === 'unitPriceEur' ? Number(value) : draft.unitPriceEur,
        validUntil: field === 'validUntil' ? String(value) : draft.validUntil,
        revision: field === 'revision' ? Number(value) : draft.revision,
      }
    case 'incoming_invoice':
      return {
        ...draft,
        fields,
        invoiceNumber: field === 'invoiceNumber' ? String(value) : draft.invoiceNumber,
        amountEur: field === 'amountEur' ? Number(value) : draft.amountEur,
        dueDate: field === 'dueDate' ? String(value) : draft.dueDate,
        matchedOrderRef: field === 'matchedOrderRef' ? String(value) : draft.matchedOrderRef,
      }
    case 'certification':
      return {
        ...draft,
        fields,
        certificateType: field === 'certificateType' ? String(value) : draft.certificateType,
        certificateNumber:
          field === 'certificateNumber' ? String(value) : draft.certificateNumber,
        validUntil: field === 'validUntil' ? String(value) : draft.validUntil,
        product: field === 'product' ? String(value) : draft.product,
      }
    case 'create_order':
      return {
        ...draft,
        fields,
        product: field === 'product' ? String(value) : draft.product,
        quantityTons: field === 'quantityTons' ? Number(value) : draft.quantityTons,
        unitPriceEur: field === 'unitPriceEur' ? Number(value) : draft.unitPriceEur,
        requestedDelivery:
          field === 'requestedDelivery' ? String(value) : draft.requestedDelivery,
        customerRef: field === 'customerRef' ? String(value) : draft.customerRef,
      }
    case 'adjust_delivery':
      return {
        ...draft,
        fields,
        deliveryRef: field === 'deliveryRef' ? String(value) : draft.deliveryRef,
        originalDate: field === 'originalDate' ? String(value) : draft.originalDate,
        newDate: field === 'newDate' ? String(value) : draft.newDate,
        reason: field === 'reason' ? String(value) : draft.reason,
      }
    case 'weighbridge':
      return {
        ...draft,
        fields,
        ticketNumber: field === 'ticketNumber' ? String(value) : draft.ticketNumber,
        declaredTons: field === 'declaredTons' ? Number(value) : draft.declaredTons,
        weighedTons: field === 'weighedTons' ? Number(value) : draft.weighedTons,
        deviationPercent:
          field === 'deviationPercent' ? Number(value) : draft.deviationPercent,
        vehiclePlate: field === 'vehiclePlate' ? String(value) : draft.vehiclePlate,
      }
    case 'route':
      return {
        ...draft,
        fields,
        routeId: field === 'routeId' ? String(value) : draft.routeId,
        origin: field === 'origin' ? String(value) : draft.origin,
        destination: field === 'destination' ? String(value) : draft.destination,
        plannedDeparture:
          field === 'plannedDeparture' ? String(value) : draft.plannedDeparture,
        carrierName: field === 'carrierName' ? String(value) : draft.carrierName,
      }
    case 'complaint':
      return {
        ...draft,
        fields,
        complaintRef: field === 'complaintRef' ? String(value) : draft.complaintRef,
        category: field === 'category' ? String(value) : draft.category,
        relatedDelivery: field === 'relatedDelivery' ? String(value) : draft.relatedDelivery,
        claimedAmountEur:
          field === 'claimedAmountEur' ? Number(value) : draft.claimedAmountEur,
      }
    case 'inquiry':
      return {
        ...draft,
        fields,
        topic: field === 'topic' ? String(value) : draft.topic,
        product: field === 'product' ? String(value) : draft.product,
        quantityTons: field === 'quantityTons' ? Number(value) : draft.quantityTons,
      }
    case 'reply':
      return {
        ...draft,
        fields,
        relatedSubject: field === 'relatedSubject' ? String(value) : draft.relatedSubject,
        intent: field === 'intent' ? String(value) : draft.intent,
      }
    default: {
      const _exhaustive: never = draft
      return _exhaustive
    }
  }
}

function recalcOpenTasks(tasks: ProcessHubState['tasks'], processId: string): number {
  return tasks.filter((t) => t.processId === processId && t.state !== 'done').length
}

export function processHubReducer(
  state: ProcessHubState,
  action: ProcessHubAction
): ProcessHubState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        processes: action.seed.processes,
        events: action.seed.events,
        tasks: action.seed.tasks,
        selectedProcessId: action.seed.initialSelectedProcessId,
        focusedTaskId: null,
      }
    case 'SELECT_PROCESS':
      return {
        ...state,
        selectedProcessId: action.processId,
        focusedTaskId: null,
      }

    case 'FOCUS_TASK':
      return { ...state, focusedTaskId: action.taskId }

    case 'UPDATE_COMM_DRAFT':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, communicationDraft: action.draft } : t
        ),
      }

    case 'UPDATE_ERP_FIELD':
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.taskId || !t.erpDraft) return t
          return { ...t, erpDraft: updateErpField(t.erpDraft, action.field, action.value) }
        }),
      }

    case 'SELECT_DECISION':
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.taskId || !t.decisions) return t
          return {
            ...t,
            decisions: t.decisions.map((d) =>
              d.id === action.decisionId ? { ...d, selectedOptionId: action.optionId } : d
            ),
            state: t.state === 'blocked' ? 'open' : t.state,
            blockingReason: t.state === 'blocked' ? undefined : t.blockingReason,
          }
        }),
      }

    case 'SEND_MESSAGE': {
      const draft: CommunicationDraft = action.draft
      const channel = draft.channel
      const typeMap = {
        email: 'email_out',
        whatsapp: 'whatsapp_out',
        telegram: 'telegram_out',
        phone: 'phone_note',
      } as const
      const event: TimelineEvent = {
        id: `ev-local-${Date.now()}`,
        processId: action.processId,
        channel,
        direction: channel === 'phone' ? 'internal' : 'outbound',
        type: typeMap[channel],
        timestamp: new Date().toISOString(),
        from: 'Innendienst AgroHub',
        to: draft.to,
        subject: draft.subject,
        bodyPreview: draft.body.slice(0, 80) + (draft.body.length > 80 ? '…' : ''),
        bodyFull: draft.body,
        linkedTaskIds: action.linkedTaskId ? [action.linkedTaskId] : undefined,
      }
      const processes = state.processes.map((p) =>
        p.id === action.processId ? { ...p, lastActivityAt: event.timestamp } : p
      )
      return {
        ...state,
        events: [...state.events, event],
        processes,
      }
    }

    case 'BOOK_ERP': {
      const task = state.tasks.find((t) => t.id === action.taskId)
      if (!task) return state
      const doneTasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, state: 'done' as const } : t
      )
      const event: TimelineEvent = {
        id: `ev-erp-${Date.now()}`,
        processId: task.processId,
        channel: 'email',
        direction: 'internal',
        type: 'system',
        timestamp: new Date().toISOString(),
        bodyPreview: `ERP-Buchung ausgeführt: ${task.title}`,
        bodyFull: `Mock-Buchung für Aufgabe „${task.title}“ (${task.taskType}) erfolgreich ins ERP übernommen.`,
        linkedTaskIds: [task.id],
      }
      const openCount = recalcOpenTasks(doneTasks, task.processId)
      const processes = state.processes.map((p) => {
        if (p.id !== task.processId) return p
        return {
          ...p,
          openTaskCount: openCount,
          lastActivityAt: event.timestamp,
          lifecycleState: openCount === 0 ? ('completed' as const) : p.lifecycleState,
        }
      })
      return { ...state, tasks: doneTasks, events: [...state.events, event], processes }
    }

    case 'REQUEST_APPROVAL': {
      const task = state.tasks.find((t) => t.id === action.taskId)
      if (!task) return state
      const tasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, state: 'awaiting_approval' as const } : t
      )
      const event: TimelineEvent = {
        id: `ev-appr-${Date.now()}`,
        processId: task.processId,
        channel: 'email',
        direction: 'internal',
        type: 'system',
        timestamp: new Date().toISOString(),
        bodyPreview: `Freigabe angefordert: ${task.title}`,
        bodyFull: `Interne Freigabe für „${task.title}“ wurde angefordert (Mock).`,
        linkedTaskIds: [task.id],
      }
      const processes = state.processes.map((p) =>
        p.id === task.processId
          ? {
              ...p,
              lastActivityAt: event.timestamp,
              lifecycleState: 'awaiting_internal' as const,
            }
          : p
      )
      return { ...state, tasks, events: [...state.events, event], processes }
    }

    case 'COMPLETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.taskId)
      if (!task) return state
      const tasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, state: 'done' as const } : t
      )
      const openCount = recalcOpenTasks(tasks, task.processId)
      const event: TimelineEvent = {
        id: `ev-done-${Date.now()}`,
        processId: task.processId,
        channel: 'email',
        direction: 'internal',
        type: 'system',
        timestamp: new Date().toISOString(),
        bodyPreview: `Aufgabe erledigt: ${task.title}`,
        bodyFull: `Aufgabe „${task.title}“ wurde als erledigt markiert.`,
        linkedTaskIds: [task.id],
      }
      const processes = state.processes.map((p) => {
        if (p.id !== task.processId) return p
        return {
          ...p,
          openTaskCount: openCount,
          lastActivityAt: event.timestamp,
          lifecycleState: openCount === 0 ? ('completed' as const) : p.lifecycleState,
        }
      })
      return {
        ...state,
        tasks,
        events: [...state.events, event],
        processes,
        focusedTaskId: state.focusedTaskId === action.taskId ? null : state.focusedTaskId,
      }
    }

    default:
      return state
  }
}
