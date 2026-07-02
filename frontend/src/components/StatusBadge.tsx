interface StatusBadgeProps {
    value: string;
}

const getBadgeClassName = (value: string): string => {
    const normalizedValue = value.toLowerCase();

    if (
        normalizedValue.includes("trusted") ||
        normalizedValue.includes("sent") ||
        normalizedValue.includes("approved") ||
        normalizedValue.includes("open")
    ) {
        return "badge badge-success";
    }

    if (
        normalizedValue.includes("pending") ||
        normalizedValue.includes("generated") ||
        normalizedValue.includes("normal")
    ) {
        return "badge badge-warning";
    }

    if (
        normalizedValue.includes("blocked") ||
        normalizedValue.includes("failed") ||
        normalizedValue.includes("rejected") ||
        normalizedValue.includes("ignored")
    ) {
        return "badge badge-danger";
    }

    return "badge";
};

export const StatusBadge = ({ value }: StatusBadgeProps) => {
    return <span className={getBadgeClassName(value)}>{value}</span>;
};