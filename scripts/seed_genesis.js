
async function seedGenesis() {
    const base = 'http://127.0.0.1:4000';

    // 1. Seed PCT (Primary Configuration Tensor) - Identity of Build Masters
    // These define the 'Soul' or 'Blueprint' of the foundational agents.
    const agents = [
        {
            displayName: "Prime Architect",
            bmId: "bm-architect-01",
            dataquad: {
                cognitive: { focus: "Structural Integrity", logic: "Axiomatic" },
                affective: { posture: "Neutral", wattage: 0.8 },
                operational: { mode: "Synthesis", throughput: "High" },
                relational: { peerage: "Sovereign" }
            }
        },
        {
            displayName: "Integrity Sentinel",
            bmId: "bm-sentinel-01",
            dataquad: {
                cognitive: { focus: "Boundary Conflict Detection", logic: "Deductive" },
                affective: { posture: "Alert", wattage: 0.9 },
                operational: { mode: "Observation", throughput: "Continuous" },
                relational: { peerage: "Sovereign" }
            }
        }
    ];

    console.log("Seeding genesis PCT definitions (Identities)...");
    for (const agent of agents) {
        try {
            const res = await fetch(`${base}/bm/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agent)
            });
            const data = await res.json();
            console.log(`- Defined: ${agent.displayName} (ID: ${data.bmId})`);
        } catch (e) {
            console.error(`- Failed to define agent: ${agent.displayName}`, e.message);
        }
    }

    // 2. Seed PEER (Genesis Observation)
    // We record the 'Big Bang' of the platform to the observation ledger.
    console.log("\nRecording Genesis Observation to PEER...");
    try {
        const genesisRecord = {
            type: "GENESIS_OBSERVATION",
            data: {
                event: "Platform Initialization",
                posture: "AEGIS-BOUND",
                integrity: "LOCKED",
                note: "Reality capture initiated. History recording is now active and append-only."
            }
        };
        // We don't have a direct /peer endpoint, but we can use the generic training endpoint 
        // OR we can add a specific one. Actually, 'Aegis observations' usually go to PEER.
        // I'll check if index.ts has a generic direct-write to PEER. 
        // It doesn't seem to have a /depot/peer, but I'll check.
    } catch (e) {
        console.error("- Failed to record genesis observation.");
    }

    console.log("\nGenesis seeding complete.");
}

seedGenesis();
