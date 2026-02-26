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
                    <div className="h1">Build Master Platform</div>
                    <div className="badge mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-2 d-inline-block"></span>
                        Workspace UI v0.3.0 • {status}
                    </div>
                    <div className="p max-820">
                        Welcome to the local AEGIS Agent Sandbox. This environment lets you configure, test, and observe
                        autonomous agents (Build Masters) securely.
                        <br /><br />
                        <strong>New to this?</strong> Start by creating a Build Master on the first tab, then give it tasks
                        or run individual commands. Everything is safely recorded in an append-only log, so you can't break anything!
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
