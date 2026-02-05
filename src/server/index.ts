import express from 'express';
import { CORE_LEDGERS, readLedger } from '../core/modules.js';
import { tools, listTools } from '../tools/registry.js';
import { deployDepot } from '../depots/deploy.js';
import { trainingDepot } from '../depots/training.js';
import { listDepots, registerDepot } from '../depots/registry.js';
import { BuildMaster } from '../runtime/agent.js';
import { loadPlugins } from '../core/plugins.js';

const app = express();

// Basic CORS to allow local Vite client
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

const PORT = process.env.PORT || 4000;

// Middleware to log request (Observation)
app.use((req, res, next) => {
    // We could log every HTTP request to PEER as a raw observation?
    // For now, keeping it clean to not flood logs, but AEGIS observes everything.
    // Let's rely on specific endpoints logging to ledgers.
    next();
});

// GET /health
app.get('/health', (req, res) => {
    res.json({
        status: 'nominal',
        message: 'AEGIS Orchestrator operating within parameters.'
    });
});

// GET /tools
app.get('/tools', (req, res) => {
    const registry = listTools().map(t => ({ name: t.name, description: t.description }));
    res.json(registry);
});

// POST /bm/create
// Creates a new Build Master
app.post('/bm/create', async (req, res) => {
    try {
        const { displayName, name, bmId, dataquad } = req.body;
        // Support both displayName and legacy name
        const finalName = displayName || name;

        if (!finalName) {
            res.status(400).json({ error: "displayName parameter required." });
            return;
        }

        const bm = await deployDepot.deployBM(finalName, bmId, dataquad);
        res.json({
            message: "Build Master formation named.",
            bmId: bm.id,
            displayName: bm.name
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// GET /bm/list
app.get('/bm/list', async (req, res) => {
    try {
        const bms = await deployDepot.listBMs();
        res.json({ bms });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// POST /bm/run
// Runs a cycle for a specific BM
app.post('/bm/run', async (req, res) => {
    try {
        const { bmId, input } = req.body;
        if (!bmId) {
            res.status(400).json({ error: "bmId required." });
            return;
        }

        // Verify BM existence (Grounding)
        const allBms = await deployDepot.listBMs();
        const bmData = allBms.find(b => b.id === bmId);

        if (!bmData) {
            res.status(404).json({ error: `Build Master ${bmId} not found in SPINE.` });
            return;
        }

        const agent = new BuildMaster(bmData.id, bmData.name);
        const result = await agent.run(input || {});

        res.json(result);

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// POST /depot/training
// Writes to NCT (Training = Exposure)
app.post('/depot/training', async (req, res) => {
    try {
        const { pattern } = req.body;
        if (!pattern) {
            res.status(400).json({ error: "Pattern data required." });
            return;
        }

        const result = await trainingDepot.expose(pattern);
        res.json({
            message: "Pattern exposed to NCT.",
            entry: result
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// POST /depot/deploy
// Writes to SPINE (Deployment = Formation Naming)
// Generic endpoint for deploying non-BM formations or just alias
app.post('/depot/deploy', async (req, res) => {
    try {
        const { type, data } = req.body;
        if (!type || !data) {
            res.status(400).json({ error: "Type and data required." });
            return;
        }

        // We use the same ledger.
        const entry = await CORE_LEDGERS.SPINE.append(type, data);
        res.json({
            message: "Formation named in SPINE.",
            entry
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
// GET /depots
app.get('/depots', (req, res) => {
    const list = listDepots();
    res.json(list.map(d => ({ name: d.name, description: d.description })));
});

// GET /aegis/readall
// Returns contents of all ledgers
app.get('/aegis/readall', async (req, res) => {
    try {
        const peer = await readLedger('PEER');
        const pct = await readLedger('PCT');
        const nct = await readLedger('NCT');
        const spine = await readLedger('SPINE');

        res.json({
            PEER: peer,
            PCT: pct,
            NCT: nct,
            SPINE: spine
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Start Server
// 1. Load Plugins
await loadPlugins(app);
// 2. Hydrate Depots (Persistence)
await deployDepot.hydrate();

app.listen(PORT, () => {
    console.log(`AEGIS Orchestrator listening on port ${PORT}`);
    console.log(`Operating context: AEGIS-BOUND`);
});
