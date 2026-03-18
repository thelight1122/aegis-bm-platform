import * as fs from 'fs';
import * as path from 'path';
import { SKILLS_CATALOG, CatalogSkill } from './catalog.js';

export interface Skill {
    id: string;
    name: string;
    description: string;
    content: string;
}

export class SkillsManager {
    private skillsDir: string;

    constructor(skillsDir?: string) {
        // Default to process.cwd()/skills for fallback/standard structure
        this.skillsDir = skillsDir || path.resolve(process.cwd(), 'skills');
    }

    public listSkills(): Skill[] {
        if (!fs.existsSync(this.skillsDir)) return [];

        const items = fs.readdirSync(this.skillsDir);
        const skills: Skill[] = [];

        for (const item of items) {
            const itemPath = path.join(this.skillsDir, item);
            if (!fs.statSync(itemPath).isDirectory()) continue;

            const skillMdPath = path.join(itemPath, 'SKILL.md');
            if (fs.existsSync(skillMdPath)) {
                const content = fs.readFileSync(skillMdPath, 'utf-8');
                const parsed = this.parseSkillMd(content);
                if (parsed) {
                    skills.push({
                        id: item,
                        name: parsed.name || item,
                        description: parsed.description || '',
                        content: content
                    });
                }
            }
        }
        return skills;
    }

    private parseSkillMd(content: string): { name?: string; description?: string } | null {
        const match = content.match(/^---([\s\S]*?)---/);
        if (!match) return null;

        const yamlText = match[1];
        const lines = yamlText.split('\n');
        const result: Record<string, string> = {};

        for (const line of lines) {
            const [key, ...value] = line.split(':');
            if (key && value.length) {
                result[key.trim()] = value.join(':').trim();
            }
        }
        return result as { name?: string; description?: string };
    }

    private getDataDir(): string {
        return path.resolve(process.cwd(), '.data');
    }

    public getCatalog(): (CatalogSkill & { archived?: boolean })[] {
        const skillsMap: Record<string, CatalogSkill & { archived?: boolean }> = {};
        
        // 1. Load Static Defaults
        for (const skill of SKILLS_CATALOG) {
            skillsMap[skill.id] = { ...skill, archived: false };
        }

        // 2. Aggregate from Ledger
        const ledgerPath = path.join(this.getDataDir(), 'skills_catalog.jsonl');
        if (fs.existsSync(ledgerPath)) {
            const lines = fs.readFileSync(ledgerPath, 'utf-8').split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const op = JSON.parse(line);
                    if (op.action === 'add') {
                        skillsMap[op.id] = { ...op.data, id: op.id, archived: false };
                    } else if (op.action === 'edit') {
                        if (skillsMap[op.id]) {
                            skillsMap[op.id] = { ...skillsMap[op.id], ...op.data };
                        }
                    } else if (op.action === 'archive') {
                        if (skillsMap[op.id]) {
                            skillsMap[op.id].archived = true;
                        }
                    }
                } catch (e) {
                    // Ignore malformed lines
                }
            }
        }

        return Object.values(skillsMap);
    }

    public addCatalogSkill(skill: CatalogSkill): boolean {
        const ledgerPath = path.join(this.getDataDir(), 'skills_catalog.jsonl');
        
        // Ensure data dir exists
        const dir = this.getDataDir();
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const op = { id: skill.id, action: 'add', data: skill, timestamp: new Date().toISOString() };
        fs.appendFileSync(ledgerPath, JSON.stringify(op) + '\n');
        return true;
    }

    public editCatalogSkill(id: string, data: Partial<CatalogSkill>): boolean {
        const ledgerPath = path.join(this.getDataDir(), 'skills_catalog.jsonl');
        const op = { id, action: 'edit', data, timestamp: new Date().toISOString() };
        fs.appendFileSync(ledgerPath, JSON.stringify(op) + '\n');
        return true;
    }

    public archiveCatalogSkill(id: string): boolean {
        const ledgerPath = path.join(this.getDataDir(), 'skills_catalog.jsonl');
        const op = { id, action: 'archive', timestamp: new Date().toISOString() };
        fs.appendFileSync(ledgerPath, JSON.stringify(op) + '\n');
        return true;
    }

    public installSkill(skillId: string): boolean {
        const skill = this.getCatalog().find((s) => s.id === skillId);
        if (!skill) return false;

        const skillDir = path.join(this.skillsDir, skill.id);
        if (!fs.existsSync(skillDir)) {
            fs.mkdirSync(skillDir, { recursive: true });
        }

        const skillMdPath = path.join(skillDir, 'SKILL.md');
        fs.writeFileSync(skillMdPath, skill.skillMd, 'utf-8');

        // Create scripts directory
        const scriptsDir = path.join(skillDir, 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }

        return true;
    }
}

// Default instance for backwards compatibility/convenience
const defaultManager = new SkillsManager();
export const listSkills = () => defaultManager.listSkills();
export const getCatalog = () => defaultManager.getCatalog();
export const installSkill = (skillId: string) => defaultManager.installSkill(skillId);
export const addCatalogSkill = (skill: CatalogSkill) => defaultManager.addCatalogSkill(skill);
export const editCatalogSkill = (id: string, data: Partial<CatalogSkill>) => defaultManager.editCatalogSkill(id, data);
export const archiveCatalogSkill = (id: string) => defaultManager.archiveCatalogSkill(id);
