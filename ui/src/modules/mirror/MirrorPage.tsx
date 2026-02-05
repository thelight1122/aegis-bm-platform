import { useEffect, useState } from "react";
import Section from "../../components/Section";
import { readAll, listBms } from "../../api/endpoints";
import type { AegisReadAll, BuildMasterInfo } from "../../api/types";
import LedgerTabs from "./LedgerTabs";

export default function MirrorPage() {
    const [data, setData] = useState<AegisReadAll>({
        peer: [], pct: [], nct: [], spine: [],
        projects: [], teams: [], tasks: [], runs: []
    });
    const [bms, setBms] = useState<BuildMasterInfo[]>([]);
    const [selectedBmId, setSelectedBmId] = useState<string>("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        refresh();
    }, []);

    async function refresh() {
        setBusy(true);
        setErr("");
        try {
            const [res, bmRes] = await Promise.all([readAll(), listBms()]);
            setData(res);
            setBms(bmRes.bms || []);
        } catch (e: any) {
            setErr(e?.message || "Failed to read ledgers.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="row">
            <div className="col col-full">
                <Section
                    title="Mirror"
                    subtitle="Read-only reflection of all AEGIS ledgers. No scoring, no correction—only preserved reality."
                >
                    {err ? <div className="small text-warn">{err}</div> : null}

                    <div className="row row-between flex-align-end">
                        <div className="row flex-align-end grid-gap-12">
                            <button className="btn primary" onClick={refresh} disabled={busy}>
                                {busy ? "Reading…" : "Refresh"}
                            </button>

                            <div>
                                <label className="label">Observe Build Master</label>
                                <select
                                    className="select min-w-200"
                                    title="Choose Build Master to Observe"
                                    value={selectedBmId}
                                    onChange={e => setSelectedBmId(e.target.value)}
                                >
                                    <option value="">-- All Observations --</option>
                                    {bms.map(bm => (
                                        <option key={bm.bmId} value={bm.bmId}>{bm.displayName} ({bm.bmId})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="spacer-12" />

                    <LedgerTabs data={data} selectedBmId={selectedBmId} />
                </Section>
            </div>
        </div>
    );
}
