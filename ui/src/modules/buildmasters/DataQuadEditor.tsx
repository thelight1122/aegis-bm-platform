import { useId, useMemo, useState } from "react";
import type { DataQuad } from "../../api/types";

const defaultDQ: DataQuad = { cognitive: {}, affective: {}, operational: {}, relational: {} };

export default function DataQuadEditor({
    value,
    onChange
}: {
    value?: DataQuad;
    onChange: (dq: DataQuad) => void;
}) {
    const initial = useMemo(() => value ?? defaultDQ, [value]);
    const [raw, setRaw] = useState<string>(() => JSON.stringify(initial, null, 2));
    const [err, setErr] = useState<string>("");
    const textareaId = useId();

    function apply() {
        try {
            const parsed = JSON.parse(raw);
            setErr("");
            onChange(parsed);
        } catch (e: any) {
            setErr("Invalid JSON. Keep it descriptive; avoid scoring fields.");
        }
    }

    return (
        <div>
            <label className="label" htmlFor={textareaId}>DataQuad (JSON)</label>
            <textarea
                id={textareaId}
                className="textarea mono"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
            />
            {err ? <div className="small text-warn mt-8">{err}</div> : null}
            <div className="spacer-10" />
            <button className="btn" onClick={apply}>Apply DataQuad</button>
            <div className="small mt-10">
                Canonical: four aspects (cognitive/affective/operational/relational). Avoid scores, rankings, or “alignment” fields.
            </div>
        </div>
    );
}
