import * as crypto from 'crypto';
import { runsDepot } from '../depots/ide.js';
import { toolRunner } from '../tools/runner.js';

export class AgentRunner {
    async startSession(runId: string, mode: "once" | "untilComplete" = "once", requestedBy: "user" | "system" = "user", providedSessionId?: string) {
        const agentSessionId = providedSessionId || `asess_${crypto.randomUUID().slice(0, 8)}`;

        await runsDepot.appendEvent(runId, 'agent.requested', `Agent session requested: ${agentSessionId}`, {
            agentSessionId,
            mode,
            requestedBy
        });

        await runsDepot.appendEvent(runId, 'agent.started', `Agent session started: ${agentSessionId}`, {
            agentSessionId
        });

        let stepIndex = 0;
        const maxSteps = mode === 'once' ? 1 : 15;
        let active = true;

        while (stepIndex < maxSteps && active) {
            // Check signals at start of step
            const signal = await this.getLatestSignal(runId, agentSessionId);

            if (signal === 'stop') {
                await runsDepot.appendEvent(runId, 'agent.stopped', `Agent session stopped by request: ${agentSessionId}`, {
                    agentSessionId,
                    reason: "stop_requested"
                });
                return agentSessionId;
            }

            if (signal === 'pause') {
                await runsDepot.appendEvent(runId, 'agent.paused', `Agent session paused: ${agentSessionId}`, { agentSessionId });

                // Spin wait for resume or stop
                let waiting = true;
                while (waiting) {
                    await new Promise(r => setTimeout(r, 2000));
                    const nextSignal = await this.getLatestSignal(runId, agentSessionId);
                    if (nextSignal === 'run') {
                        waiting = false;
                        await runsDepot.appendEvent(runId, 'agent.resumed', `Agent session resumed: ${agentSessionId}`, { agentSessionId });
                    } else if (nextSignal === 'stop') {
                        await runsDepot.appendEvent(runId, 'agent.stopped', `Agent session stopped while paused: ${agentSessionId}`, {
                            agentSessionId,
                            reason: "stop_requested"
                        });
                        return agentSessionId;
                    }
                }
            }

            // Execute the step
            const continued = await this.runStep(runId, agentSessionId, stepIndex);
            if (!continued) {
                active = false;
            } else {
                stepIndex++;
                await new Promise(r => setTimeout(r, 2000));
            }

            // Re-check signals at end of step (optional but good for responsiveness)
        }

        await runsDepot.appendEvent(runId, 'agent.completed', `Agent session concluded: ${agentSessionId}`, {
            agentSessionId,
            stepsExecuted: stepIndex
        });

        return agentSessionId;
    }

    private async getLatestSignal(runId: string, sessionId: string): Promise<'run' | 'pause' | 'stop'> {
        const events = await runsDepot.getRunEvents(runId);
        // Find latest control events for this session
        const controlEvents = events.filter(e =>
            e.data_json?.agentSessionId === sessionId &&
            ['agent.pause_requested', 'agent.resume_requested', 'agent.stop_requested'].includes(e.kind)
        );

        if (controlEvents.length === 0) return 'run';
        const latest = controlEvents[controlEvents.length - 1];

        if (latest.kind === 'agent.pause_requested') return 'pause';
        if (latest.kind === 'agent.resume_requested') return 'run';
        if (latest.kind === 'agent.stop_requested') return 'stop';

        return 'run';
    }

    async runStep(runId: string, agentSessionId?: string, stepIndex: number = 0): Promise<boolean> {
        const run = await runsDepot.getRun(runId);
        if (!run || run.status !== 'running') return false;

        const bondedTools = run.toolIds || [];

        await runsDepot.appendEvent(runId, 'agent.step', `Agent step ${stepIndex} in progress...`, {
            agentSessionId,
            stepIndex,
            summary: "Analyzing bonded workspace tools..."
        });

        const events = await runsDepot.getRunEvents(runId);
        const hasTimeMarker = events.some(e => (e.kind === 'tool_result' || e.kind === 'tool.completed') && e.data_json?.toolId === 'time');
        const hasHelloMarker = events.some(e => (e.kind === 'tool_result' || e.kind === 'tool.completed') && e.data_json?.toolId === 'hello.tool');

        let targetToolId = "";
        let input = {};

        if (bondedTools.includes('hello.tool') && !hasHelloMarker) {
            targetToolId = 'hello.tool';
            input = { name: "Agent Alpha" };
        } else if (bondedTools.includes('time') && !hasTimeMarker) {
            targetToolId = 'time';
        }

        if (targetToolId) {
            const correlationId = `corr_${crypto.randomUUID().slice(0, 8)}`;

            // Record 'tool.requested' via append-only event
            await runsDepot.appendEvent(runId, 'tool.requested', `Agent choosing action: ${targetToolId}`, {
                toolId: targetToolId,
                correlationId,
                requestedBy: 'agent'
            });

            // Trigger Runner
            await toolRunner.execute(runId, {
                toolId: targetToolId,
                input,
                requestedBy: 'agent',
                correlationId
            });
            return true;
        } else {
            // No bonded tools to call or already called
            await runsDepot.appendEvent(runId, 'agent.note', 'Agent observing: Workspace coherence maintained. No further actions requested in current step.');
            return false;
        }
    }

    async startGlobalLoop() {
        console.log("Starting Sovereign Agent Global Loop (Pulse)...");
        while (true) {
            try {
                const runs = await runsDepot.listRuns();
                const activeRuns = runs.filter(r => r.status === 'running');

                for (const run of activeRuns) {
                    // Autonomous pulse (no session context)
                    await this.runStep(run.runId);
                }
            } catch (e: any) {
                console.error("Agent Global Loop Error:", e.message);
            }
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

export const agentRunner = new AgentRunner();
