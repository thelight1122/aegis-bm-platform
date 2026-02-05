import { CORE_LEDGERS } from '../core/modules.js';

export class TrainingDepot {

    /**
     * Training = Exposure.
     * We expose the system to patterns by recording them in the NCT (Non-Instructional Conditioning Tensor).
     * No weights are adjusted; the data is simply preserved for future lookups (RAG).
     */
    async expose(pattern: any): Promise<any> {
        return await CORE_LEDGERS.NCT.append('EXPOSURE', pattern);
    }
}

export const trainingDepot = new TrainingDepot();
