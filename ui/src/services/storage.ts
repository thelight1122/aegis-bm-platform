const PREFIX = "aegis.deploy.";

export const STORAGE_KEYS = {
    SELECTED_PROJECT_ID: `${PREFIX}selectedProjectId`,
    SELECTED_TEAM_ID: `${PREFIX}selectedTeamId`,
};

export const storage = {
    get: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    set: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Silently fail, user convenience only
        }
    },
    remove: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // Silently fail
        }
    }
};

export function clearDeploySelection() {
    storage.remove(STORAGE_KEYS.SELECTED_PROJECT_ID);
    storage.remove(STORAGE_KEYS.SELECTED_TEAM_ID);
}
