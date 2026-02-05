async function test() {
    const BASE = 'http://127.0.0.1:4000';

    console.log("1. Fetching Meta...");
    const pRes = await fetch(`${BASE}/api/projects`).then(r => r.json());
    const tRes = await fetch(`${BASE}/api/teams`).then(r => r.json());

    const projectId = pRes.projects[0].projectId;
    const teamId = tRes.teams[0].teamId;

    console.log("\n2. Creating Run...");
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

    console.log("\n3. Triggering Explicit Agent Session (mode: untilComplete)...");
    const agentRes = await fetch(`${BASE}/api/runs/${runId}/agent/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'untilComplete', requestedBy: 'user' })
    }).then(r => r.json());
    console.log(`Agent Session ID: ${agentRes.agentSessionId}`);

    console.log("\n4. Waiting for Agent actions (10s)...");
    await new Promise(r => setTimeout(r, 10000));

    console.log("\n5. Verifying Agent Timeline...");
    const eventsRes = await fetch(`${BASE}/api/runs/${runId}/events`).then(r => r.json());
    const events = eventsRes.events;

    const agentEvents = events.filter(e => e.kind.startsWith('agent.'));
    console.log(`Agent Events: ${agentEvents.length}`);
    agentEvents.forEach(e => console.log(` - ${e.kind.toUpperCase()}: ${e.message}`));

    const hasRequested = events.some(e => e.kind === 'agent.requested');
    const hasStarted = events.some(e => e.kind === 'agent.started');
    const hasStep = events.some(e => e.kind === 'agent.step');
    const hasToolReq = events.some(e => e.kind === 'tool.requested' && e.data_json?.requestedBy === 'agent');

    console.log("\n6. Final Scorecard:");
    console.log(`- agent.requested: ${hasRequested ? 'PASS' : 'FAIL'}`);
    console.log(`- agent.started:   ${hasStarted ? 'PASS' : 'FAIL'}`);
    console.log(`- agent.step:      ${hasStep ? 'PASS' : 'FAIL'}`);
    console.log(`- tool.requested (agent): ${hasToolReq ? 'PASS' : 'FAIL'}`);

    if (hasRequested && hasStarted && hasStep && hasToolReq) {
        console.log("\nPHASE 2.1 VERIFIED: SUCCESS");
    } else {
        console.log("\nPHASE 2.1 VERIFIED: FAILED");
        process.exit(1);
    }
}

test().catch(e => {
    console.error(e);
    process.exit(1);
});
