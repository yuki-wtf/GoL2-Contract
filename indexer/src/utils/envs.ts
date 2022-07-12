import { apps } from "./const";

export const requiredEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Environmental variable ${name} was not provided.`);
    }

    return value;
}

export const toBool = (value: string) => ["t", "true", "y", "yes", "1"].includes(value.trim().toLowerCase());

export const appType = requiredEnv("APP_TYPE");

if (!apps.includes(appType)) {
    throw new Error(`APP_TYPE must be one of ${apps}.`)
}
