import { Express } from 'express';
import { registerTool } from '../tools/registry.js';
import { registerDepot } from '../depots/registry.js';

// Import plugin indexes (relative path from src/core to plugins)
// Using .js extension for ESM compatibility in build
import toolPlugins from '../../plugins/tools/index.js';
import depotPlugins from '../../plugins/depots/index.js';

// Plugin Interfaces (as per Prompt)
export interface PluginTool {
    name: string;
    description: string;
    run: (args: any) => Promise<any>;
}

export interface PluginDepot {
    name: string;
    description?: string;
    // "register(appContext) } OR return handlers"
    register?: (app: Express) => void;
}

export async function loadPlugins(app: Express) {
    console.log('Loading plugins...');

    // 1. Load Tools
    console.log(`Found ${toolPlugins.length} custom tools.`);
    for (const p of toolPlugins as PluginTool[]) {
        try {
            console.log(`Registering tool plugin: ${p.name}`);
            registerTool({
                id: p.name.toLowerCase().replace(/\s+/g, '.'),
                name: p.name,
                description: p.description,
                version: '0.1.0-plugin',
                inputSchema: { type: 'object' },
                handler: p.run // Adapter: run -> handler
            });
        } catch (e: any) {
            console.error(`Failed to register tool ${p.name}:`, e.message);
        }
    }

    // 2. Load Depots
    console.log(`Found ${depotPlugins.length} custom depots.`);
    for (const d of depotPlugins as PluginDepot[]) {
        try {
            console.log(`Registering depot plugin: ${d.name}`);
            registerDepot({
                name: d.name,
                description: d.description,
                register: d.register
            });

            // Register routes if provided
            if (typeof d.register === 'function') {
                console.log(`[PLUGIN AUDIT] Depot '${d.name}' registering routes...`);
                d.register(app);
                console.log(`[PLUGIN AUDIT] Depot '${d.name}' registration complete.`);
            }
        } catch (e: any) {
            console.error(`Failed to register depot ${d.name}:`, e.message);
        }
    }

    console.log('Plugin loading complete.');
}
