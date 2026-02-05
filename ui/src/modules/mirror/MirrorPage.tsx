import { useEffect, useState } from "react";
import Section from "../../components/Section";
import { readAll } from "../../api/endpoints";
import type { AegisReadAll } from "../../api/types";
import LedgerTabs from "./LedgerTabs";

export default function MirrorPage() {
    const [data, setData] = useState<AegisReadAll>({ peer: [], pct: [], nct: [], spine: [] });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        refresh();
    }, []);

    async function refresh() {
        setBusy(true);
        setErr("");
        try {
            const res = await readAll();
            setData(res);
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
                    subtitle="Read-only reflection of PEER/PCT/NCT/SPINE. No scoring, no correction—only preserved reality."
                >
                    {err ? <div className="small text-warn">{err}</div> : null}

                    <button className="btn primary" onClick={refresh} disabled={busy}>
                        {busy ? "Reading…" : "Refresh"}
                    </button>

                    <div className="spacer-12" />

                    <LedgerTabs data={data} />
                </Section>
            </div>
        </div>
    );
}
