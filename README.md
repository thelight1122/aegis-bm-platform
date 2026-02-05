# AEGIS Build Master Platform (v0.1.0)

A minimal AEGIS-native agentic platform kernel.
"The conscience substrate, not an add-on."

> **AEGIS-native means:**
>
> * The system preserves reality (append-only), never rewrites it
> * It provides reflection, not control
> * No scoring, no rewards, no punishment, no compliance gates
> * Agents remain sovereign; AEGIS never decides for them
> * Training is exposure, deployment is formation naming
> * Self-governance emerges through memory + awareness, not enforcement

## Mission

To orchestrate Build Masters (BMs) within strict AEGIS parameters:

* **Append-only Ledgers**: History is never rewritten.
* **Sovereign Agents**: Observe -> Decide -> Act -> Record.
* **No Force**: No "must", "should", or "enforce". Interaction is clear observation.

## Resilience & Persistence

AEGIS-BM Platform v0.2.0 introduces append-only persistence.

* **Initialization**: On startup, the `DeployDepot` hydrates its state by replaying the `PCT` (Pattern Context Template) ledger.
* **Identity**: Build Master identities are reconstructed from `bm_meta` records.
* **State**: The latest `displayName` and configuration is derived from the event history.
* **No Overwrites**: All changes are new append entries. We never delete or update-in-place.

## Plugins

AEGIS-BM Platform supports expansion via plugins.

* **Tools**: Add new tools to `plugins/tools/index.ts`.

  ```typescript
  export default [
    {
      name: "custom_tool",
      description: "A custom tool",
      run: async (args) => { return { result: "ok" }; }
    }
  ];
  ```

* **Depots**: Add new depots to `plugins/depots/index.ts`.

  ```typescript
  export default [
    {
      name: "custom_depot",
      register: (app) => {
        app.get('/custom', (req, res) => res.json({ status: "ok" }));
      }
    }
  ];
  ```

## Posture Scan

To automatically detect potential drift markers (coercion/ranking language), run:

```bash
npm run posture:scan
```

This scans both backend and UI code for terms like "enforce", "score", "punish", etc.

To enforce strict non-zero exit on warnings (e.g. for CI):

```bash
npm run posture:scan -- --strict
```

## Usage

### Quickstart

1. **Install & Run Backend**:

   ```bash
   npm install
   npm run dev
   ```

2. **Install & Run UI**:

   ```bash
   cd ui
   npm install
   npm run dev
   ```

3. **Open**: [http://localhost:5173](http://localhost:5173)

### Running Locally

The server listens on port 3000 by default.

## API Usage (Curl Examples)

### 1. Check Health

```bash
curl http://localhost:3000/health
```

### 2. Create a Build Master

```bash
curl -X POST http://localhost:3000/bm/create \
  -H "Content-Type: application/json" \
  -d '{"name": "BM-Alpha"}'
```

### 3. List Build Masters

```bash
curl http://localhost:3000/bm/list
```

### 4. Run a Build Master (Echo Tool)

Replace `BM_ID` with the ID returned from creation.

```bash
curl -X POST http://localhost:3000/bm/run \
  -H "Content-Type: application/json" \
  -d '{"bmId": "BM_ID", "input": {"toolName": "echo", "args": "Hello AEGIS"}}'
```

### 5. Training Exposure (NCT)

```bash
curl -X POST http://localhost:3000/depot/training \
  -H "Content-Type: application/json" \
  -d '{"pattern": "observed_logic_drift"}'
```

### 6. Read All Ledgers

```bash
curl http://localhost:3000/aegis/readall
```

## What makes this AEGIS-native?

This platform differs from traditional agent frameworks in its **Ontological Commitments**:

1. **Append-Only Reality**: All state determines from `PEER`, `SPINE`, `NCT`, and `PCT` ledgers which are strictly append-only. There is no `UPDATE` or `DELETE` operation anywhere in the kernel.

2. **No Scoring or Optimization**: Agents are not rewarded for "success" or punished for "failure". They simply record observations and outcomes. "Drift is information, not violation."

3. **Observation over Enforcement**: The runtime loop is `Observe -> Decide -> Act -> Record`. There is no "Safety Layer" that intercepts thoughts. Stability emerges from the `SPINE` (formation integrity), not from runtime policing.

4. **Language of Formation**: We use terms like "Formation Naming" instead of "Deployment", and "Exposure" instead of "Training", to reflect the non-force nature of the system.

## Ledgers

* **PEER**: Agent-World interactions.
* **SPINE**: Structural definitions and identity formations.
* **NCT**: Non-Instructional Conditioning Tensor (Pattern exposure).
* **PCT**: Pilot Consciousness Tensor (Context/State).

---
*Operates within the AEGIS PARAMETER SPACE.*
