export interface Tool {
    name: string;
    description: string;
    execute: (args: any) => Promise<any>;
}

export const tools = new Map<string, Tool>();

export function registerTool(tool: Tool) {
    tools.set(tool.name, tool);
}

// Echo tool
registerTool({
    name: 'echo',
    description: 'Reflects the input back to the observer.',
    execute: async (args: any) => {
        return args;
    }
});

// Time tool
registerTool({
    name: 'time',
    description: 'Returns the current temporal marker.',
    execute: async () => {
        return new Date().toISOString();
    }
});

export function getTool(name: string): Tool | undefined {
    return tools.get(name);
}

export function listTools(): Tool[] {
    return Array.from(tools.values());
}
