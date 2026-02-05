import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Nav from "./Nav";
import { health } from "../api/endpoints";
import { api } from "../api/client";

export default function Layout({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<string>("checking…");

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const h = await health();
                if (!alive) return;
                setStatus(`${h.name} ${h.version} • ${api.baseUrl}`);
            } catch {
                if (!alive) return;
                setStatus(`backend unreachable • ${api.baseUrl}`);
            }
        })();
        return () => { alive = false; };
    }, []);

    return (
        <div className="container">
            <div className="row row-between">
                <div>
                    <div className="h1">AEGIS Build Master Platform</div>
                    <div className="badge">UI v0.3.0 • {status}</div>
                    <div className="p max-820">
                        This interface is a mirror and depot console. It records, reflects, and surfaces—without scoring,
                        enforcement, or override. Self-governance remains sovereign.
                    </div>
                </div>
            </div>

            <div className="hr" />

            <Nav />

            <div className="spacer-14" />

            {children}

            <div className="spacer-18" />

            <div className="small">
                AEGIS-native posture: append-only reality • reflection without control • no scoring • no enforcement
            </div>
        </div>
    );
}
