import { api } from "./client";
import type {
    ToolInfo,
    BuildMasterInfo,
    CreateBmRequest,
    RunBmRequest,
    TrainingInjectRequest,
    DeployRecordRequest,
    AegisReadAll
} from "./types";

export async function health() {
    return api.get<{ ok: boolean; name: string; version: string }>("/health");
}

export async function listTools() {
    return api.get<{ tools: ToolInfo[] }>("/tools");
}

export async function createBm(body: CreateBmRequest) {
    return api.post<{ bmId: string; displayName: string }>("/bm/create", body);
}

export async function listBms() {
    return api.get<{ bms: BuildMasterInfo[] }>("/bm/list");
}

export async function runBm(body: RunBmRequest) {
    return api.post<{ output: { text: string } }>("/bm/run", body);
}

export async function trainingInject(body: TrainingInjectRequest) {
    return api.post<{ record: any }>("/depot/training", body);
}

export async function deployRecord(body: DeployRecordRequest) {
    return api.post<{ record: any }>("/depot/deploy", body);
}

export async function readAll() {
    return api.get<AegisReadAll>("/aegis/readall");
}
