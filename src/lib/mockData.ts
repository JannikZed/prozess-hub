import type {
  Attachment, Channel, CommunicationDraft, Confidence, Decision, ErpDraft,
  EventDirection, FieldStatus, FieldValidation, Process, Task, TaskState,
  TaskType, TimelineEvent, TimelineEventType,
} from './types'
const WM = 'proc-weizen-meyer'
const PN = 'proc-preisupdate-nordkorn'
const BS = 'proc-angebot-bauer-schmidt'
const LS = 'proc-lieferschein-abweichung'
const RK = 'proc-reklamation-fracht'
const ZB = 'proc-zertifikat-bio'
const MEYER = 'klaus.meyer@hof-meyer.example'
const ANNA = 'anna.keller@agrohub.example'
const ALO = 'disposition@agrarlogistik-ost.example'
const SCHMIDT = 'info@bauer-schmidt.example'
const L: Record<string, string> = {
  contractNumber: 'Vertragsnr.', product: 'Artikel', quantityTons: 'Menge (t)',
  deliveryWindow: 'Lieferfenster', partner: 'Partner', oldPriceEur: 'Alter Preis (€/t)',
  newPriceEur: 'Neuer Preis (€/t)', validFrom: 'Gültig ab', staffel: 'Staffelpreis',
  supplier: 'Lieferant', quoteNumber: 'Angebotsnr.', revision: 'Revision',
  unitPriceEur: 'Preis (€/t)', validUntil: 'Gültig bis', margin: 'Marge',
  deliveryNoteNumber: 'Lieferscheinnr.', declaredTons: 'Deklariert (t)', actualTons: 'Gewogen (t)',
  warehouse: 'Lager', ticketNumber: 'Ticketnr.', weighedTons: 'Gewogen (t)',
  deviationPercent: 'Abweichung (%)', vehiclePlate: 'Kennzeichen',
  complaintRef: 'Reklamationsnr.', category: 'Kategorie', relatedDelivery: 'Tour/Lieferung',
  claimedAmountEur: 'Forderung (€)', moisture: 'Feuchte gemessen', carrierClaim: 'Frachtführer',
  certificateType: 'Zertifikatstyp', certificateNumber: 'Zertifikatsnr.',
}
type Cell = [string, string | number, FieldStatus?, string?, string?]
const F = (cells: Cell[]): FieldValidation[] =>
  cells.map(([field, value, status = 'ok', message, erpReference]) => ({
    field, label: L[field] ?? field, value, status,
    ...(message ? { message } : {}), ...(erpReference ? { erpReference } : {}),
  }))
const att = (name: string, type: Attachment['type'], sizeKb: number): Attachment => ({ name, type, sizeKb })
const draft = (
  to: string | string[], subject: string, body: string, channel: Channel = 'email',
): CommunicationDraft => ({ channel, to, subject, body, suggestedByAi: true })
const pv = (s: string) => {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= 64 ? t : `${t.slice(0, 63)}…`
}
type X = Partial<Pick<TimelineEvent, 'from' | 'to' | 'subject' | 'attachments' | 'linkedTaskIds' | 'durationMinutes' | 'callDirection' | 'suggestedFollowUps'>>
const ev = (
  id: string, processId: string, channel: Channel, direction: EventDirection,
  type: TimelineEventType, ts: string, body: string, x: X = {},
): TimelineEvent => ({
  id, processId, channel, direction, type, timestamp: ts, bodyPreview: pv(body), bodyFull: body, ...x,
})
type TO = {
  state?: TaskState; confidence?: Confidence; erp?: ErpDraft; comm?: CommunicationDraft
  decisions?: Decision[]; blockingReason?: string
  groupId?: string; groupIndex?: number; groupTotal?: number
}
const task = (
  id: string, processId: string, taskType: TaskType, title: string, src: string[], o: TO = {},
): Task => ({
  id, processId, taskType, title, sourceEventIds: src,
  state: o.state ?? 'open', confidence: o.confidence ?? 'high',
  erpDraft: o.erp, communicationDraft: o.comm, decisions: o.decisions, blockingReason: o.blockingReason,
  groupId: o.groupId, groupIndex: o.groupIndex, groupTotal: o.groupTotal,
})
function abruf(i: number, window: string, conf: Confidence = 'high', warn?: string, partner = false): Task {
  const short = ['KW38 Di', 'KW38 Do', 'KW39', 'KW40', 'KW42'][i - 1]
  const cells: Cell[] = [
    ['contractNumber', 'VH-2026-0412', 'ok', undefined, partner ? 'VERTRAG/0412' : undefined],
    ['product', 'Weizen Qualität A', 'ok', undefined, partner ? 'ART-WEI-A' : undefined],
    ['quantityTons', 50],
    warn ? ['deliveryWindow', window, 'warning', warn] : ['deliveryWindow', window],
  ]
  if (partner) cells.push(['partner', 'Hof Meyer', 'ok', undefined, 'KUN-10042'])
  return task(`task-wm-${i}`, WM, 'contract_call', `Abruf ${i}/5 — 50 t Weizen ${short}`,
    i <= 2 ? ['ev-wm-01', 'ev-wm-02'] : ['ev-wm-01'], {
      confidence: conf, groupId: 'grp-wm-abrufe', groupIndex: i, groupTotal: 5,
      erp: {
        kind: 'contract_call', contractNumber: 'VH-2026-0412', product: 'Weizen Qualität A',
        quantityTons: 50, deliveryWindow: window, callReference: `ABR-0412-0${i}`, fields: F(cells),
      },
      comm: i === 1
        ? draft(MEYER, 'Bestätigung Abruf 1/5', 'Abruf 1/5: 50 t Weizen A, KW38 Di.')
        : i === 2
          ? { channel: 'whatsapp', to: '+49 170 1112233', body: 'Abruf 2/5: 50 t KW38 Do.', suggestedByAi: true }
          : undefined,
    })
}
function proc(
  id: string, title: string, partnerName: string, partnerType: Process['partnerType'],
  channelMix: Channel[], lifecycleState: Process['lifecycleState'], negotiationSummary: string,
  priority: Process['priority'], confidence: Confidence, assignedTo: string,
  openTaskCount: number, lastActivityAt: string, tags: string[],
): Process {
  return {
    id, title, partnerName, partnerType, channelMix, lifecycleState, negotiationSummary,
    priority, confidence, assignedTo, openTaskCount, lastActivityAt, tags,
  }
}
export const processes: Process[] = [
  proc(WM, 'Weizen Abrufe — Vertrag VH-2026-0412', 'Hof Meyer', 'customer',
    ['whatsapp', 'email', 'phone'], 'ready_for_erp',
    '5 Abrufe Weizen A (250 t, KW 38–42) — bereit zur ERP-Buchung.',
    'high', 'high', 'Anna Keller', 5, '2026-09-13T14:42:00Z', ['Abruf', 'Weizen', 'Batch']),
  proc(PN, 'Preisupdate Gerste — Nordkorn AG', 'Nordkorn AG', 'supplier',
    ['email'], 'awaiting_internal', 'Gerste +4,20 €/t ab 15.09. — Freigabe nötig.',
    'high', 'medium', 'Tom Richter', 1, '2026-09-13T11:18:00Z', ['Preis', 'Gerste', 'Freigabe']),
  proc(BS, 'Angebot Raps — Bauer Schmidt', 'Bauer Schmidt', 'customer',
    ['email', 'phone'], 'awaiting_partner', 'ANG-2026-889 (80 t) revidiert auf 510,50 €/t — wartet.',
    'medium', 'high', 'Anna Keller', 1, '2026-09-12T16:05:00Z', ['Angebot', 'Raps']),
  proc(LS, 'Lieferschein-Abweichung LS-78421', 'AgrarLogistik Ost', 'carrier',
    ['email', 'whatsapp', 'phone'], 'awaiting_internal', 'LS 120 t / Waage 116,4 t (−3 %). Entscheidung nötig.',
    'high', 'medium', 'Tom Richter', 2, '2026-09-13T13:55:00Z', ['Waage', 'Abweichung', 'LS']),
  proc(RK, 'Reklamation Fracht — Feuchtigkeit', 'Spedition Grünfeld', 'carrier',
    ['email', 'phone', 'telegram'], 'awaiting_internal', 'Mais-Feuchte überschritten; Frachtführer bestreitet.',
    'high', 'low', 'Lisa Braun', 1, '2026-09-13T09:30:00Z', ['Reklamation', 'Fracht', 'Mais']),
  proc(ZB, 'Bio-Zertifikat Nachreichung', 'ÖkoHof Linden', 'supplier',
    ['email'], 'intake', 'Bio-Zertifikat bis 31.12.2027 — ERP-Anlage offen.',
    'low', 'high', 'Anna Keller', 1, '2026-09-11T10:12:00Z', ['Zertifikat', 'Bio']),
]
const wmAll = ['task-wm-1', 'task-wm-2', 'task-wm-3', 'task-wm-4', 'task-wm-5']
export const events: TimelineEvent[] = [
  ev('ev-wm-01', WM, 'email', 'inbound', 'email_in', '2026-09-10T08:15:00Z',
    'Abruf VH-2026-0412: 250 t Weizen A, 5×50 t, KW 38–42.',
    { from: MEYER, to: 'innendienst@agrohub.example', subject: 'Abrufe Weizen VH-2026-0412',
      attachments: [att('Abrufplan_KW38-42.xlsx', 'xlsx', 48)], linkedTaskIds: wmAll }),
  ev('ev-wm-02', WM, 'whatsapp', 'inbound', 'whatsapp_in', '2026-09-11T09:40:00Z',
    'Abruf 1+2 bitte Di/Do KW38?',
    { from: '+49 170 1112233 (Hof Meyer)', to: 'AgroHub Innendienst', linkedTaskIds: ['task-wm-1', 'task-wm-2'] }),
  ev('ev-wm-03', WM, 'phone', 'internal', 'phone_note', '2026-09-12T11:20:00Z',
    'Tel. Meyer: 5×50 t Qualität A ok.',
    { from: 'Anna Keller', durationMinutes: 8, callDirection: 'outbound', linkedTaskIds: ['task-wm-1'],
      suggestedFollowUps: [{ id: 'sf-wm-1', label: 'Bestätigung E-Mail senden', taskType: 'reply',
        prefillDraft: draft(MEYER, 'Bestätigung Abrufe', 'Fünf Abrufe à 50 t Weizen A bestätigt.') }] }),
  ev('ev-wm-04', WM, 'email', 'outbound', 'email_out', '2026-09-12T14:00:00Z',
    'Wir legen die fünf Abrufe an und buchen im ERP.',
    { from: ANNA, to: MEYER, subject: 'RE: Abrufe Weizen VH-2026-0412' }),
  ev('ev-wm-05', WM, 'whatsapp', 'inbound', 'whatsapp_in', '2026-09-13T14:42:00Z',
    'Super, danke! Bitte Buchung durchführen.',
    { from: '+49 170 1112233 (Hof Meyer)', to: 'AgroHub Innendienst' }),
  ev('ev-pn-01', PN, 'email', 'inbound', 'email_in', '2026-09-13T10:45:00Z',
    'Gerste: 198,50 → 202,70 €/t ab 15.09. Fixpreise unberührt.',
    { from: 'einkauf@nordkorn.example', to: 'einkauf@agrohub.example', subject: 'Preisanpassung Gerste ab 15.09.',
      attachments: [att('Preisliste_Gerste_Sep2026.pdf', 'pdf', 220)], linkedTaskIds: ['task-pn-1'] }),
  ev('ev-pn-02', PN, 'email', 'internal', 'system', '2026-09-13T11:18:00Z',
    'KI: NK-441/NK-455 ohne Fixpreis (~+4.200 €).', { linkedTaskIds: ['task-pn-1'] }),
  ev('ev-bs-01', BS, 'email', 'inbound', 'email_in', '2026-09-09T13:10:00Z',
    'Angebot 80 t Raps Ernte 2026, Lieferung Oktober, ab Hof.',
    { from: SCHMIDT, to: 'vertrieb@agrohub.example', subject: 'Anfrage Raps 80 t', linkedTaskIds: ['task-bs-1'] }),
  ev('ev-bs-02', BS, 'email', 'outbound', 'email_out', '2026-09-10T09:30:00Z',
    'ANG-2026-889: 80 t Raps, 512 €/t, gültig bis 20.09.',
    { from: ANNA, to: SCHMIDT, subject: 'Angebot ANG-2026-889', attachments: [att('ANG-2026-889.pdf', 'pdf', 112)] }),
  ev('ev-bs-03', BS, 'phone', 'internal', 'phone_note', '2026-09-11T15:45:00Z',
    'Tel.: Preis zu hoch — Revision 510,50 €/t zugesagt.',
    { from: 'Anna Keller', durationMinutes: 6, callDirection: 'inbound', linkedTaskIds: ['task-bs-2'],
      suggestedFollowUps: [{ id: 'sf-bs-1', label: 'Revidiertes Angebot senden', taskType: 'revise_quote' }] }),
  ev('ev-bs-04', BS, 'email', 'outbound', 'email_out', '2026-09-12T10:00:00Z',
    'Revision 1: 510,50 €/t, gültig bis 22.09.',
    { from: ANNA, to: SCHMIDT, subject: 'RE: ANG-2026-889 Rev. 1', attachments: [att('ANG-2026-889_Rev1.pdf', 'pdf', 115)] }),
  ev('ev-bs-05', BS, 'email', 'internal', 'system', '2026-09-12T16:05:00Z',
    'Status awaiting_partner. Reminder in 3 Werktagen.'),
  ev('ev-ls-01', LS, 'email', 'inbound', 'email_in', '2026-09-13T07:50:00Z',
    'LS-78421: 120 t Weizen, Lager Nord, Kfz OS-AL 441.',
    { from: ALO, to: 'logistik@agrohub.example', subject: 'LS-78421 Weizen Lager Nord',
      attachments: [att('LS-78421.pdf', 'pdf', 180)], linkedTaskIds: ['task-ls-1'] }),
  ev('ev-ls-02', LS, 'email', 'inbound', 'email_in', '2026-09-13T12:10:00Z',
    'WS-99102: 120→116,4 t (−3 %), OS-AL 441.',
    { from: 'waage@lager-nord.example', to: 'logistik@agrohub.example', subject: 'Gewichtsschein WS-99102',
      attachments: [att('WS-99102.pdf', 'pdf', 95)], linkedTaskIds: ['task-ls-2'] }),
  ev('ev-ls-03', LS, 'whatsapp', 'inbound', 'whatsapp_in', '2026-09-13T12:40:00Z',
    'Waage zeigte weniger — Lkw voll, evtl. Kalibrierung?',
    { from: '+49 151 9988776 (Fahrer)', to: 'AgroHub Logistik' }),
  ev('ev-ls-04', LS, 'phone', 'internal', 'phone_note', '2026-09-13T13:55:00Z',
    'Dispo: Nachwiegen unmöglich — Entscheidung nötig.',
    { from: 'Tom Richter', durationMinutes: 5, callDirection: 'outbound',
      suggestedFollowUps: [{ id: 'sf-ls-1', label: 'Differenz an Lieferanten melden', taskType: 'reply',
        prefillDraft: draft(ALO, 'Differenz LS-78421', 'LS-78421: 116,4 statt 120 t (−3 %).') }] }),
  ev('ev-rk-01', RK, 'email', 'inbound', 'email_in', '2026-09-12T08:20:00Z',
    'Tour GF-228: Feuchte 16,8 % (Soll ≤15 %). Forderung 1.850 €.',
    { from: 'qualitaet@hof-meyer.example', to: 'reklamation@agrohub.example', subject: 'Reklamation Mais Feuchte',
      attachments: [att('Messprotokoll_Mais_1109.pdf', 'pdf', 140)], linkedTaskIds: ['task-rk-1'] }),
  ev('ev-rk-02', RK, 'telegram', 'inbound', 'telegram_in', '2026-09-12T14:05:00Z',
    'Verladeprobe 14,2 % — keine Haftung.',
    { from: 'Spedition Grünfeld Dispo', to: 'AgroHub Reklamation' }),
  ev('ev-rk-03', RK, 'phone', 'internal', 'phone_note', '2026-09-13T09:30:00Z',
    'Keine Einigung. 50/50 oder Gegenprobe — blockiert.',
    { from: 'Lisa Braun', durationMinutes: 18, callDirection: 'outbound', linkedTaskIds: ['task-rk-1'],
      suggestedFollowUps: [
        { id: 'sf-rk-1', label: 'Kulanzangebot an Kunden', taskType: 'reply' },
        { id: 'sf-rk-2', label: 'Stellungnahme an Frachtführer', taskType: 'reply' },
      ] }),
  ev('ev-zb-01', ZB, 'email', 'inbound', 'email_in', '2026-09-11T10:12:00Z',
    'Anbei Bio-Zertifikat, gültig bis 31.12.2027.',
    { from: 'buero@oekohof-linden.example', to: 'qualitaet@agrohub.example', subject: 'Bio-Zertifikat 2026/27',
      attachments: [att('BioZertifikat_Linden_2027.pdf', 'pdf', 860)], linkedTaskIds: ['task-zb-1'] }),
]
export const tasks: Task[] = [
  abruf(1, 'KW38 Di (15.09.2026)', 'high', undefined, true),
  abruf(2, 'KW38 Do (17.09.2026)', 'high', undefined, true),
  abruf(3, 'KW39 (22.–26.09.2026)'),
  abruf(4, 'KW40 (29.09.–03.10.2026)', 'medium', 'Lager Nord KW40 zu 92 % ausgelastet'),
  abruf(5, 'KW42 (13.–17.10.2026)'),
  task('task-pn-1', PN, 'price_update', 'Preisupdate Gerste Futterware +4,20 €/t', ['ev-pn-01', 'ev-pn-02'], {
    confidence: 'medium',
    erp: {
      kind: 'price_update', product: 'Gerste Futterware', oldPriceEur: 198.5, newPriceEur: 202.7,
      validFrom: '2026-09-15', supplierRef: 'NK-PL-2026-09',
      fields: F([
        ['product', 'Gerste Futterware', 'ok', undefined, 'ART-GER-F'],
        ['oldPriceEur', 198.5], ['newPriceEur', 202.7],
        ['validFrom', '2026-09-15', 'warning', '2 offene Kontrakte ohne Fixpreis'],
        ['staffel', 'nicht übernommen', 'warning', 'Staffel nicht eindeutig'],
        ['supplier', 'Nordkorn AG', 'ok', undefined, 'LIF-20018'],
      ]),
    },
    decisions: [{ id: 'dec-pn-1', label: 'Anwendung auf offene Kontrakte', options: [
      { id: 'opt-fix', label: 'Nur Listenpreis', consequence: 'Empfohlen' },
      { id: 'opt-all', label: 'Auch Abrufe ohne Fixpreis', consequence: '+ca. 4.200 €' },
      { id: 'opt-reject', label: 'Ablehnen / nachverhandeln' },
    ] }],
    comm: draft('einkauf@nordkorn.example', 'RE: Preisanpassung Gerste', 'Wir prüfen intern und melden uns bis 16.09.'),
  }),
  task('task-bs-1', BS, 'create_quote', 'Angebot ANG-2026-889 erstellen', ['ev-bs-01'], {
    state: 'done',
    erp: {
      kind: 'quote', quoteNumber: 'ANG-2026-889', product: 'Raps Ernte 2026', quantityTons: 80,
      unitPriceEur: 512, validUntil: '2026-09-20', revision: 0,
      fields: F([
        ['quoteNumber', 'ANG-2026-889'], ['product', 'Raps Ernte 2026'], ['quantityTons', 80],
        ['unitPriceEur', 512], ['validUntil', '2026-09-20'],
      ]),
    },
  }),
  task('task-bs-2', BS, 'revise_quote', 'Angebot Rev. 1 — 510,50 €/t', ['ev-bs-03', 'ev-bs-04'], {
    state: 'awaiting_approval',
    erp: {
      kind: 'quote', quoteNumber: 'ANG-2026-889', product: 'Raps Ernte 2026', quantityTons: 80,
      unitPriceEur: 510.5, validUntil: '2026-09-22', revision: 1,
      fields: F([
        ['quoteNumber', 'ANG-2026-889'], ['revision', 1], ['product', 'Raps Ernte 2026'],
        ['quantityTons', 80], ['unitPriceEur', 510.5], ['validUntil', '2026-09-22'],
        ['margin', '4,2 %', 'ok', 'Über Mindestmarge'],
      ]),
    },
    comm: draft(SCHMIDT, 'Nachfrage ANG-2026-889 Rev. 1', 'Passt 510,50 €/t?'),
  }),
  task('task-ls-1', LS, 'delivery_note', 'Lieferschein LS-78421 erfassen', ['ev-ls-01'], {
    erp: {
      kind: 'delivery_note', deliveryNoteNumber: 'LS-78421', product: 'Weizen',
      declaredTons: 120, actualTons: 116.4, warehouse: 'Lager Nord',
      fields: F([
        ['deliveryNoteNumber', 'LS-78421'], ['product', 'Weizen', 'ok', undefined, 'ART-WEI-A'],
        ['declaredTons', 120], ['actualTons', 116.4, 'error', 'Abweichung −3 % über Toleranz'],
        ['warehouse', 'Lager Nord', 'ok', undefined, 'LAG-NORD'],
      ]),
    },
  }),
  task('task-ls-2', LS, 'weighbridge', 'Waagenticket WS-99102 — Abweichung', ['ev-ls-02'], {
    confidence: 'medium',
    erp: {
      kind: 'weighbridge', ticketNumber: 'WS-99102', declaredTons: 120, weighedTons: 116.4,
      deviationPercent: -3, vehiclePlate: 'OS-AL 441',
      fields: F([
        ['ticketNumber', 'WS-99102'], ['declaredTons', 120], ['weighedTons', 116.4],
        ['deviationPercent', -3, 'error', 'Über Toleranz'], ['vehiclePlate', 'OS-AL 441'],
      ]),
    },
    decisions: [{ id: 'dec-ls-1', label: 'Umgang mit Mengendifferenz', options: [
      { id: 'opt-recalc', label: 'Nachberechnung 116,4 t', consequence: 'Gutschrift Lieferant' },
      { id: 'opt-kulanz', label: 'Kulanz — 120 t belassen', consequence: 'Differenz intern' },
      { id: 'opt-claim', label: 'Reklamation Frachtführer', consequence: 'Neuer Prozess' },
    ] }],
    comm: draft(ALO, 'Differenz LS-78421', 'LS-78421: 116,4 statt 120 t (−3 %).'),
  }),
  task('task-rk-1', RK, 'complaint', 'Reklamation Feuchte Mais — Haftung klären', ['ev-rk-01', 'ev-rk-03'], {
    state: 'blocked', confidence: 'low', blockingReason: 'Haftung offen — Kunde vs. Frachtführer.',
    erp: {
      kind: 'complaint', complaintRef: 'REK-2026-044', category: 'Qualität / Feuchtigkeit',
      relatedDelivery: 'Tour GF-228', claimedAmountEur: 1850,
      fields: F([
        ['complaintRef', 'REK-2026-044'], ['category', 'Qualität / Feuchtigkeit'],
        ['relatedDelivery', 'Tour GF-228'], ['claimedAmountEur', 1850, 'warning', 'Nicht freigegeben'],
        ['moisture', '16,8 % (Soll ≤15 %)', 'error', 'Grenzwert überschritten'],
        ['carrierClaim', '14,2 % bei Verladung', 'warning', 'Widerspruch'],
      ]),
    },
    decisions: [{ id: 'dec-rk-1', label: 'Haftungsentscheidung', options: [
      { id: 'opt-customer', label: 'Volle Gutschrift Kunde (1.850 €)', consequence: 'Kosten AgroHub' },
      { id: 'opt-5050', label: '50/50 Kulanz', consequence: '925 € je Partei' },
      { id: 'opt-carrier', label: 'Volle Belastung Frachtführer', consequence: 'Konfliktrisiko' },
      { id: 'opt-lab', label: 'Externe Gegenprobe', consequence: 'Zeit + Kosten' },
    ] }],
    comm: draft(
      ['qualitaet@hof-meyer.example', 'dispo@gruenfeld-spedition.example'],
      'REK-2026-044', 'Wir prüfen die Feuchtewerte.',
    ),
  }),
  task('task-zb-1', ZB, 'certification', 'Bio-Zertifikat ÖkoHof Linden anlegen', ['ev-zb-01'], {
    erp: {
      kind: 'certification', certificateType: 'Bio EU', certificateNumber: 'DE-ÖKO-039-2026-1188',
      validUntil: '2027-12-31', product: 'Bio-Getreide (Sortiment)',
      fields: F([
        ['certificateType', 'Bio EU'], ['certificateNumber', 'DE-ÖKO-039-2026-1188'],
        ['validUntil', '2027-12-31'], ['supplier', 'ÖkoHof Linden', 'ok', undefined, 'LIF-30007'],
        ['product', 'Bio-Getreide (Sortiment)'],
      ]),
    },
  }),
]
export const initialSelectedProcessId = WM
