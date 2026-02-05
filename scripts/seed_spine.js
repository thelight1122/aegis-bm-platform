
async function seedSpineStarters() {
    const base = 'http://127.0.0.1:4000';

    const formations = [
        {
            type: "ARCHITECTURE_NODE",
            data: {
                id: "spine-node-alpha",
                name: "Core Orchestrator",
                role: "The Primary Dispatcher and Record-Keeper.",
                parameters: {
                    port: 4000,
                    context: "AEGIS-BOUND",
                    enforcement: "NONE"
                }
            }
        },
        {
            type: "STORAGE_VORTEX",
            data: {
                id: "ledger-store-01",
                name: "Primary Integrity Ledger Store",
                path: "./data",
                protocol: "JSONL-APPEND-ONLY",
                redundancy: "Mirror-Reflected"
            }
        },
        {
            type: "PORTAL_FORMATION",
            data: {
                id: "ui-nexus-prime",
                name: "Observational Mirror Console",
                interface: "React/Vite",
                posture: "Mirroring & Depot Display",
                sovereignty: "Protected"
            }
        },
        {
            type: "BUILD_MASTER_REFERENCE",
            data: {
                id: "bm-archivist-system",
                displayName: "The Archivist",
                specialization: "Ledger Consistency & Historical Synthesis",
                tools: ["ledger-read", "hash-verify"]
            }
        }
    ];

    console.log("Naming SPINE starter formations...");

    for (const form of formations) {
        try {
            const res = await fetch(`${base}/depot/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            console.log(`- Named: ${form.data.name} (Entry: ${data.record.id})`);
        } catch (e) {
            console.error(`- Failed to name formation: ${form.data.name}`, e.message);
        }
    }

    console.log("SPINE starters recorded. Structural backbone established.");
}

seedSpineStarters();
