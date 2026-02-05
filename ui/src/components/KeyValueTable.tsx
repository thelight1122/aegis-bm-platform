import React from "react";

export default function KeyValueTable({ data }: { data: Record<string, any> }) {
    const entries = Object.entries(data || {});
    if (!entries.length) return <div className="small">No data.</div>;

    return (
        <table className="kv">
            <tbody>
                {entries.map(([k, v]) => (
                    <tr key={k}>
                        <td className="key mono">{k}</td>
                        <td className="val mono">{format(v)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function format(v: any) {
    if (v === null || v === undefined) return String(v);
    if (typeof v === "string") return v;
    try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}
