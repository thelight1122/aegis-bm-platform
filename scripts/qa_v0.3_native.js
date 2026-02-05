
async function runQA() {
    const base = 'http://127.0.0.1:4000';

    // 1. Create Project
    const pRes = await fetch(`${base}/projects/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'QA Project', repo: 'https://github.com/aegis/qa' })
    });
    const project = await pRes.json();
    console.log('Project created:', project.projectId);

    // 2. Create Task
    const tksRes = await fetch(`${base}/tasks/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'QA Task', intent: 'Verify Phase 1' })
    });
    const task = await tksRes.json();
    console.log('Task created:', task.taskId);

    // 3. Create Team
    const bmsRes = await fetch(`${base}/bm/list`);
    const { bms } = await bmsRes.json();
    const bmId = bms[0].bmId;

    const tmRes = await fetch(`${base}/teams/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'QA Team',
            members: [{ bmId, role: 'QA Agent' }]
        })
    });
    const team = await tmRes.json();
    console.log('Team created:', team.teamId);

    // 4. Start Run
    console.log('Starting Execution Run...');
    const runRes = await fetch(`${base}/runs/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            projectId: project.projectId,
            teamId: team.teamId,
            taskId: task.taskId
        })
    });
    const run = await runRes.json();
    console.log('Run status:', run.status);
    console.log('Output summary length:', run.outputs.text?.length);

    // 5. Verify Mirror
    const mRes = await fetch(`${base}/aegis/readall`);
    const mirror = await mRes.json();
    console.log('Mirror ledgers found:', Object.keys(mirror).length);
    if (mirror.projects?.length > 0 && mirror.runs?.length > 0) {
        console.log('QA SUCCESS: End-to-end execution verified.');
    } else {
        console.error('QA FAIL: Ledgers not populated correctly.');
        process.exit(1);
    }
}

runQA().catch(e => {
    console.error('QA ERROR:', e.message);
    process.exit(1);
});
