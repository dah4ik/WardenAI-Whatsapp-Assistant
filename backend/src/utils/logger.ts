export const logger = {
    info: (message: unknown): void => {
        console.log(`[INFO] ${new Date().toISOString()}`, message);
    },

    warn: (message: unknown): void => {
        console.warn(`[WARN] ${new Date().toISOString()}`, message);
    },

    error: (message: unknown): void => {
        console.error(`[ERROR] ${new Date().toISOString()}`, message);
    }
};