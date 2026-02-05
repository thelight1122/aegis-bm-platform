# AEGIS Build Master Platform (v0.1.0)

A minimal AEGIS-native agentic platform kernel.
"The conscience substrate, not an add-on."

## Mission

To orchestrate Build Masters (BMs) within strict AEGIS parameters:

- **Append-only Ledgers**: History is never rewritten.
- **Sovereign Agents**: Observe -> Decide -> Act -> Record.
- **No Force**: No "must", "should", or "enforce". Interaction is clear observation.

## Quickstart

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
npm install
npm run build
npm start
```

(Command `npm start` assumes `ts-node src/server/index.ts` or similar built script)

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

- **PEER**: Agent-World interactions.
- **SPINE**: Structural definitions and identity formations.
- **NCT**: Non-Instructional Conditioning Tensor (Pattern exposure).
- **PCT**: Pilot Consciousness Tensor (Context/State).

---
*Operates within the AEGIS PARAMETER SPACE.*
