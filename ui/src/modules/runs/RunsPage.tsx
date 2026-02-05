import { useEffect, useState, useRef } from "react";
import Section from "../../components/Section";
import { getProjects, getTeams, getRuns, createRun, getRunEvents, getTools, startAgent, pauseAgent, resumeAgent, stopAgent } from "../../api/endpoints";
import type { Project, Team, Run, RunEvent, Tool } from "../../api/types";
import { storage, STORAGE_KEYS, clearDeploySelection } from "../../services/storage";
import ToolCallPanel from "./ToolCallPanel";

export default function RunsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [runs, setRuns] = useState<Run[]>([]);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
    const [events, setEvents] = useState<RunEvent[]>([]);

    // Deploy Form
    const [selProject, setSelProject] = useState(storage.get(STORAGE_KEYS.SELECTED_PROJECT_ID) || "");
    const [selTeam, setSelTeam] = useState(storage.get(STORAGE_KEYS.SELECTED_TEAM_ID) || "");
    const [allTools, setAllTools] = useState<Tool[]>([]);
    const [selTools, setSelTools] = useState<string[]>([]);

    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [showRestoreNote, setShowRestoreNote] = useState(false);
    const [showClearNote, setShowClearNote] = useState(false);

    const firstLoadRef = useRef(true);
    const noteTimerRef = useRef<any>(null);
    const pollRef = useRef<any>(null);

    const refreshMeta = async () => {
        try {
            const [pRes, tRes, rRes, toolRes] = await Promise.all([getProjects(), getTeams(), getRuns(), getTools()]);
            setProjects(pRes.projects || []);
            setTeams(tRes.teams || []);
            setRuns(rRes.runs || []);
            setAllTools(toolRes.tools || []);

            // Validate saved selections
            let restored = false;
            if (selProject) {
                if (pRes.projects.some(p => p.projectId === selProject)) restored = true;
                else setSelProject("");
            }
            if (selTeam) {
                if (tRes.teams.some(t => t.teamId === selTeam)) restored = true;
                else setSelTeam("");
            }

            if (firstLoadRef.current && restored) {
                setShowRestoreNote(true);
                if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
                noteTimerRef.current = setTimeout(() => setShowRestoreNote(false), 3500);
            }
            firstLoadRef.current = false;
        } catch (e: any) {
            setErr("Metadata sync gap: " + e.message);
        }
    };

    const startExecution = async () => {
        if (!selProject || !selTeam) return;
        setBusy(true);
        setErr("");
        try {
            const res = await createRun({ projectId: selProject, teamId: selTeam, toolIds: selTools });
            setSelectedRunId(res.runId);
            await refreshMeta();
        } catch (e: any) {
            setErr("Start failed: " + e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleClearSelection = () => {
        clearDeploySelection();
        setSelProject("");
        setSelTeam("");
        setSelTools([]);
        setShowRestoreNote(false);
        setShowClearNote(true);
        setTimeout(() => setShowClearNote(false), 3000);
    };

    // Poll for events when a run is selected
    useEffect(() => {
        if (!selectedRunId) {
            setEvents([]);
            if (pollRef.current) clearInterval(pollRef.current);
            return;
        }

        const fetchEvents = async (initial = false) => {
            try {
                // Determine seq to fetch after
                const lastSeq = initial ? -1 : (events.length > 0 ? events[events.length - 1].seq : -1);
                const res = await getRunEvents(selectedRunId, initial ? undefined : lastSeq);

                if (initial) {
                    setEvents(res.events);
                } else if (res.events.length > 0) {
                    setEvents(prev => [...prev, ...res.events]);
                }

                // If the run status in local list is not 'completed' or 'failed', we might want to refresh meta too
                const currentRun = runs.find(r => r.runId === selectedRunId);
                if (currentRun && currentRun.status !== 'completed' && currentRun.status !== 'failed' && currentRun.status !== 'halted') {
                    // Optional: refreshMeta periodically or on specific event kind
                }

            } catch (e: any) {
                console.warn("Event tailing gap:", e.message);
            }
        };

        fetchEvents(true);
        pollRef.current = setInterval(() => fetchEvents(false), 2000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [selectedRunId]); // We re-poll whenever selectedRunId changes

    useEffect(() => {
        refreshMeta();
        const metaPoll = setInterval(refreshMeta, 5000);
        return () => {
            clearInterval(metaPoll);
            if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
        };
    }, []);

    const activeRun = runs.find(r => r.runId === selectedRunId);

    const deriveAgentState = () => {
        if (!events.length) return null;
        const agentSessions = events.filter(e => e.kind === 'agent.requested' || e.kind === 'agent.started');
        if (!agentSessions.length) return null;
        const latestSessionId = agentSessions[agentSessions.length - 1].data_json?.agentSessionId;
        if (!latestSessionId) return null;

        const sessionEvents = events.filter(e => e.data_json?.agentSessionId === latestSessionId);
        let state: 'idle' | 'running' | 'paused' | 'stopped' | 'completed' = 'idle';
        for (const ev of sessionEvents) {
            if (ev.kind === 'agent.started') state = 'running';
            if (ev.kind === 'agent.paused') state = 'paused';
            if (ev.kind === 'agent.resumed') state = 'running';
            if (ev.kind === 'agent.stopped') state = 'stopped';
            if (ev.kind === 'agent.completed') state = 'completed';
        }
        return { sessionId: latestSessionId, state };
    };

    const agentMeta = deriveAgentState();

    const triggerAgent = async (mode: "once" | "untilComplete" = "once") => {
        if (!selectedRunId) return;
        setBusy(true);
        try {
            await startAgent(selectedRunId, mode);
        } catch (e: any) {
            setErr("Agent start failed: " + e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleAgentAction = async (action: 'pause' | 'resume' | 'stop') => {
        if (!selectedRunId || !agentMeta?.sessionId) return;
        setBusy(true);
        try {
            if (action === 'pause') await pauseAgent(selectedRunId, agentMeta.sessionId);
            if (action === 'resume') await resumeAgent(selectedRunId, agentMeta.sessionId);
            if (action === 'stop') await stopAgent(selectedRunId, agentMeta.sessionId);
        } catch (e: any) {
            setErr(`Agent ${action} failed: ` + e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="row">
            {/* Deploy Panel & History */}
            <div className="col col-1-3">
                <Section title="Deploy Panel" subtitle="Execute a run in a workspace formation.">
                    <div className="row row-between flex-align-start">
                        <label className="label">Select Project</label>
                        {showRestoreNote && <div className="fs-10 text-accent italic fade-out">Restored last selection.</div>}
                    </div>
                    <select
                        title="Select Project"
                        className="select"
                        value={selProject}
                        onChange={e => {
                            setShowRestoreNote(false);
                            setSelProject(e.target.value);
                            storage.set(STORAGE_KEYS.SELECTED_PROJECT_ID, e.target.value);
                        }}
                    >
                        <option value="">-- Select Project --</option>
                        {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.name}</option>)}
                    </select>

                    <select
                        title="Select Team"
                        className="select"
                        value={selTeam}
                        onChange={e => {
                            setShowRestoreNote(false);
                            setSelTeam(e.target.value);
                            storage.set(STORAGE_KEYS.SELECTED_TEAM_ID, e.target.value);
                        }}
                    >
                        <option value="">-- Select Team --</option>
                        {teams.map(t => <option key={t.teamId} value={t.teamId}>{t.name}</option>)}
                    </select>

                    <label className="label">Bond Tools (Autonomy Surface)</label>
                    <div className="bg-surface p-8 br-4 border-line scroll-y-200">
                        {allTools.map(t => (
                            <label key={t.name} className="row row-between mb-4 pointer hover-bg px-6 py-2 br-4">
                                <span className="small">{t.name}</span>
                                <input
                                    type="checkbox"
                                    checked={selTools.includes(t.name)}
                                    onChange={e => {
                                        if (e.target.checked) setSelTools([...selTools, t.name]);
                                        else setSelTools(selTools.filter(id => id !== t.name));
                                    }}
                                />
                            </label>
                        ))}
                    </div>

                    <div className="row row-between mt-8">
                        <button className="btn-link fs-10" onClick={handleClearSelection}>Clear saved selection</button>
                        {showClearNote && <div className="fs-10 text-accent italic fade-out">Saved selection cleared.</div>}
                    </div>

                    <div className="spacer-12" />
                    {!selProject || !selTeam ? (
                        <div className="small text-muted mb-8 italic">
                            Select a Project and Team to start a run.
                        </div>
                    ) : null}
                    <button className="btn primary w-full" onClick={startExecution} disabled={busy || !selProject || !selTeam}>
                        {busy ? "Starting…" : "Start Run"}
                    </button>
                    {err && <div className="small text-warn mt-8">{err}</div>}
                </Section>

                <div className="spacer-12" />

                <Section title="Run History" subtitle="Recent workspace executions.">
                    <div className="grid-gap-12">
                        {runs.length === 0 && <div className="small text-muted italic">No history recorded.</div>}
                        {runs.map(r => (
                            <div
                                key={r.runId}
                                className={`card card-pad-8 pointer ${selectedRunId === r.runId ? 'border-accent' : ''}`}
                                onClick={() => setSelectedRunId(r.runId)}
                            >
                                <div className="row row-between mb-4">
                                    <div className="small mono">{r.runId}</div>
                                    <div className={`badge fs-10 ${r.status === 'completed' ? 'text-ok' : ''}`}>{r.status}</div>
                                </div>
                                <div className="small text-muted">{new Date(r.createdTs).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            {/* Run Detail & Live Output */}
            <div className="col col-2-3">
                <Section
                    title={selectedRunId ? `Run: ${selectedRunId}` : "Observation Deck"}
                    subtitle={selectedRunId ? "Observing live workspace events." : "Select a run to observe output."}
                >
                    {!selectedRunId ? (
                        <div className="card card-pad-12 text-muted italic">
                            Reality is being recorded. Select a run from history or start a new formation to observe its evolution.
                        </div>
                    ) : (
                        <div>
                            <div className="row row-between mb-12">
                                <div className="row grid-gap-12">
                                    <div className="badge">Status: {activeRun?.status || "unknown"}</div>
                                    <div className="badge">Project: {activeRun?.projectId}</div>
                                </div>
                                <button className="small mono" onClick={() => setSelectedRunId(null)}>Close</button>
                            </div>

                            <label className="label">Live Event Stream</label>
                            <div className="bg-surface p-12 br-4 mono fs-11 scroll-y-600 border-line">
                                {!events.length && <div className="text-muted">Waiting for events...</div>}
                                {events.map(ev => (
                                    <div key={ev.id} className="mb-4">
                                        <span className="text-muted mr-8">[{new Date(ev.ts).toLocaleTimeString()}]</span>
                                        <span className={`mr-8 badge fs-10 ${ev.kind === 'error' || ev.kind === 'agent.errored' ? 'bg-warn' :
                                            ev.kind === 'system' ? 'text-accent' :
                                                ev.kind.startsWith('agent.pause') || ev.kind === 'agent.paused' ? 'bg-warn' :
                                                    ev.kind.startsWith('agent.') ? 'text-ok' :
                                                        ev.kind === 'tool_call' || (ev.data_json?.kind?.startsWith('tool.')) || ev.kind.startsWith('tool.') ? 'text-accent2' :
                                                            ev.kind === 'tool_result' ? 'text-ok' : ''
                                            }`}>
                                            {ev.data_json?.kind || ev.kind.toUpperCase()}
                                        </span>
                                        <span className={ev.kind === 'tool_call' || ev.kind === 'tool_result' || ev.data_json?.toolId || ev.kind.startsWith('agent.') ? 'mono text-accent2' : ''}>
                                            {ev.message}
                                        </span>
                                        {ev.data_json && (
                                            <div className="mt-4">
                                                {ev.data_json.correlationId && (
                                                    <div className="small text-muted mono mb-2">Correlation: {ev.data_json.correlationId}</div>
                                                )}
                                                {(ev.kind === 'tool_call' || ev.kind === 'tool_result' || ev.data_json.output) && (
                                                    <pre className="fs-10 bg-panel p-8 br-4 border-line text-muted scroll-x">
                                                        {JSON.stringify(ev.data_json.input || ev.data_json.output || ev.data_json.args || ev.data_json, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {activeRun?.status === 'running' && (
                                <div className="mt-12 bg-surface p-12 br-4 border-line">
                                    <div className="row row-between mb-8">
                                        <div className="h2 small">Sovereign Agent Control</div>
                                        <div className="row grid-gap-8">
                                            {(!agentMeta || agentMeta.state === 'completed' || agentMeta.state === 'stopped') && (
                                                <>
                                                    <button className="btn secondary small" onClick={() => triggerAgent("once")} disabled={busy}>Run One Step</button>
                                                    <button className="btn primary small" onClick={() => triggerAgent("untilComplete")} disabled={busy}>Start Agent</button>
                                                </>
                                            )}
                                            {agentMeta?.state === 'running' && (
                                                <>
                                                    <button className="btn small" onClick={() => handleAgentAction('pause')} disabled={busy}>Pause Agent</button>
                                                    <button className="btn small bg-warn" onClick={() => handleAgentAction('stop')} disabled={busy}>Stop Agent</button>
                                                </>
                                            )}
                                            {agentMeta?.state === 'paused' && (
                                                <>
                                                    <button className="btn primary small" onClick={() => handleAgentAction('resume')} disabled={busy}>Resume Agent</button>
                                                    <button className="btn small bg-warn" onClick={() => handleAgentAction('stop')} disabled={busy}>Stop Agent</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {busy && <div className="fs-10 italic text-accent mb-8">Signal requested and being recorded in ledger...</div>}
                                    {agentMeta?.state === 'running' && events.some(e => e.kind === 'agent.pause_requested' && e.ts > events.filter(x => x.kind === 'agent.paused').pop()?.ts!) && (
                                        <div className="fs-10 italic text-muted mb-8">Pause requested. It will take effect after the current step completes.</div>
                                    )}
                                    {agentMeta?.state === 'running' && events.some(e => e.kind === 'agent.stop_requested') && (
                                        <div className="fs-10 italic text-muted mb-8">Stop requested. It will take effect after the current step completes.</div>
                                    )}
                                    <ToolCallPanel
                                        runId={selectedRunId}
                                        bondedTools={allTools.filter(t => activeRun.toolIds?.includes(t.name))}
                                    />
                                </div>
                            )}

                            {activeRun?.status === 'completed' && (
                                <div className="mt-12 badge text-ok">
                                    Observation cycle concluded. Persistence preserved in ledger.
                                </div>
                            )}
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}
