import { useId, useMemo, useState } from "react";
import type { AegisReadAll } from "../../api/types";
import KeyValueTable from "../../components/KeyValueTable";

type TabKey = "peer" | "pct" | "nct" | "spine";

export default function LedgerTabs({ data }: { data: AegisReadAll }) {
    const [tab, setTab] = useState<TabKey>("peer");
    const [limit, setLimit] = useState<number>(80);
    const records = (data?.[tab] || []) as any[];
    const limitId = useId();

    const sliced = useMemo(() => {
        const list = [...records];
        list.reverse();
        return list.slice(0, limit);
    }, [records, limit]);

    return (
        <div>
            <div className="tabs">
                {(["peer", "pct", "nct", "spine"] as TabKey[]).map((k) => (
                    <div key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>
                        {k.toUpperCase()} <span className="small">({records.length})</span>
                    </div>
                ))}
            </div>

            <div className="spacer-12" />

            <label className="label" htmlFor={limitId}>Show most recent N records</label>
            <input
                id={limitId}
                className="input"
                type="number"
                min={10}
                max={500}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
            />

            <div className="spacer-12" />

            {!sliced.length ? (
                <div className="small">No records.</div>
            ) : (
                <div className="grid-gap-12">
                    {sliced.map((r, idx) => (
                        <div key={r.id ?? idx} className="card card-pad-12">
                            <div className="badge">
                                <span className="mono">{r.layer}</span>
                                <span className="mono">{r.ts}</span>
                                {r.bmId ? <span className="mono">{r.bmId}</span> : null}
                                {r.label ? <span className="mono">{r.label}</span> : null}
                            </div>
                            <div className="spacer-10" />
                            <KeyValueTable data={r} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
