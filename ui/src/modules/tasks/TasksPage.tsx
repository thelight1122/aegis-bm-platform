import { useEffect, useState } from "react";
import Section from "../../components/Section";
import { createTask, executeRun, listProjects, listTasks, listTeams } from "../../api/endpoints";
import type { Task, Project, Team } from "../../api/types";
import { Link } from "react-router-dom";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    const [title, setTitle] = useState("");
    const [intent, setIntent] = useState("");
    const [constraintsText, setConstraintsText] = useState("");
    const [deliverablesText, setDeliverablesText] = useState("");

    // Deployment state
    const [deployProject, setDeployProject] = useState("");
    const [deployTeam, setDeployTeam] = useState("");
    const [deployTask, setDeployTask] = useState("");

    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [lastRunId, setLastRunId] = useState("");

    const refresh = async () => {
        try {
            const [taRes, prRes, teRes] = await Promise.all([listTasks(), listProjects(), listTeams()]);
            setTasks(taRes.tasks || []);
            setProjects(prRes.projects || []);
            setTeams(teRes.teams || []);
        } catch (e: any) {
            setErr(e.message);
        }
    };

    useEffect(() => { refresh(); }, []);

    const handleCreate = async () => {
        setBusy(true);
        try {
            const constraints = constraintsText.split('\n').filter(s => s.trim().length > 0);
            const deliverables = deliverablesText.split('\n').filter(s => s.trim().length > 0);
            await createTask({ title, intent, constraints, deliverables });
            setTitle("");
            setIntent("");
            setConstraintsText("");
            setDeliverablesText("");
            await refresh();
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    const handleDeploy = async () => {
        setBusy(true);
        setErr("");
        setMsg("");
        setLastRunId("");
        try {
            const res = await executeRun({ projectId: deployProject, teamId: deployTeam, taskId: deployTask });
            setMsg("Run recorded successfully.");
            setLastRunId(res.runId);
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="row">
            <div className="col">
                <Section title="Tasks" subtitle="Objectives for orchestration.">
                    {err && <div className="small text-warn">{err}</div>}
                    <div className="grid-gap-12">
                        {tasks.length === 0 && <div className="small text-muted">No tasks recorded.</div>}
                        {tasks.map(t => (
                            <div key={t.taskId} className="card card-pad-12">
                                <button
                                    className="small mono float-right px-6 py-2 fs-10"
                                    onClick={() => setDeployTask(t.taskId)}
                                >
                                    Select for Run
                                </button>
                                <div className="h2">{t.title}</div>
                                <div className="small mono text-muted">{t.taskId}</div>
                                <div className="small p">{t.intent}</div>
                                {t.constraints && t.constraints.length > 0 && (
                                    <div className="small mt-8">
                                        <strong>Constraints:</strong> {t.constraints.join(', ')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            </div>

            <div className="col">
                <Section title="New Task" subtitle="Define a goal and intent.">
                    <label className="label">Task Title</label>
                    <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Audit Component X" />

                    <label className="label">Intent (Short)</label>
                    <textarea className="textarea" value={intent} onChange={e => setIntent(e.target.value)} placeholder="Verify alignment..." />

                    <label className="label">Constraints (one per line)</label>
                    <textarea className="textarea f-grow min-h-60" value={constraintsText} onChange={e => setConstraintsText(e.target.value)} placeholder="No destructive edits..." />

                    <label className="label">Deliverables (one per line)</label>
                    <textarea className="textarea f-grow min-h-60" value={deliverablesText} onChange={e => setDeliverablesText(e.target.value)} placeholder="Audit Report..." />

                    <div className="spacer-12" />
                    <button className="btn primary" onClick={handleCreate} disabled={!title || !intent || busy}>
                        {busy ? "Creating..." : "Create Task"}
                    </button>
                </Section>
            </div>

            <div className="col col-full">
                <Section title="Deploy / Execute Run" subtitle="Deployment is the naming of a run formation. AEGIS records the outcome.">
                    <div className="row">
                        <div className="col">
                            <label className="label">Select Task</label>
                            <select
                                title="Select Task"
                                className="select"
                                value={deployTask}
                                onChange={e => setDeployTask(e.target.value)}
                            >
                                <option value="" disabled>-- select task --</option>
                                {tasks.map(t => <option key={t.taskId} value={t.taskId}>{t.title} ({t.taskId})</option>)}
                            </select>

                            <label className="label">Select Project</label>
                            <select
                                title="Select Project"
                                className="select"
                                value={deployProject}
                                onChange={e => setDeployProject(e.target.value)}
                            >
                                <option value="" disabled>-- select project --</option>
                                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.name} ({p.projectId})</option>)}
                            </select>

                            <label className="label">Select Team</label>
                            <select
                                title="Select Team"
                                className="select"
                                value={deployTeam}
                                onChange={e => setDeployTeam(e.target.value)}
                            >
                                <option value="" disabled>-- select team --</option>
                                {teams.map(t => <option key={t.teamId} value={t.teamId}>{t.name} ({t.teamId})</option>)}
                            </select>

                            <div className="spacer-12" />
                            <button className="btn primary" onClick={handleDeploy} disabled={!deployTask || !deployProject || !deployTeam || busy}>
                                {busy ? "Executing..." : "Execute Run (Deploy)"}
                            </button>
                        </div>
                        <div className="col">
                            <label className="label">Status / Message</label>
                            <div className="card card-pad-12">
                                {msg ? (
                                    <>
                                        <div className="text-ok">{msg}</div>
                                        <div className="spacer-8" />
                                        {lastRunId && <Link to="/runs" className="small underline">View in Runs ledger →</Link>}
                                    </>
                                ) : <div className="text-muted">—</div>}
                                {err && <div className="text-warn mt-8">{err}</div>}
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
