
async function seedTasks() {
    const base = 'http://127.0.0.1:4000';

    const tasks = [
        {
            title: "Architecture Alignment Review",
            intent: "Synthesize current structural nodes against Axiom 1 (Observation Only).",
            constraints: ["No rewrite of history", "Observe without interference"],
            deliverables: ["Structural Synthesis Report", "Node Mapping"]
        },
        {
            title: "Drift Detection Pass",
            intent: "Identify and record semantic drift markers in recent documentation and code comments.",
            constraints: ["Neutral classification only", "No punitive labels"],
            deliverables: ["Drift Marker Ledger", "Linguistic Audit"]
        },
        {
            title: "Integrity Ledger Audit",
            intent: "Verify the continuity of the hash chain across PEER, SPINE, and project ledgers.",
            constraints: ["Validate only", "Report gaps without silent fix"],
            deliverables: ["Continuity Map", "Audit Log"]
        },
        {
            title: "Formation Stability Analysis",
            intent: "Observe and record team formation dynamics under shifting task priorities.",
            constraints: ["Sovereignty preservation", "No performance ranking"],
            deliverables: ["Dynamics Observation Record", "Resilience Brief"]
        }
    ];

    console.log("Seeding predefined AEGIS tasks...");

    for (const task of tasks) {
        try {
            const res = await fetch(`${base}/tasks/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
            const data = await res.json();
            console.log(`- Created: ${data.title} (${data.taskId})`);
        } catch (e) {
            console.error(`- Failed to create task: ${task.title}`, e.message);
        }
    }

    console.log("Seeding complete.");
}

seedTasks();
