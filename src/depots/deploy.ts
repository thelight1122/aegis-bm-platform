import * as crypto from 'crypto';
import { CORE_LEDGERS } from '../core/modules.js';
import { BuildMaster } from '../runtime/agent.js';

export class DeployDepot {

    /**
     * Deployment = Formation Naming.
     * Creates a new Build Master identity and records it in the SPINE ledger.
     */
    async deployBM(name: string): Promise<BuildMaster> {
        const id = crypto.randomUUID();

        const formation = {
            id,
            name,
            status: 'ACTIVE',
            created_at: new Date().toISOString()
        };

        // Write to SPINE (Structure/Identity)
        await CORE_LEDGERS.SPINE.append('BM_FORMATION', formation);

        return new BuildMaster(id, name);
    }

    async listBMs(): Promise<any[]> {
        const entries = await CORE_LEDGERS.SPINE.readAll();
        // Filter for BM_FORMATION types
        return entries
            .filter(e => e.type === 'BM_FORMATION')
            .map(e => e.data);
    }
}

export const deployDepot = new DeployDepot();
