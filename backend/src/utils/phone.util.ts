export const normalizePhoneNumber = (rawPhoneNumber: string): string => {
    if (!rawPhoneNumber || typeof rawPhoneNumber !== "string") {
        throw new Error("Phone number is required");
    }

    let cleaned = rawPhoneNumber.trim();

    cleaned = cleaned.replace(/[\s()-]/g, "");

    if (cleaned.startsWith("00")) {
        cleaned = `+${cleaned.slice(2)}`;
    }

    if (!cleaned.startsWith("+")) {
        cleaned = `+${cleaned}`;
    }

    const digitsOnly = cleaned.slice(1);

    if (!/^\d+$/.test(digitsOnly)) {
        throw new Error("Phone number must contain only digits and optional plus sign");
    }

    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        throw new Error("Phone number must contain between 8 and 15 digits");
    }

    return cleaned;
};

export const isValidPhoneNumber = (rawPhoneNumber: string): boolean => {
    try {
        normalizePhoneNumber(rawPhoneNumber);
        return true;
    } catch {
        return false;
    }
};