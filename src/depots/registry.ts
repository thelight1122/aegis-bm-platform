import { Express } from 'express';

export interface Depot {
    name: string;
    description?: string;
    register?: (app: Express) => void;
    // Potentially other properties for depots
}

export const depots = new Map<string, Depot>();

export function registerDepot(depot: Depot) {
    if (depots.has(depot.name)) {
        console.warn(`Depot ${depot.name} already registered. Skipping.`);
        return;
    }
    depots.set(depot.name, depot);
    console.log(`Registered depot: ${depot.name}`);
}

export function getDepot(name: string): Depot | undefined {
    return depots.get(name);
}

export function listDepots(): Depot[] {
    return Array.from(depots.values());
}
