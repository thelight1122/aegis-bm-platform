import { CORE_LEDGERS } from './src/core/modules.js';
import { projectsDepot, teamsDepot, runsDepot } from './src/depots/ide.js';

async function test() {
    console.log("Hydrating...");
    await Promise.all([
        projectsDepot.hydrate(),
        teamsDepot.hydrate(),
        runsDepot.hydrate()
    ]);

    console.log("Listing Projects...");
    const p = await projectsDepot.listProjects();
    console.log("Projects:", p.length);

    console.log("Listing Teams...");
    const t = await teamsDepot.listTeams();
    console.log("Teams:", t.length);

    console.log("Listing Runs...");
    const r = await runsDepot.listRuns();
    console.log("Runs:", r.length);

    if (p.length > 0 && t.length > 0) {
        console.log("Creating Run...");
        const run = await runsDepot.createRun(p[0].projectId, t[0].teamId);
        console.log("Run Created:", run.runId);
    } else {
        console.log("Cannot create run: missing project or team.");
    }
}

test().catch(e => {
    console.error("TEST FAILED");
    console.error(e);
    process.exit(1);
});
