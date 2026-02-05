export type ToolInfo = { name: string; description: string };

export type BuildMasterInfo = { bmId: string; displayName: string };

export type DataQuad = {
    cognitive?: Record<string, any>;
    affective?: Record<string, any>;
    operational?: Record<string, any>;
    relational?: Record<string, any>;
};

export type CreateBmRequest = {
    bmId?: string;
    displayName?: string;
    dataquad?: DataQuad;
};

export type RunBmRequest = {
    bmId: string;
    text: string;
    meta?: Record<string, any>;
};

export type TrainingInjectRequest = {
    bmId: string;
    context: string;
    detail?: string;
    tags?: string[];
};

export type DeployRecordRequest = {
    bmId: string;
    pattern: string;
    evidenceRefs?: string[];
};

export type AegisReadAll = {
    peer: any[];
    pct: any[];
    nct: any[];
    spine: any[];
};
