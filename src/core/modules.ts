import { Ledger } from './ledger.js';

export const CORE_LEDGERS = {
    PEER: new Ledger('PEER'),
    PCT: new Ledger('PCT'),
    NCT: new Ledger('NCT'),
    SPINE: new Ledger('SPINE'),
    PROJECTS: new Ledger('projects'),
    TEAMS: new Ledger('teams'),
    TASKS: new Ledger('tasks'),
    RUNS: new Ledger('runs')
};

// Utilities for "observe, preserve, reflect"
export async function preserve(ledgerName: keyof typeof CORE_LEDGERS, type: string, data: any) {
    return await CORE_LEDGERS[ledgerName].append(type, data);
}

export async function readLedger(ledgerName: keyof typeof CORE_LEDGERS) {
    return await CORE_LEDGERS[ledgerName].readAll();
}
