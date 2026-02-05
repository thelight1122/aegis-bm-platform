import { useId, useMemo, useState } from "react";
import type { AegisReadAll } from "../../api/types";
import KeyValueTable from "../../components/KeyValueTable";

type TabKey = "peer" | "pct" | "nct" | "spine" | "projects" | "teams" | "tasks" | "runs";

export default function LedgerTabs({
    data,
    selectedBmId
}: {
    data: AegisReadAll,
    selectedBmId?: string
}) {
    const [tab, setTab] = useState<TabKey>("peer");
    const [limit, setLimit] = useState<number>(80);
    const limitId = useId();

    const tabs: TabKey[] = ["peer", "pct", "nct", "spine", "projects", "teams", "tasks", "runs"];

    const records = useMemo(() => {
        let list = (data?.[tab] || []) as any[];

        // Filter by BM if selected
        if (selectedBmId) {
            list = list.filter(r => {
                // Check common fields where bmId might reside
                const d = r.data || {};
                return r.bmId === selectedBmId ||
                    d.bmId === selectedBmId ||
                    d.bm_id === selectedBmId ||
                    (Array.isArray(d.members) && d.members.some((m: any) => m.bmId === selectedBmId)) ||
                    (r.type === 'bm_run_output' && d.bmId === selectedBmId);
            });
        }

        return list;
    }, [data, tab, selectedBmId]);

    const sliced = useMemo(() => {
        const list = [...records];
        list.reverse();
        return list.slice(0, limit);
    }, [records, limit]);

    return (
        <div>
            <div className="tabs scroll-x">
                {tabs.map((k) => (
                    <div key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}>
                        {k.toUpperCase()} <span className="small">({((data as any)?.[k] || []).length})</span>
                    </div>
                ))}
            </div>

            <div className="spacer-12" />

            <div className="row flex-align-end grid-gap-12">
                <div className="f-grow">
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
                </div>
                {selectedBmId && (
                    <div className="badge text-ok">
                        Observing: {selectedBmId} ({records.length} matches)
                    </div>
                )}
            </div>

            <div className="spacer-12" />

            {!sliced.length ? (
                <div className="small text-muted italic">No records found {selectedBmId ? "for this Build Master" : ""}.</div>
            ) : (
                <div className="grid-gap-12">
                    {sliced.map((r, idx) => (
                        <div key={r.id ?? idx} className="card card-pad-12">
                            <div className="row row-between mb-8">
                                <div className="badge fs-10 mono">{r.type || r.layer || tab.slice(0, -1).toUpperCase()}</div>
                                <div className="small mono text-muted">{r.timestamp || r.ts}</div>
                            </div>
                            <KeyValueTable data={r.data || r} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
