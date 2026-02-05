import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface LedgerEntry {
    id: string;
    timestamp: string;
    type: string;
    data: any;
    hash?: string; // Optional integrity check
}

export class Ledger {
    private filePath: string;

    constructor(name: string) {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        this.filePath = path.join(dataDir, `${name}.jsonl`);
    }

    public async append(type: string, data: any): Promise<LedgerEntry> {
        const entry: LedgerEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type,
            data
        };

        const line = JSON.stringify(entry) + '\n';

        await fs.promises.appendFile(this.filePath, line, 'utf8');

        return entry;
    }

    public async readAll(): Promise<LedgerEntry[]> {
        if (!fs.existsSync(this.filePath)) {
            return [];
        }

        const content = await fs.promises.readFile(this.filePath, 'utf8');
        const lines = content.trim().split('\n');
        return lines
            .filter(line => line.trim().length > 0)
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    // Start of handling drift or corruption?
                    // For now, return a partial error entry or skip?
                    // AEGIS says "Drift is information".
                    // We'll return a special error entry if parsing fails, but for now assuming valid writes.
                    return {
                        id: 'error-parsing',
                        timestamp: new Date().toISOString(),
                        type: 'PARSE_ERROR',
                        data: { raw: line }
                    } as LedgerEntry;
                }
            });
    }
}
