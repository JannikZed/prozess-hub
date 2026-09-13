# Prozess-Hub — AgroHub GmbH (Demo-Prototyp)

Clickable Next.js (App Router) + React + TypeScript + Tailwind UI prototype for the Innendienst cockpit. **No backend, no real ERP, no real AI** — all state is in-memory mock data.

## Start

```bash
cd /workspace/prozess-hub
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Scenario IDs

| ID | Description |
|---|---|
| `proc-weizen-meyer` | Weizen-Abrufe (Batch 5) aus Rahmenvertrag — WhatsApp/E-Mail/Telefon, `contract_call`, ERP-bereit |
| `proc-preisupdate-nordkorn` | Lieferanten-Preisupdate Gerste mit Warnungen und Freigabeentscheidung |
| `proc-angebot-bauer-schmidt` | Angebot/Revision Raps — wartet auf Partnerantwort |
| `proc-lieferschein-abweichung` | Lieferschein + Waagenabweichung (−3 %), Entscheidung erforderlich |
| `proc-reklamation-fracht` | Reklamation Feuchte Mais vs. Frachtführer — blockierte Entscheidung |
| `proc-zertifikat-bio` | Bio-Zertifikat Nachreichung (Intake) |

## Key files

- `src/lib/types.ts` — data model (Process, TimelineEvent, Task, ErpDraft union, …)
- `src/lib/mockData.ts` — all scenarios, events, tasks
- `src/lib/reducer.ts` — in-memory mutations (select, focus, send, book, approve, complete)
- `src/components/Cockpit.tsx` — 3-column shell
- `src/components/ProcessQueue.tsx` — left workqueue + filters
- `src/components/ConversationPanel.tsx` — center timeline, task stack, compose
- `src/components/ActionPanel.tsx` — right ERP form, decisions, mock actions

## UX notes

- Desktop layout (~1280px+): left queue · center conversation · right actions
- Esc clears task focus
- German UI labels throughout
