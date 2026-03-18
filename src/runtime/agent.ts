import * as crypto from 'crypto';
import { CORE_LEDGERS } from '../core/modules.js';
import { getTool } from '../tools/registry.js';
import { listSkills } from '../skills/manager.js';

export class BuildMaster {
    public bmId: string;
    public displayName: string;
    public dataquad?: any;

    constructor(bmId: string, displayName: string, dataquad?: any) {
        this.bmId = bmId;
        this.displayName = displayName;
        this.dataquad = dataquad;
    }

    static async create(data: any): Promise<BuildMaster> {
        const bmId = `bm_${crypto.randomUUID().slice(0, 8)}`;
        const displayName = data.displayName || 'Anonymous Master';
        const bm = new BuildMaster(bmId, displayName);
        await CORE_LEDGERS.PCT.append('bm_meta', { 
            bmId, 
            displayName, 
            dataquad: data.dataquad 
        });
        return bm;
    }

    static async load(bmId: string): Promise<BuildMaster | null> {
        const entries = await CORE_LEDGERS.PCT.readAll();
        const entry = entries.find(e => e.data?.bmId === bmId);
        if (!entry) return null;
        return new BuildMaster(entry.data.bmId, entry.data.displayName, entry.data.dataquad);
    }

    /**
     * The Core Agentic Loop: Observe -> Decide -> Act -> Record
     */
    async run(input: any, meta: any = {}): Promise<any> {
        // 1. OBSERVE
        const selectedSkills = this.dataquad?.operational?.skills || [];
        const allSkills = listSkills();
        const activeSkills = allSkills.filter(s => selectedSkills.includes(s.id));
        const combinedInstructions = activeSkills.map(s => `## Skill: ${s.name}\n${s.content}`).join('\n\n');

        const observation = {
            rawInput: input,
            meta,
            timestamp: new Date().toISOString(),
            systemPrompt: combinedInstructions // Prompt Injection Injection Context
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
