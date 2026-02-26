import * as crypto from 'crypto';
import { CORE_LEDGERS } from '../core/modules.js';
import { getTool } from '../tools/registry.js';

export class BuildMaster {
    public bmId: string;
    public displayName: string;

    constructor(bmId: string, displayName: string) {
        this.bmId = bmId;
        this.displayName = displayName;
    }

    static async create(data: { displayName: string }): Promise<BuildMaster> {
        const bmId = `bm_${crypto.randomUUID().slice(0, 8)}`;
        const displayName = data.displayName || 'Anonymous Master';
        const bm = new BuildMaster(bmId, displayName);
        await CORE_LEDGERS.PCT.append('bm_meta', { bmId, displayName });
        return bm;
    }

    static async load(bmId: string): Promise<BuildMaster | null> {
        const entries = await CORE_LEDGERS.PCT.readAll();
        const entry = entries.find(e => e.data?.bmId === bmId);
        if (!entry) return null;
        return new BuildMaster(entry.data.bmId, entry.data.displayName);
    }

    /**
     * The Core Agentic Loop: Observe -> Decide -> Act -> Record
     */
    async run(input: any, meta: any = {}): Promise<any> {
        // 1. OBSERVE
        const observation = {
            rawInput: input,
            meta,
            timestamp: new Date().toISOString()
        };

        // 2. DECIDE
        // The agent exercises sovereign choice based on awareness.
        // For this kernel v0.1.0, the decision logic is simple: map input to available tools.
        // A full implementation would use an inference engine here.
        const toolName = input.toolName || 'echo';
        const toolArgs = input.args || {};

        const decision = {
            chosenTool: toolName,
            rationale: 'Input pattern matches tool capability.'
        };

        // 3. ACT
        // The action is executed externally. AEGIS does not act, the Agent acts.
        let actionResult;
        const tool = getTool(toolName);
        if (tool) {
            try {
                actionResult = await tool.handler(toolArgs);
            } catch (error: any) {
                actionResult = { error: error.message };
            }
        } else {
            actionResult = {
                notice: `Tool '${toolName}' not found in registry.`,
                availableTools: ['echo', 'time']
            };
        }

        // 4. RECORD
        // The cycle is preserved in the ledger.
        const record = {
            bm_id: this.bmId,
            bm_name: this.displayName,
            observation,
            decision,
            actionResult
        };

        // We record to PEER as this is an interaction.
        await CORE_LEDGERS.PEER.append('RUN_CYCLE', record);

        return actionResult;
    }
}
