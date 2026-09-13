'use client'

import { useEffect, useMemo, useReducer } from 'react'
import { events as seedEvents, initialSelectedProcessId, processes as seedProcesses, tasks as seedTasks } from '@/lib/mockData'
import { processHubReducer } from '@/lib/reducer'
import type { CommunicationDraft, ProcessHubState } from '@/lib/types'
import { ProcessQueue } from './ProcessQueue'
import { ConversationPanel } from './ConversationPanel'
import { ActionPanel } from './ActionPanel'

const initialState: ProcessHubState = {
  processes: seedProcesses,
  events: seedEvents,
  tasks: seedTasks,
  selectedProcessId: initialSelectedProcessId,
  focusedTaskId: null,
}

export function Cockpit() {
  const [state, dispatch] = useReducer(processHubReducer, initialState)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'FOCUS_TASK', taskId: null })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectedProcess =
    state.processes.find((p) => p.id === state.selectedProcessId) ?? null

  const processEvents = useMemo(
    () => state.events.filter((e) => e.processId === state.selectedProcessId),
    [state.events, state.selectedProcessId]
  )

  const processTasks = useMemo(
    () => state.tasks.filter((t) => t.processId === state.selectedProcessId),
    [state.tasks, state.selectedProcessId]
  )

  const focusedTask =
    state.tasks.find((t) => t.id === state.focusedTaskId) ?? null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-2.5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
            PH
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Prozess-Hub</div>
            <div className="text-[11px] text-slate-400">AgroHub GmbH · Innendienst-Cockpit</div>
          </div>
        </div>
        <div className="hidden items-center gap-4 text-[11px] text-slate-400 sm:flex">
          <span>Demo-Prototyp · kein Backend</span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">
            Esc = Fokus entfernen
          </span>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
        <ProcessQueue
          processes={state.processes}
          selectedProcessId={state.selectedProcessId}
          onSelect={(id) => dispatch({ type: 'SELECT_PROCESS', processId: id })}
        />
        <ConversationPanel
          process={selectedProcess}
          events={processEvents}
          tasks={processTasks}
          focusedTaskId={state.focusedTaskId}
          onFocusTask={(taskId) => dispatch({ type: 'FOCUS_TASK', taskId })}
          onUpdateDraft={(taskId, draft: CommunicationDraft) =>
            dispatch({ type: 'UPDATE_COMM_DRAFT', taskId, draft })
          }
          onSend={(processId, draft, linkedTaskId) =>
            dispatch({ type: 'SEND_MESSAGE', processId, draft, linkedTaskId })
          }
        />
        <ActionPanel
          task={focusedTask}
          onUpdateField={(taskId, field, value) =>
            dispatch({ type: 'UPDATE_ERP_FIELD', taskId, field, value })
          }
          onSelectDecision={(taskId, decisionId, optionId) =>
            dispatch({ type: 'SELECT_DECISION', taskId, decisionId, optionId })
          }
          onBookErp={(taskId) => dispatch({ type: 'BOOK_ERP', taskId })}
          onRequestApproval={(taskId) => dispatch({ type: 'REQUEST_APPROVAL', taskId })}
          onCompleteTask={(taskId) => dispatch({ type: 'COMPLETE_TASK', taskId })}
        />
      </div>
    </div>
  )
}
