import * as crypto from 'crypto';
import { getTool } from './registry.js';
import { ToolCallRequest, ToolCallResult } from './types.js';
import { runsDepot } from '../depots/ide.js';

export class ToolRunner {
    async execute(runId: string, request: ToolCallRequest): Promise<ToolCallResult> {
        const { toolId, input, requestedBy, correlationId } = request;
        const tool = getTool(toolId);

        // Append 'tool.started' or 'tool.requested'? 
        // User wants tool.requested in Agent Runner, but let's record starting here
        await runsDepot.appendEvent(runId, 'tool_call' as any, `Tool execution started: ${toolId}`, {
            kind: 'tool.started',
            toolId,
            correlationId,
            requestedBy,
            inputSnippet: JSON.stringify(input).slice(0, 100)
        });

        if (!tool) {
            const errorMsg = `Marker Error: Tool ${toolId} not found in registry.`;
            await runsDepot.appendEvent(runId, 'error' as any, errorMsg, {
                kind: 'tool.errored',
                toolId,
                correlationId,
                error: 'NotFound'
            });
            return { correlationId, ok: false, error: 'NotFound' };
        }

        try {
            // Minimal "soft" schema validation (logic only, no enforcement block)
            // For now, we just proceed.

            const output = await tool.handler(input);

            await runsDepot.appendEvent(runId, 'tool_result' as any, `Tool execution completed: ${toolId}`, {
                kind: 'tool.completed',
                toolId,
                correlationId,
                output
            });

            return { correlationId, ok: true, output };
        } catch (e: any) {
            const errorMsg = `Coherence Risk: ${toolId} failed - ${e.message}`;
            await runsDepot.appendEvent(runId, 'error' as any, errorMsg, {
                kind: 'tool.errored',
                toolId,
                correlationId,
                error: e.message
            });
            return { correlationId, ok: false, error: e.message };
        }
    }
}

export const toolRunner = new ToolRunner();
