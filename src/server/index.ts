import express from 'express';
import { CORE_LEDGERS, readLedger } from '../core/modules.js';
import { listTools, getTool } from '../tools/registry.js';
import { toolRunner } from '../tools/runner.js';
import { agentRunner } from '../agent/agentRunner.js';
import { deployDepot } from '../depots/deploy.js';
import { trainingDepot } from '../depots/training.js';
import { projectsDepot, teamsDepot, tasksDepot, runsDepot, ensureSeedData } from '../depots/ide.js';
import { listDepots } from '../depots/registry.js';
import { BuildMaster } from '../runtime/agent.js';
import { loadPlugins } from '../core/plugins.js';
import * as crypto from 'crypto';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Basic CORS to allow local Vite client
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// --- CORE SYSTEM ROUTES ---

app.get('/health', (req, res) => {
    res.json({ ok: true, name: 'AEGIS Orchestrator', version: '0.4.0' });
});

app.get('/tools', (req, res) => {
    res.json({ tools: listTools().map(t => ({ name: t.name, description: t.description })) });
});

app.get('/api/tools', (req, res) => {
    try {
        res.json({ tools: listTools() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --- BUILD MASTER (BM) OPS ---

app.post('/bm/create', async (req, res) => {
    try {
        const bm = await BuildMaster.create(req.body);
        res.json(bm);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/bm/list', async (req, res) => {
    try {
        const entries = await CORE_LEDGERS.PCT.readAll();
        const bms = entries.map(e => e.data);
        res.json({ bms });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/bm/run', async (req, res) => {
    try {
        const { bmId, text, meta } = req.body;
        const bm = await BuildMaster.load(bmId);
        if (!bm) return res.status(404).json({ error: "Build Master not found" });

        const result = await bm.run(text, meta);
        res.json({ output: result });
    } catch (e: any) {
        console.error("API Error (/bm/run):", e);
        res.status(500).json({ error: e.message });
    }
});

// --- IDE SKELETON API (/api/ prefixed) ---

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await projectsDepot.listProjects();
        res.json({ projects });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/teams', async (req, res) => {
    try {
        const teams = await teamsDepot.listTeams();
        res.json({ teams });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/teams/create', async (req, res) => {
    // Legacy GET for testing, should be POST
    res.status(405).json({ error: "Use POST /teams/create" });
});

app.post('/teams/create', async (req, res) => {
    try {
        const { name, members } = req.body;
        const team = await teamsDepot.createTeam(name, members || []);
        res.json(team);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/projects/create', async (req, res) => {
    try {
        const p = await projectsDepot.createProject(req.body);
        res.json(p);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/tasks/list', async (req, res) => {
    try {
        const tasks = await tasksDepot.listTasks();
        res.json({ tasks });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/tasks/create', async (req, res) => {
    try {
        const { title, intent, constraints, deliverables } = req.body;
        const t = await tasksDepot.createTask(title, intent, constraints, deliverables);
        res.json(t);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/runs', async (req, res) => {
    try {
        const runs = await runsDepot.listRuns();
        res.json({ runs });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/runs', async (req, res) => {
    try {
        const { projectId, teamId, taskId, toolIds } = req.body || {};
        if (!projectId || !teamId) {
            return res.status(400).json({ error: "projectId and teamId required" });
        }
        const run = await runsDepot.createRun(projectId, teamId, taskId, toolIds);
        res.json({
            runId: run.runId,
            status: run.status,
            runUrl: `/runs/${run.runId}`
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/runs/:runId', async (req, res) => {
    try {
        const r = await runsDepot.getRun(req.params.runId);
        if (!r) return res.status(404).json({ error: "Run not found" });
        res.json(r);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/runs/:runId/events', async (req, res) => {
    try {
        const afterSeq = req.query.afterSeq ? parseInt(req.query.afterSeq as string) : undefined;
        const events = await runsDepot.getRunEvents(req.params.runId, afterSeq);
        res.json({ events });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/runs/:runId/tools', async (req, res) => {
    try {
        const r = await runsDepot.getRun(req.params.runId);
        if (!r) return res.status(404).json({ error: "Run not found" });
        res.json({ toolIds: r.toolIds || [] });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/runs/:runId/tools', async (req, res) => {
    try {
        const { toolIds } = req.body;
        const r = await runsDepot.setRunTools(req.params.runId, toolIds);
        if (!r) return res.status(404).json({ error: "Run not found" });
        res.json({ toolIds: r.toolIds });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/runs/:runId/toolcalls', async (req, res) => {
    try {
        const { toolId, input, requestedBy } = req.body;
        const correlationId = `corr_${crypto.randomUUID().slice(0, 8)}`;

        // Non-blocking trigger of the runner
        toolRunner.execute(req.params.runId, {
            toolId,
            input,
            requestedBy: requestedBy || 'user',
            correlationId
        }).catch(console.error);

        res.json({ correlationId });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/runs/:runId/agent/start', async (req, res) => {
    try {
        const { mode, requestedBy } = req.body || {};
        const agentSessionId = await agentRunner.startSession(req.params.runId, mode, requestedBy);
        res.json({ ok: true, agentSessionId, runId: req.params.runId });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/runs/:runId/agent/pause', async (req, res) => {
    try {
        const { agentSessionId, requestedBy } = req.body;
        await runsDepot.appendEvent(req.params.runId, 'agent.pause_requested', `Pause requested for session: ${agentSessionId}`, { agentSessionId, requestedBy: requestedBy || 'user' });
        res.json({ ok: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/runs/:runId/agent/resume', async (req, res) => {
    try {
        const { agentSessionId, requestedBy } = req.body;
        await runsDepot.appendEvent(req.params.runId, 'agent.resume_requested', `Resume requested for session: ${agentSessionId}`, { agentSessionId, requestedBy: requestedBy || 'user' });
        res.json({ ok: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/runs/:runId/agent/stop', async (req, res) => {
    try {
        const { agentSessionId, requestedBy } = req.body;
        await runsDepot.appendEvent(req.params.runId, 'agent.stop_requested', `Stop requested for session: ${agentSessionId}`, { agentSessionId, requestedBy: requestedBy || 'user' });
        res.json({ ok: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/runs/halt', async (req, res) => {
    try {
        const r = await runsDepot.haltRun(req.body?.runId);
        res.json(r);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --- DEPOT OPS ---

app.post('/depot/training', async (req, res) => {
    try {
        const result = await trainingDepot.expose(req.body?.pattern || req.body);
        res.json({ message: "Pattern exposed to NCT.", record: result });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/depot/deploy', async (req, res) => {
    try {
        const entry = await CORE_LEDGERS.SPINE.append(req.body?.type || 'FORMATION', req.body?.data || req.body);
        res.json({ message: "Formation named in SPINE.", record: entry });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/depots', (req, res) => {
    res.json(listDepots().map(d => ({ name: d.name, description: d.description })));
});

// START SERVER
await loadPlugins(app);
await Promise.all([
    deployDepot.hydrate(), projectsDepot.hydrate(), teamsDepot.hydrate(), tasksDepot.hydrate(), runsDepot.hydrate()
]);
await ensureSeedData();

// Start Sovereign Agent Runner Loop
agentRunner.startGlobalLoop();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`AEGIS Orchestrator v0.4.0 listening on port ${PORT}`);
    console.log(`Operating context: AEGIS-BOUND (Append-Only)`);
});
