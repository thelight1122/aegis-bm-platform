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
    const [dq, setDq] = useState<DataQuad>({
        cognitive: { focus: "Structural Integrity", logic: "Axiomatic" },
        affective: { posture: "Neutral", wattage: 0.8 },
        operational: { mode: "Synthesis", throughput: "Normal" },
        relational: { peerage: "Sovereign" }
    });

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
            setBms(bmRes?.bms || []);
            setTools(toolRes?.tools || []);
            const firstId = bmRes?.bms?.[0]?.bmId || "";
            setSelected((prev) => prev || firstId);
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
                    title="1) Select an Active Agent"
                    subtitle="Pick a Build Master you've created earlier to give it tasks or review its logs."
                >
                    {err ? <div className="small text-warn mb-12 bg-tool-err p-8 br-4">{err}</div> : null}

                    <label className="label" htmlFor={existingSelectId}>Available Build Masters</label>
                    <select
                        id={existingSelectId}
                        className="select"
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        <option value="" disabled>— Select an Agent —</option>
                        {bms.map((b) => (
                            <option key={b.bmId} value={b.bmId}>
                                {b.displayName} ({b.bmId})
                            </option>
                        ))}
                    </select>

                    <div className="spacer-12" />

                    <div className="badge">
                        Currently Selected: <span className="mono bg-panel p-4 br-4 ml-4">{selectedBm ? `${selectedBm.displayName} (${selectedBm.bmId})` : "None"}</span>
                    </div>

                    <div className="spacer-18" />

                    <button className="btn" onClick={refresh} disabled={busy}>Refresh List</button>
                </Section>
            </div>

            <div className="col">
                <Section
                    title="Or Create a New Agent"
                    subtitle="Spin up a fresh Build Master. Agent personalities are shaped by their DataQuad parameters."
                >
                    <label className="label" htmlFor={displayNameId}>Agent Display Name</label>
                    <input
                        id={displayNameId}
                        className="input mb-4"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <div className="small mb-12">A friendly name so you can recognize it later.</div>

                    <label className="label" htmlFor={bmIdInputId}>Custom ID (Optional)</label>
                    <input
                        id={bmIdInputId}
                        className="input mb-4"
                        value={bmId}
                        onChange={(e) => setBmId(e.target.value)}
                        placeholder="e.g. CodeBot_Alpha"
                    />
                    <div className="small mb-12">Leave this blank to have an ID automatically generated.</div>

                    <div className="spacer-12" />

                    <DataQuadEditor value={dq} onChange={setDq} />

                    <div className="spacer-12" />

                    <button className="btn primary w-full" onClick={handleCreate} disabled={busy}>
                        {busy ? "Working…" : "Create New Build Master"}
                    </button>
                    <div className="small text-center mt-8">
                        Creation simply records the agent's existence in an append-only ledger.
                    </div>
                </Section>
            </div>

            <div className="col col-full">
                <Section
                    title="2) Give it a Task (Run a Cycle)"
                    subtitle="Ask questions, run tools, or give simple commands. The agent processes and responds."
                >
                    <div className="row">
                        <div className="col">
                            <label className="label" htmlFor={runInputId}>Task Input</label>
                            <input
                                id={runInputId}
                                className="input"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="e.g., Use /tool time"
                            />
                            <div className="small mt-10">
                                <strong>Tip:</strong> If you want the agent to use a tool, format it like this: <span className="mono bg-panel p-4 br-4">/tool time {"{}"}</span>
                            </div>

                            <div className="spacer-12" />
                            <button className="btn primary w-full" onClick={handleRun} disabled={!selected || busy}>
                                {busy ? "Agent is working…" : "Send Task"}
                            </button>
                        </div>

                        <div className="col">
                            <label className="label">Agent Output</label>
                            <div className="card card-pad-12" style={{ minHeight: '120px' }}>
                                <div className="mono pre-wrap text-muted">{output || "Waiting for task..."}</div>
                            </div>

                            <div className="spacer-12" />

                            <div className="h2 mt-12">Tools Available for Agents</div>
                            <div className="small mb-12">These are capabilities you can ask the agent to use securely:</div>
                            <div className="small">
                                {tools.length ? tools.map((t) => (
                                    <div key={t.name} className="tool-item bg-surface p-8 br-4 mb-4 border-line">
                                        <strong className="text-ok">{t.name}</strong> <br />
                                        <span className="text-muted">{t.description}</span>
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
