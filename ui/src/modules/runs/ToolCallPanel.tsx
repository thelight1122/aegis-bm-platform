import { useState } from "react";
import { postToolCall } from "../../api/endpoints";
import type { Tool } from "../../api/types";

interface Props {
    runId: string;
    bondedTools: Tool[];
}

export default function ToolCallPanel({ runId, bondedTools }: Props) {
    const [selToolId, setSelToolId] = useState("");
    const [input, setInput] = useState("{}");
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");

    const execute = async () => {
        if (!selToolId) return;
        setBusy(true);
        setStatus("Requested...");
        try {
            const parsedInput = JSON.parse(input);
            const res = await postToolCall(runId, {
                toolId: selToolId,
                input: parsedInput,
                requestedBy: "user"
            });
            setStatus(`Call emitted: ${res.correlationId}`);
        } catch (e: any) {
            setStatus("Error: " + e.message);
        } finally {
            setBusy(false);
            setTimeout(() => setStatus(""), 4000);
        }
    };

    if (bondedTools.length === 0) return null;

    return (
        <div className="card card-pad-12 bg-surface mt-12 border-line">
            <div className="h2 small mb-8">Sovereign Tool Invocation</div>
            <div className="row row-between mb-8">
                <select
                    className="select f-grow mr-8"
                    value={selToolId}
                    onChange={e => setSelToolId(e.target.value)}
                    title="Select Tool"
                >
                    <option value="">-- Select Bonded Tool --</option>
                    {bondedTools.map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                </select>
                <button className="btn primary" onClick={execute} disabled={busy || !selToolId}>
                    {busy ? "Emitting..." : "Execute"}
                </button>
            </div>

            <textarea
                className="textarea mono fs-10 mb-8"
                placeholder='{"args": ...}'
                value={input}
                onChange={e => setInput(e.target.value)}
                title="Tool Input (JSON)"
            />

            {status && <div className="small italic text-accent2">{status}</div>}
        </div>
    );
}
