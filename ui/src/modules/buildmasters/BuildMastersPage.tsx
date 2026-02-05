import { useCallback, useEffect, useMemo, useState } from "react";
import Section from "../../components/Section";
import { createBm, listBms, listTools, runBm } from "../../api/endpoints";
import type { BuildMasterInfo, DataQuad } from "../../api/types";
import DataQuadEditor from "./DataQuadEditor";

export default function BuildMastersPage() {
    const [bms, setBms] = useState<BuildMasterInfo[]>([]);
    const [tools, setTools] = useState<{ name: string; description: string }[]>([]);
    const [selected, setSelected] = useState<string>("");
    const [displayName, setDisplayName] = useState<string>("BM-One");
    const [bmId, setBmId] = useState<string>("");
    const [dq, setDq] = useState<DataQuad>({ cognitive: {}, affective: {}, operational: {}, relational: {} });

    const [inputText, setInputText] = useState<string>("hello");
    const [output, setOutput] = useState<string>("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string>("");
    const existingSelectId = "bm-existing-select";
    const displayNameId = "bm-display-name";
    const bmIdInputId = "bm-id-input";
    const runInputId = "bm-run-input";

    const refresh = useCallback(async () => {
        setErr("");
        try {
            const [bmRes, toolRes] = await Promise.all([listBms(), listTools()]);
            setBms(bmRes.bms);
            setTools(toolRes.tools);
            setSelected((prev) => prev || (bmRes.bms[0]?.bmId ?? ""));
        } catch (e: any) {
            setErr(e?.message || "Failed to load backend data.");
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const selectedBm = useMemo(() => bms.find((b) => b.bmId === selected), [bms, selected]);

    async function handleCreate() {
        setBusy(true);
        setErr("");
        try {
            const res = await createBm({ bmId: bmId || undefined, displayName, dataquad: dq });
            await refresh();
            setSelected(res.bmId);
            setOutput(`Created BM: ${res.displayName} (${res.bmId})`);
        } catch (e: any) {
            setErr(e?.message || "Create failed.");
        } finally {
            setBusy(false);
        }
    }

    async function handleRun() {
        if (!selected) return;
        setBusy(true);
        setErr("");
        try {
            const res = await runBm({ bmId: selected, text: inputText, meta: { source: "ui" } });
            setOutput(res.output.text);
        } catch (e: any) {
            setErr(e?.message || "Run failed.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="row">
            <div className="col">
                <Section
                    title="Build Masters"
                    subtitle="Create, list, and select a Build Master. Identity is stored append-only (DataQuad → PCT)."
                >
                    {err ? <div className="small text-warn">{err}</div> : null}

                    <label className="label" htmlFor={existingSelectId}>Existing Build Masters</label>
                    <select
                        id={existingSelectId}
                        className="select"
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        <option value="" disabled>— select —</option>
                        {bms.map((b) => (
                            <option key={b.bmId} value={b.bmId}>
                                {b.displayName} ({b.bmId})
                            </option>
                        ))}
                    </select>

                    <div className="spacer-12" />

                    <div className="badge">
                        Selected: <span className="mono">{selectedBm ? `${selectedBm.displayName} (${selectedBm.bmId})` : "none"}</span>
                    </div>

                    <div className="spacer-12" />

                    <button className="btn" onClick={refresh} disabled={busy}>Refresh</button>
                </Section>
            </div>

            <div className="col">
                <Section
                    title="Create a Build Master"
                    subtitle="Creation does not score or rank identity. It appends an initial DataQuad record."
                >
                    <label className="label" htmlFor={displayNameId}>Display Name</label>
                    <input
                        id={displayNameId}
                        className="input"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />

                    <label className="label" htmlFor={bmIdInputId}>Optional BM ID (leave blank for auto)</label>
                    <input
                        id={bmIdInputId}
                        className="input"
                        value={bmId}
                        onChange={(e) => setBmId(e.target.value)}
                        placeholder="bm_custom_id"
                    />

                    <div className="spacer-12" />

                    <DataQuadEditor value={dq} onChange={setDq} />

                    <div className="spacer-12" />

                    <button className="btn primary" onClick={handleCreate} disabled={busy}>
                        {busy ? "Working…" : "Create BM"}
                    </button>
                </Section>
            </div>

            <div className="col col-full">
                <Section
                    title="Run a Single Cycle"
                    subtitle="Runs observe → decide → act → record. Use /tool to call tools (agent-side), recorded by AEGIS."
                >
                    <div className="row">
                        <div className="col">
                            <label className="label" htmlFor={runInputId}>Input</label>
                            <input
                                id={runInputId}
                                className="input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="small mt-10">
                                Tool syntax: <span className="mono">/tool time {"{}"}</span> or <span className="mono">/tool echo {"{\"x\":1}"}</span>
                            </div>

                            <div className="spacer-12" />
                            <button className="btn primary" onClick={handleRun} disabled={!selected || busy}>
                                {busy ? "Running…" : "Run BM once"}
                            </button>
                        </div>

                        <div className="col">
                            <label className="label">Output</label>
                            <div className="card card-pad-12">
                                <div className="mono pre-wrap">{output || "—"}</div>
                            </div>

                            <div className="spacer-12" />

                            <div className="h2">Available Tools</div>
                            <div className="small">
                                {tools.length ? tools.map((t) => (
                                    <div key={t.name} className="tool-item">
                                        <span className="mono">{t.name}</span> — {t.description}
                                    </div>
                                )) : "No tools loaded."}
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
