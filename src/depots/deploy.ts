import * as crypto from 'crypto';
import { CORE_LEDGERS } from '../core/modules.js';
import { BuildMaster } from '../runtime/agent.js';

export class DeployDepot {

    private bmStore: Map<string, BuildMaster> = new Map();

    /**
     * Initializes the in-memory store by reading the persistent ledger.
     * Reconstructs BMs from 'bm_meta' and 'dataquad' records in PCT.
     */
    async hydrate() {
        console.log("Hydrating Build Masters from PCT ledger...");
        const entries = await CORE_LEDGERS.PCT.readAll();

        // We need to replay history to get the latest state for each BM
        // Map bmId -> { displayName, created, dataquad }
        const reconstruction = new Map<string, any>();

        for (const entry of entries) {
            // Check for bm_meta records
            if (entry.type === 'bm_meta') {
                const { bmId, displayName, createdTs } = entry.data;
                if (!bmId) continue;

                const existing = reconstruction.get(bmId) || {};
                reconstruction.set(bmId, {
                    ...existing,
                    displayName: displayName || existing.displayName,
                    createdTs: createdTs || existing.createdTs || entry.timestamp
                });
            }

            // Check for dataquad records (if we needed to restore state)
            if (entry.type === 'dataquad') {
                const { bmId, dataquad } = entry.data;
                if (!bmId) continue;
                const existing = reconstruction.get(bmId) || {};
                reconstruction.set(bmId, {
                    ...existing,
                    dataquad: dataquad
                });
            }
        }

        // Populate bmStore (atomic reconstruction - no mutation)
        const newStore = new Map<string, BuildMaster>();
        for (const [id, state] of reconstruction.entries()) {
            if (state.displayName) {
                const bm = new BuildMaster(id, state.displayName);
                // In a fuller implementation, we would attach the dataquad state to the agent here
                newStore.set(id, bm);
            }
        }
        // Atomic swap - no destructive clear() operation
        this.bmStore = newStore;
        console.log(`Hydrated ${this.bmStore.size} Build Masters.`);
    }

    /**
     * Deployment = Formation Naming.
     * Creates a new Build Master identity and records it in the PCT ledger (bm_meta).
     * Also records initial DataQuad if provided.
     */
    async deployBM(displayName: string, bmId?: string, dataquad?: any): Promise<BuildMaster> {
        const id = bmId || crypto.randomUUID();
        const createdTs = new Date().toISOString();

        // 1. Record Metadata (Identity)
        const meta = {
            bmId: id,
            displayName,
            createdTs
        };
        await CORE_LEDGERS.PCT.append('bm_meta', meta);

        // 2. Record Initial DataQuad (State/Constitution)
        if (dataquad) {
            await CORE_LEDGERS.PCT.append('dataquad', {
                bmId: id,
                dataquad
            });
        }

        // 3. Update Memory
        const bm = new BuildMaster(id, displayName);
        this.bmStore.set(id, bm);

        return bm;
    }

    async listBMs(): Promise<any[]> {
        // Return from memory, ensuring O(1) read
        return Array.from(this.bmStore.values()).map(bm => ({
            bmId: bm.id,
            displayName: bm.name
        }));
    }
}

export const deployDepot = new DeployDepot();
