import { useEffect, useState } from "react";
import Section from "../../components/Section";
import { deployRecord, listBms } from "../../api/endpoints";
import type { BuildMasterInfo } from "../../api/types";

export default function DeployDepotPage() {
    const [bms, setBms] = useState<BuildMasterInfo[]>([]);
    const [bmId, setBmId] = useState<string>("");
    const [pattern, setPattern] = useState<string>("formation:solo-loop");
    const [evidenceRefs, setEvidenceRefs] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string>("");
    const bmSelectId = "deploy-bm-select";
    const patternId = "deploy-pattern";
    const evidenceId = "deploy-evidence";

    useEffect(() => {
        (async () => {
            try {
                const res = await listBms();
                setBms(res.bms);
                if (res.bms.length) setBmId(res.bms[0].bmId);
            } catch (e: any) {
                setErr(e?.message || "Failed to load Build Masters.");
            }
        })();
    }, []);

    async function record() {
        if (!bmId) return;
        setBusy(true);
        setErr("");
        setResult("");
        try {
            const refs = evidenceRefs.split(",").map(s => s.trim()).filter(Boolean);
            const res = await deployRecord({
                bmId,
                pattern,
                evidenceRefs: refs.length ? refs : undefined
            });
            setResult(`Recorded SPINE formation: ${res.record?.id ?? "(id unavailable)"}`);
        } catch (e: any) {
            setErr(e?.message || "Record failed.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="row">
            <div className="col">
                <Section
                    title="Deploy Depot"
                    subtitle="Deployment records formations (SPINE). It does not command actions. Append-only."
                >
                    {err ? <div className="small text-warn">{err}</div> : null}

                    <label className="label" htmlFor={bmSelectId}>Build Master</label>
                    <select
                        id={bmSelectId}
                        className="select"
                        value={bmId}
                        onChange={(e) => setBmId(e.target.value)}
                    >
                        <option value="" disabled>— select —</option>
                        {bms.map((b) => (
                            <option key={b.bmId} value={b.bmId}>
                                {b.displayName} ({b.bmId})
                            </option>
                        ))}
                    </select>

                    <label className="label" htmlFor={patternId}>Formation / Pattern Name</label>
                    <input
                        id={patternId}
                        className="input"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                    />

                    <label className="label" htmlFor={evidenceId}>Evidence Refs (optional, comma-separated ids)</label>
                    <input
                        id={evidenceId}
                        className="input"
                        value={evidenceRefs}
                        onChange={(e) => setEvidenceRefs(e.target.value)}
                        placeholder="peer_id_1, peer_id_2"
                    />

                    <div className="spacer-12" />

                    <button className="btn primary" onClick={record} disabled={!bmId || busy}>
                        {busy ? "Recording…" : "Record Formation (SPINE)"}
                    </button>

                    {result ? <div className="small text-ok mt-12">{result}</div> : null}

                    <div className="small mt-12">
                        Tip: evidence refs can point to PEER or NCT ids, but are optional. This is naming—not enforcing.
                    </div>
                </Section>
            </div>

            <div className="col">
                <Section
                    title="Formation Posture"
                    subtitle="A formation is a contextual pattern label. It does not imply rank, score, or success."
                >
                    <div className="small">
                        • Formation names are descriptive<br />
                        • No “best team” logic exists here<br />
                        • SPINE stores recurrence and references, not prescriptions
                    </div>
                </Section>
            </div>
        </div>
    );
}
