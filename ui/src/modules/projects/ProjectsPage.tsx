import { useEffect, useState } from "react";
import Section from "../../components/Section";
import { createProject, listProjects } from "../../api/endpoints";
import type { Project } from "../../api/types";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [name, setName] = useState("");
    const [repo, setRepo] = useState("");
    const [localPath, setLocalPath] = useState("");
    const [defaultBranch, setDefaultBranch] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    const refresh = async () => {
        try {
            const res = await listProjects();
            setProjects(res.projects || []);
        } catch (e: any) {
            setErr(e.message);
        }
    };

    useEffect(() => { refresh(); }, []);

    const handleCreate = async () => {
        setBusy(true);
        try {
            await createProject({ name, repo, localPath, defaultBranch });
            setName("");
            setRepo("");
            setLocalPath("");
            setDefaultBranch("");
            await refresh();
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="row">
            <div className="col">
                <Section title="Projects" subtitle="Workspace targets for AEGIS orchestration.">
                    {err && <div className="small text-warn">{err}</div>}
                    <div className="grid-gap-12">
                        {projects.length === 0 && <div className="small text-muted">No projects recorded.</div>}
                        {projects.map(p => (
                            <div key={p.projectId} className="card card-pad-12">
                                <div className="h2">{p.name}</div>
                                <div className="small mono text-muted">{p.projectId}</div>
                                {p.repo && <div className="small"><strong>Repo:</strong> {p.repo}</div>}
                                {p.localPath && <div className="small"><strong>Path:</strong> {p.localPath}</div>}
                                {p.defaultBranch && <div className="small"><strong>Branch:</strong> {p.defaultBranch}</div>}
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
            <div className="col">
                <Section title="New Project" subtitle="Define a target for BMs to operate within.">
                    <label className="label">Project Name</label>
                    <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Project Name" />

                    <label className="label">Repo URL (optional)</label>
                    <input className="input" value={repo} onChange={e => setRepo(e.target.value)} placeholder="https://github.com/..." />

                    <label className="label">Local Path (optional)</label>
                    <input className="input" value={localPath} onChange={e => setLocalPath(e.target.value)} placeholder="/workspace/my-app" />

                    <label className="label">Default Branch (optional)</label>
                    <input className="input" value={defaultBranch} onChange={e => setDefaultBranch(e.target.value)} placeholder="main" />

                    <div className="spacer-12" />
                    <button className="btn primary" onClick={handleCreate} disabled={!name || busy}>
                        {busy ? "Creating..." : "Create Project"}
                    </button>
                </Section>
            </div>
        </div>
    );
}
