async function test() {
    const BASE = 'http://127.0.0.1:4000';

    console.log("1. Fetching Meta...");
    const pRes = await fetch(`${BASE}/api/projects`).then(r => r.json());
    const tRes = await fetch(`${BASE}/api/teams`).then(r => r.json());
    const toolsRes = await fetch(`${BASE}/api/tools`).then(r => r.json());

    const projectId = pRes.projects[0].projectId;
    const teamId = tRes.teams[0].teamId;
    const availableTools = toolsRes.tools.map(t => t.id || t.name);

    console.log(`Using Project: ${projectId}, Team: ${teamId}`);
    console.log(`Available Tools: ${availableTools.join(', ')}`);

    console.log("\n2. Creating Run with bonded tools: hello.tool, time...");
    const runRes = await fetch(`${BASE}/api/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            projectId,
            teamId,
            toolIds: ['hello.tool', 'time']
        })
    }).then(r => r.json());

    const runId = runRes.runId;
    console.log(`Run Created: ${runId}`);

    console.log("\n3. Verifying Persistence (Manual Selection check)...");
    const runCheck = await fetch(`${BASE}/api/runs/${runId}`).then(r => r.json());
    console.log("Bonded Tools in Run:", runCheck.toolIds);
    if (runCheck.toolIds.includes('hello.tool')) {
        console.log("PASS: Selection persisted.");
    } else {
        console.log("FAIL: Selection mismatch.");
    }

    console.log("\n4. Manual Tool Call (hello.tool)...");
    const callRes = await fetch(`${BASE}/api/runs/${runId}/toolcalls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            toolId: 'hello.tool',
            input: { name: 'QA Observer' },
            requestedBy: 'user'
        })
    }).then(r => r.json());

    const correlationId = callRes.correlationId;
    console.log(`Call Emitted. Correlation: ${correlationId}`);

    console.log("\n5. Tool Error Path (Invalid Tool)...");
    const errRes = await fetch(`${BASE}/api/runs/${runId}/toolcalls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            toolId: 'non-existent-tool',
            input: {},
            requestedBy: 'user'
        })
    }).then(r => r.json());
    console.log(`Error Call Emitted. Correlation: ${errRes.correlationId}`);

    console.log("\n6. Waiting for events and Agent loop (12s)...");
    await new Promise(r => setTimeout(r, 12000));

    console.log("\n7. Final Event Timeline Check...");
    const eventsRes = await fetch(`${BASE}/api/runs/${runId}/events`).then(r => r.json());
    const events = eventsRes.events;

    const kinds = events.map(e => e.kind);
    console.log("Event Kinds Observed:", [...new Set(kinds)]);

    const agentCalls = events.filter(e => e.data_json && (e.data_json.requestedBy === 'agent' || e.data_json.kind === 'tool.requested' && e.data_json.requestedBy === 'agent'));
    console.log(`Agent Tool Calls Detected: ${agentCalls.length}`);

    const results = events.filter(e => e.kind === 'tool_result' || e.kind === 'tool.completed');
    console.log(`Tool Results Recorded: ${results.length}`);

    const errors = events.filter(e => e.kind === 'error');
    console.log(`Errors Recorded: ${errors.length}`);

    console.log("\n--- Timeline Extract ---");
    events.forEach(e => {
        if (e.kind.startsWith('tool') || e.kind === 'error' || e.data_json?.kind?.startsWith('tool')) {
            const data = e.data_json || {};
            console.log(`[${e.ts}] ${e.kind.toUpperCase()}: ${e.message} (${data.toolId || ''}) - ${data.kind || ''}`);
        }
    });

    console.log("\n8. Verification Summary:");
    const hasAgent = agentCalls.length > 0;
    const hasManual = events.some(e => e.data_json && e.data_json.toolId === 'hello.tool' && e.data_json.requestedBy === 'user');
    const hasError = errors.length > 0;

    console.log(`Agent Autonomy: ${hasAgent ? 'PASS' : 'FAIL'}`);
    console.log(`Manual Interaction: ${hasManual ? 'PASS' : 'FAIL'}`);
    console.log(`Error Handling: ${hasError ? 'PASS' : 'FAIL'}`);
}

test().catch(console.error);
