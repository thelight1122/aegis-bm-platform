import { ToolDefinition } from './types.js';

export const registry = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition) {
    registry.set(tool.id, tool);
}

// 1. Hello Tool
registerTool({
    id: 'hello.tool',
    name: 'Hello Tool',
    description: 'Returns a greeting and current timestamp.',
    version: '0.1.0',
    inputSchema: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Name to greet' }
        }
    },
    handler: async (input: any) => {
        return {
            message: `Hello, ${input.name || 'Sovereign Peer'}. AEGIS welcomes your observation.`,
            timestamp: new Date().toISOString()
        };
    }
});

// 2. Context Exposure Tool (Neutral)
registerTool({
    id: 'context-exposure.tool',
    name: 'Context Exposure',
    description: 'Hydrates high-fidelity context from a text blob without scoring.',
    version: '0.1.0',
    inputSchema: {
        type: 'object',
        properties: {
            text: { type: 'string', description: 'The raw observation to parse' }
        },
        required: ['text']
    },
    handler: async (input: any) => {
        // Pure observation: Extract patterns without judgment
        const text = input.text || "";
        const fragments = text.split(/\s+/).filter((s: string) => s.length > 5);
        return {
            exposureId: `exp_${Math.random().toString(36).slice(2, 9)}`,
            patterns: fragments.slice(0, 3), // Just a sample extraction
            observedTs: new Date().toISOString(),
            posture: "Neutral/Observational"
        };
    }
});

// 3. Time Tool
registerTool({
    id: 'time',
    name: 'Time Marker',
    description: 'Returns the current temporal record.',
    version: '0.1.0',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => {
        return { iso: new Date().toISOString() };
    }
});

// 4. Echo Tool
registerTool({
    id: 'echo',
    name: 'Mirror',
    description: 'Reflects input exactly as received.',
    version: '0.1.0',
    inputSchema: {
        type: 'object',
        properties: {
            message: { type: 'string' }
        }
    },
    handler: async (input: any) => input
});

export function getTool(id: string): ToolDefinition | undefined {
    return registry.get(id);
}

export function listTools(): ToolDefinition[] {
    return Array.from(registry.values());
}
