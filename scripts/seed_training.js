
async function seedTrainingPatterns() {
    const base = 'http://127.0.0.1:4000';

    const patterns = [
        {
            name: "Neutral Sifting Pattern",
            description: "Identifiers for shifting judgmental language into objective observations.",
            examples: [
                { match: "This is a violation.", reflect: "I am observing a boundary conflict at position X." },
                { match: "You must fix this.", reflect: "Structural drift is noted. Here is the delta." },
                { match: "Failed compliance.", reflect: "Observed state diverges from recorded parameters." }
            ],
            tags: ["linguistic", "posture"]
        },
        {
            name: "Structural Coherence Template",
            description: "Metadata requirements for valid AEGIS observations.",
            requirements: ["timestamp", "sovereignId", "contextRef", "observedData"],
            rules: ["Never silent-fix missing data", "Record the absence as a specific observation"],
            tags: ["technical", "structural"]
        },
        {
            name: "Non-Forceful Interaction Logic",
            description: "Patterns for interacting with peer agents without utilizing executive overrides.",
            posture: "Peer-to-Peer",
            logic: "If peer output diverges, record the divergence. Do not modify the peer's record. Surfaces reality for aggregate reflection.",
            tags: ["relational", "sovereign"]
        },
        {
            name: "Drift Observation Anchor",
            description: "Anchor points for identifying architectural drift over long-form history.",
            anchors: ["Schema evolution", "Prompt leakage", "Implicit priority shifts"],
            method: "Scan history for recurring patterns that lack an explicit ledger entry.",
            tags: ["analytical", "drift"]
        }
    ];

    console.log("Seeding AEGIS Training Patterns (Exposures)...");

    for (const pattern of patterns) {
        try {
            const res = await fetch(`${base}/depot/training`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pattern })
            });
            const data = await res.json();
            console.log(`- Exposed: ${pattern.name} (ID: ${data.record.id})`);
        } catch (e) {
            console.error(`- Failed to expose pattern: ${pattern.name}`, e.message);
        }
    }

    console.log("Training exposures complete. Patterns recorded in NCT.");
}

seedTrainingPatterns();
