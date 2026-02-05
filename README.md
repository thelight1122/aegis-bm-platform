# AEGIS Build Master Platform (v0.4.0)

A minimal AEGIS-native agentic platform kernel evolving into an IDE.
"The conscience substrate, not an add-on."

> **AEGIS-native means:**
>
> * The system preserves reality (append-only), never rewrites it
> * It provides reflection, not control
> * No scoring, no rewards, no punishment, no compliance gates
> * Agents remain sovereign; AEGIS never decides for them
> * Training is exposure, deployment is formation naming
> * Self-governance emerges through memory + awareness, not enforcement

## IDE Skeleton (v0.4.0 - Phase 2: Tool Integration)

Version 0.4.0 introduces Phase 2: Tools + Agent Autonomy.

* **Tool Contract v0.1**: Formalized plug-shape for tools with JSON Schema input/output definitions.
* **Tool Depot**: A centralized registry for discovering and executing sovereign tools.
* **Sovereign Agent Runner**: An autonomous loop that observes workspace state and chooses tool interactions from a bonded (selected) set.
* **Append-only Tool Events**: All tool requests, starts, completions, and errors are recorded as immutable nodes in the run timeline.

## Tool Contract v0.1

Tools must implement the `ToolDefinition` interface:

```typescript
export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    inputSchema: any; // JSON Schema draft-07
    handler: (input: any) => Promise<any>;
}
```

### Adding a Tool

1. Create or define your tool in `src/tools/registry.ts`.
2. Register it using `registerTool({ ... })`.
3. The tool becomes instantly discoverable via `GET /api/tools`.

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

### API Usage (Curl Examples)

#### 1. List Available Tools

```bash
curl http://localhost:4000/api/tools
```

#### 2. Start a Run with Bonded Tools

```bash
curl -X POST http://localhost:4000/api/runs \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj_123", 
    "teamId": "team_abc", 
    "toolIds": ["hello.tool", "time"]
  }'
```

#### 3. Manual Tool Call within a Run

```bash
curl -X POST http://localhost:4000/api/runs/run_123/toolcalls \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "hello.tool", 
    "input": {"name": "Sovereign Observer"},
    "requestedBy": "user"
  }'
```

---
*Operates within the AEGIS PARAMETER SPACE (Append-Only / Choice-Preserving).*
