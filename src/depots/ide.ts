import * as crypto from 'crypto';
import { CORE_LEDGERS } from '../core/modules.js';
import { Ledger } from '../core/ledger.js';

export interface Project {
    projectId: string; // internal id
    name: string;
    createdTs: string;
    label?: string;
}

export interface TeamMember {
    bmId: string;
    role: string;
}

export interface Team {
    teamId: string;
    name: string;
    members: TeamMember[];
    createdTs: string;
    label?: string;
}

export interface Task {
    taskId: string;
    title: string;
    intent: string;
    constraints: string[];
    deliverables: string[];
    createdTs: string;
    label?: string;
}

export type RunStatus = 'created' | 'running' | 'completed' | 'failed' | 'halted';

export interface Run {
    runId: string;
    projectId: string;
    teamId: string;
    taskId?: string; // Optional Task association
    toolIds?: string[]; // Tools bonded to this formation
    status: RunStatus;
    createdTs: string;
    startedTs?: string;
    endedTs?: string;
}

export type RunEventKind =
    | 'log'
    | 'error'
    | 'artifact'
    | 'system'
    | 'agent.requested'
    | 'agent.started'
    | 'agent.step'
    | 'agent.completed'
    | 'agent.errored'
    | 'agent.note'
    | 'agent.pause_requested'
    | 'agent.paused'
    | 'agent.resume_requested'
    | 'agent.resumed'
    | 'agent.stop_requested'
    | 'agent.stopped'
    | 'tool.requested'
    | 'tool.started'
    | 'tool.completed'
    | 'tool.errored'
    | 'tool_call' // legacy compatibility
    | 'tool_result'; // legacy compatibility

export interface RunEvent {
    id: string;
    runId: string;
    seq: number;
    ts: string;
    kind: RunEventKind;
    message: string;
    data_json?: any;
}

export class ProjectsDepot {
    private store: Map<string, Project> = new Map();

    async hydrate() {
        const entries = await CORE_LEDGERS.PROJECTS.readAll();
        const newStore = new Map<string, Project>();
        for (const entry of entries) {
            if (entry.data && (entry.type === 'project_meta' || entry.type === 'project_updated')) {
                const project = entry.data as Project;
                if (project.projectId) {
                    newStore.set(project.projectId, project);
                }
            }
        }
        this.store = newStore;
    }

    async createProject(data: Partial<Project>): Promise<Project> {
        const project: Project = {
            projectId: data.projectId || `proj_${crypto.randomUUID().slice(0, 8)}`,
            name: data.name || 'Untitled Project',
            createdTs: new Date().toISOString()
        };
        await CORE_LEDGERS.PROJECTS.append('project_meta', project);
        this.store.set(project.projectId, project);
        return project;
    }

    async listProjects(): Promise<Project[]> {
        return Array.from(this.store.values());
    }
}

export class TeamsDepot {
    private store: Map<string, Team> = new Map();

    async hydrate() {
        const entries = await CORE_LEDGERS.TEAMS.readAll();
        const newStore = new Map<string, Team>();
        for (const entry of entries) {
            if (entry.data && (entry.type === 'team_meta' || entry.type === 'team_updated')) {
                const team = entry.data as Team;
                if (team.teamId) {
                    newStore.set(team.teamId, team);
                }
            }
        }
        this.store = newStore;
    }

    async createTeam(name: string, members: TeamMember[]): Promise<Team> {
        const team: Team = {
            teamId: `team_${crypto.randomUUID().slice(0, 8)}`,
            name,
            members,
            createdTs: new Date().toISOString()
        };
        await CORE_LEDGERS.TEAMS.append('team_meta', team);
        this.store.set(team.teamId, team);
        return team;
    }

    async listTeams(): Promise<Team[]> {
        return Array.from(this.store.values());
    }
}

export class TasksDepot {
    private store: Map<string, Task> = new Map();

    async hydrate() {
        const entries = await CORE_LEDGERS.TASKS.readAll();
        const newStore = new Map<string, Task>();
        for (const entry of entries) {
            if (entry.type === 'task_meta' || entry.type === 'task_updated') {
                const task = entry.data as Task;
                newStore.set(task.taskId, task);
            }
        }
        this.store = newStore;
    }

    async createTask(title: string, intent: string, constraints: string[] = [], deliverables: string[] = []): Promise<Task> {
        const task: Task = {
            taskId: `task_${crypto.randomUUID().slice(0, 8)}`,
            title,
            intent,
            constraints,
            deliverables,
            createdTs: new Date().toISOString()
        };
        await CORE_LEDGERS.TASKS.append('task_meta', task);
        this.store.set(task.taskId, task);
        return task;
    }

    async listTasks(): Promise<Task[]> {
        return Array.from(this.store.values());
    }
}

export class RunsDepot {
    private store: Map<string, Run> = new Map();
    private eventLedgers: Map<string, Ledger> = new Map();

    async hydrate() {
        const entries = await CORE_LEDGERS.RUNS.readAll();
        const newStore = new Map<string, Run>();
        for (const entry of entries) {
            if (entry.data && (entry.type === 'run_meta' || entry.type === 'run_updated')) {
                const run = entry.data as Run;
                if (run.runId) {
                    newStore.set(run.runId, run);
                }
            }
        }
        this.store = newStore;
    }

    private getEventLedger(runId: string): Ledger {
        let l = this.eventLedgers.get(runId);
        if (!l) {
            l = new Ledger(`runs/${runId}`);
            this.eventLedgers.set(runId, l);
        }
        return l;
    }

    async createRun(projectId: string, teamId: string, taskId?: string, toolIds?: string[]): Promise<Run> {
        const runId = `run_${crypto.randomUUID().slice(0, 8)}`;
        const createdTs = new Date().toISOString();

        const run: Run = {
            runId,
            projectId,
            teamId,
            taskId,
            toolIds: toolIds || [],
            status: 'created',
            createdTs
        };

        await CORE_LEDGERS.RUNS.append('run_meta', run);
        this.store.set(runId, run);

        // Append initial system event
        await this.appendEvent(runId, 'system', 'Run created');

        // Async trigger of the simulation run loop
        this.executeRunLoop(runId).catch(console.error);

        return run;
    }

    async setRunTools(runId: string, toolIds: string[]): Promise<Run | null> {
        const run = this.store.get(runId);
        if (!run) return null;

        run.toolIds = toolIds;
        await CORE_LEDGERS.RUNS.append('run_updated', { ...run, label: 'tools_updated' });
        await this.appendEvent(runId, 'system', `Bonding surface updated: ${toolIds.join(', ')}`);
        return run;
    }

    async appendEvent(runId: string, kind: RunEventKind, message: string, data?: any): Promise<RunEvent> {
        const ledger = this.getEventLedger(runId);
        const existing = await ledger.readAll();

        const event: RunEvent = {
            id: crypto.randomUUID(),
            runId,
            seq: existing.length,
            ts: new Date().toISOString(),
            kind,
            message,
            data_json: data
        };

        await ledger.append('event', event);

        // Also record to PEER for global observation
        await CORE_LEDGERS.PEER.append('run_event', { runId, kind, message });

        return event;
    }

    async listRuns(): Promise<Run[]> {
        return Array.from(this.store.values()).sort((a, b) => (b.createdTs || "").localeCompare(a.createdTs || ""));
    }

    async getRun(runId: string): Promise<Run | null> {
        return this.store.get(runId) || null;
    }

    async getRunEvents(runId: string, afterSeq?: number): Promise<RunEvent[]> {
        const ledger = this.getEventLedger(runId);
        const all = await ledger.readAll();
        const events = all.map(e => e.data as RunEvent);
        if (afterSeq !== undefined) {
            return events.filter(e => e.seq > afterSeq);
        }
        return events;
    }

    async executeRunLoop(runId: string) {
        const run = this.store.get(runId);
        if (!run) return;

        // Transition to running
        run.status = 'running';
        run.startedTs = new Date().toISOString();
        await CORE_LEDGERS.RUNS.append('run_updated', { ...run, label: 'updated' });
        await this.appendEvent(runId, 'system', 'Workspace formation active.');

        // Natural Lifecycle Steps (Observational)
        const phases = [
            "Hydrating sovereign context...",
            "Orchestrating formation presence...",
            "Observing autonomous cycles..."
        ];

        for (const phase of phases) {
            await new Promise(r => setTimeout(r, 2000));
            await this.appendEvent(runId, 'log', phase);
        }

        // We leave the run in 'running' state for some time to allow AgentRunner to pulse.
        // For simulation purposes, we'll auto-complete after 30 seconds.
        setTimeout(async () => {
            const currentRun = this.store.get(runId);
            if (currentRun && currentRun.status === 'running') {
                currentRun.status = 'completed';
                currentRun.endedTs = new Date().toISOString();
                await CORE_LEDGERS.RUNS.append('run_updated', { ...currentRun, label: 'updated' });
                await this.appendEvent(runId, 'system', 'Observation cycle concluded.');
            }
        }, 40000);
    }

    async haltRun(runId: string): Promise<Run | null> {
        const run = this.store.get(runId);
        if (!run) return null;

        run.status = 'halted';
        run.endedTs = new Date().toISOString();
        await CORE_LEDGERS.RUNS.append('run_updated', { ...run, label: 'updated' });
        await this.appendEvent(runId, 'system', 'Run halted by user');
        return run;
    }
}

export const projectsDepot = new ProjectsDepot();
export const teamsDepot = new TeamsDepot();
export const tasksDepot = new TasksDepot();
export const runsDepot = new RunsDepot();

export async function ensureSeedData() {
    const projects = await projectsDepot.listProjects();
    const projectSeeds = [
        "AEGIS IDE Skeleton",
        "AEGIS Reflective Widget",
        "Seeker's Academy Platform"
    ];

    for (const name of projectSeeds) {
        if (!projects.some(p => p.name === name)) {
            console.log(`Seeding project: ${name}`);
            await projectsDepot.createProject({ name });
        }
    }

    const teams = await teamsDepot.listTeams();
    const teamSeeds = [
        "Orchestrator",
        "Builder.Backend",
        "Builder.UI",
        "QA",
        "Auditor"
    ];

    for (const name of teamSeeds) {
        if (!teams.some(t => t.name === name)) {
            console.log(`Seeding team: ${name}`);
            await teamsDepot.createTeam(name, []);
        }
    }
}
