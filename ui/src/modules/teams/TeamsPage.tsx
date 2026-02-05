import { useEffect, useState } from "react";
import Section from "../../components/Section";
import { createTeam, listBms, listTeams } from "../../api/endpoints";
import type { Team, BuildMasterInfo, TeamMember } from "../../api/types";

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [bms, setBms] = useState<BuildMasterInfo[]>([]);
    const [name, setName] = useState("");
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    const [selectedBmId, setSelectedBmId] = useState("");
    const [memberRole, setMemberRole] = useState("");

    const refresh = async () => {
        try {
            const [tRes, bRes] = await Promise.all([listTeams(), listBms()]);
            setTeams(tRes.teams || []);
            setBms(bRes.bms || []);
            if (bRes.bms && bRes.bms.length > 0) setSelectedBmId(bRes.bms[0].bmId);
        } catch (e: any) {
            setErr(e.message);
        }
    };

    useEffect(() => { refresh(); }, []);

    const addMember = () => {
        if (!selectedBmId) return;
        const alreadyIn = members.find(m => m.bmId === selectedBmId);
        if (alreadyIn) return;

        setMembers([...members, { bmId: selectedBmId, role: memberRole || "Member" }]);
        setMemberRole("");
    };

    const removeMember = (id: string) => {
        setMembers(members.filter(m => m.bmId !== id));
    };

    const handleCreate = async () => {
        setBusy(true);
        try {
            await createTeam({ name, members });
            setName("");
            setMembers([]);
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
                <Section title="Teams" subtitle="Named formations of Build Masters.">
                    {err && <div className="small text-warn">{err}</div>}
                    <div className="grid-gap-12">
                        {teams.length === 0 && <div className="small text-muted">No teams recorded.</div>}
                        {teams.map(t => (
                            <div key={t.teamId} className="card card-pad-12">
                                <div className="h2">{t.name}</div>
                                <div className="small mono text-muted">{t.teamId}</div>
                                <div className="spacer-8" />
                                {t.members.map(m => (
                                    <div key={m.bmId} className="small">
                                        <strong>{m.role}:</strong> {m.bmId}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
            <div className="col">
                <Section title="New Team" subtitle="Group BMs for task execution.">
                    <label className="label">Team Name</label>
                    <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Core Architects" />

                    <div className="hr" />

                    <label className="label">Add Member</label>
                    <div className="row">
                        <select
                            title="Select Build Master"
                            className="select flex-2"
                            value={selectedBmId}
                            onChange={e => setSelectedBmId(e.target.value)}
                        >
                            {bms.map(bm => <option key={bm.bmId} value={bm.bmId}>{bm.displayName}</option>)}
                        </select>
                        <input
                            className="input flex-1 min-w-80"
                            value={memberRole}
                            onChange={e => setMemberRole(e.target.value)}
                            placeholder="Role"
                        />
                        <button className="btn" onClick={addMember}>Add</button>
                    </div>

                    <div className="spacer-12" />
                    <label className="label">Current Members</label>
                    <div className="card-pad-12 card fs-11">
                        {members.length === 0 && <div className="text-muted italic">No members added yet.</div>}
                        {members.map(m => (
                            <div key={m.bmId} className="row row-between py-4">
                                <span><strong>{m.role}:</strong> {m.bmId}</span>
                                <button className="small mono text-warn" onClick={() => removeMember(m.bmId)}>remove</button>
                            </div>
                        ))}
                    </div>

                    <div className="spacer-12" />
                    <button className="btn primary" onClick={handleCreate} disabled={!name || members.length === 0 || busy}>
                        {busy ? "Creating..." : "Create Team"}
                    </button>
                </Section>
            </div>
        </div>
    );
}
