export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    inputSchema: any; // JSON Schema draft-07 style
    outputSchema?: any;
    handler: (input: any) => Promise<any>;
}

export interface ToolCallRequest {
    toolId: string;
    input: any;
    requestedBy: "user" | "agent";
    correlationId: string;
}

export interface ToolCallResult {
    correlationId: string;
    ok: boolean;
    output?: any;
    error?: string;
}
