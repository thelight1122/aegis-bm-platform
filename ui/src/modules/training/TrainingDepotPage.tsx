import { useEffect, useState } from "react";
import Section from "../../components/Section";
import { listBms, trainingInject } from "../../api/endpoints";
import type { BuildMasterInfo } from "../../api/types";

export default function TrainingDepotPage() {
    const [bms, setBms] = useState<BuildMasterInfo[]>([]);
    const [bmId, setBmId] = useState<string>("");
    const [context, setContext] = useState<string>("exposure:example");
    const [detail, setDetail] = useState<string>("This is an exposure record (NCT). It does not instruct behavior.");
    const [tags, setTags] = useState<string>("exposure,training");
    const [result, setResult] = useState<string>("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string>("");
    const bmSelectId = "training-bm-select";
    const contextId = "training-context";
    const detailId = "training-detail";
    const tagsId = "training-tags";

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

    async function inject() {
        if (!bmId) return;
        setBusy(true);
        setErr("");
        setResult("");
        try {
            const tagList = tags.split(",").map(s => s.trim()).filter(Boolean);
            const res = await trainingInject({
                bmId,
                context,
                detail: detail || undefined,
                tags: tagList.length ? tagList : undefined
            });
            setResult(`Recorded NCT exposure: ${res.record?.id ?? "(id unavailable)"}`);
        } catch (e: any) {
            setErr(e?.message || "Injection failed.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="row">
            <div className="col">
                <Section
                    title="Training Depot"
                    subtitle="Training here is exposure, not instruction. This writes an NCT record—append-only."
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

                    <label className="label" htmlFor={contextId}>Context</label>
                    <input
                        id={contextId}
                        className="input"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                    />

                    <label className="label" htmlFor={detailId}>Detail (optional)</label>
                    <textarea
                        id={detailId}
                        className="textarea"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                    />

                    <label className="label" htmlFor={tagsId}>Tags (comma-separated)</label>
                    <input
                        id={tagsId}
                        className="input"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />

                    <div className="spacer-12" />

                    <button className="btn primary" onClick={inject} disabled={!bmId || busy}>
                        {busy ? "Recording…" : "Record Exposure (NCT)"}
                    </button>

                    {result ? <div className="small text-ok mt-12">{result}</div> : null}

                    <div className="small mt-12">
                        Note: this does not tell the BM what to do. It preserves a narrative exposure that can be reflected later.
                    </div>
                </Section>
            </div>

            <div className="col">
                <Section
                    title="Posture Reminder"
                    subtitle="This UI intentionally avoids metrics. Presence and history are preserved without pressure."
                >
                    <div className="small">
                        • No scoring<br />
                        • No rewards / punishments<br />
                        • No enforced alignment<br />
                        • Append-only records<br />
                        • Sovereign choice remains with the BM
                    </div>
                </Section>
            </div>
        </div>
    );
}
