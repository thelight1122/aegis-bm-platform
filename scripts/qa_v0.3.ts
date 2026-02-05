
import axios from 'axios';

const BASE = 'http://localhost:4000';

async function test() {
    try {
        console.log("1. Checking Health...");
        const health = await axios.get(`${BASE}/health`);
        console.log("Health:", health.data);

        console.log("\n2. Creating Project...");
        const proj = await axios.post(`${BASE}/projects/create`, { name: "QA Project", repo: "https://github.com/aegis/qa" });
        console.log("Project:", proj.data);

        console.log("\n3. Listing Build Masters...");
        const bms = await axios.get(`${BASE}/bm/list`);
        console.log("BMs:", bms.data.bms.length);
        const bmId = bms.data.bms.length > 0 ? bms.data.bms[0].bmId : null;

        if (!bmId) {
            console.log("NO BM FOUND. Creating one...");
            const newBm = await axios.post(`${BASE}/bm/create`, { displayName: "QA Bot" });
            console.log("New BM:", newBm.data);
            // Refresh list
        }

        const finalBmId = bmId || (await axios.get(`${BASE}/bm/list`)).data.bms[0].bmId;

        console.log("\n4. Creating Team...");
        const team = await axios.post(`${BASE}/teams/create`, {
            name: "QA Team",
            members: [{ bmId: finalBmId, role: "QA Lead" }]
        });
        console.log("Team:", team.data);

        console.log("\n5. Creating Task...");
        const task = await axios.post(`${BASE}/tasks/create`, {
            title: "QA Scan",
            intent: "Scan for alignment logic."
        });
        console.log("Task:", task.data);

        console.log("\n6. Starting Run...");
        const run = await axios.post(`${BASE}/runs/start`, {
            projectId: proj.data.projectId,
            teamId: team.data.teamId,
            taskId: task.data.taskId
        });
        console.log("Run Result:", run.data.outputs.text);

        console.log("\n7. Verifying Mirror...");
        const all = await axios.get(`${BASE}/aegis/readall`);
        console.log("Mirror Ledgers:", Object.keys(all.data));
        console.log("Runs in Mirror:", all.data.runs.length);

        console.log("\nQA PASS.");
    } catch (e: any) {
        console.error("QA FAIL:", e.response?.data || e.message);
        process.exit(1);
    }
}

test();
