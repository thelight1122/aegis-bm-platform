import * as crypto from 'crypto';
import { CORE_LEDGERS } from '../core/modules.js';
import { getTool } from '../tools/registry.js';

export class BuildMaster {
    public id: string;
    public name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    /**
     * The Core Agentic Loop: Observe -> Decide -> Act -> Record
     */
    async run(input: any): Promise<any> {
        // 1. OBSERVE
        // The agent absorbs the input without judgment.
        // In a full system, this would also read from PCT/NCT for context.
        const observation = {
            rawInput: input,
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
                actionResult = await tool.execute(toolArgs);
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
            bm_id: this.id,
            bm_name: this.name,
            observation,
            decision,
            actionResult
        };

        // We record to PEER as this is an interaction.
        await CORE_LEDGERS.PEER.append('RUN_CYCLE', record);

        return actionResult;
    }
}
