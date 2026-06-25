import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve(process.cwd(), "../.env")
});

const getRequiredEnv = (key: string, fallback?: string): string => {
    const value = process.env[key] || fallback;

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
};

export const env = {
    nodeEnv: getRequiredEnv("NODE_ENV", "development"),
    port: Number(getRequiredEnv("PORT", "4000")),
    mongodbUri: getRequiredEnv(
        "MONGODB_URI",
        "mongodb://localhost:27017/wardenai"
    ),
    redisUrl: getRequiredEnv("REDIS_URL", "redis://localhost:6379"),
    whatsappAccessToken: getRequiredEnv("WHATSAPP_ACCESS_TOKEN", "replace_me"),
    whatsappPhoneNumberId: getRequiredEnv(
        "WHATSAPP_PHONE_NUMBER_ID",
        "replace_me"
    ),
    whatsappVerifyToken: getRequiredEnv("WHATSAPP_VERIFY_TOKEN", "replace_me"),
    aiProvider: getRequiredEnv("AI_PROVIDER", "mock"),
    aiApiKey: getRequiredEnv("AI_API_KEY", "replace_me"),
    jwtSecret: getRequiredEnv("JWT_SECRET", "replace_me")
};