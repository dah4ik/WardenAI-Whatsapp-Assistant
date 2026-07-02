interface StatCardProps {
    title: string;
    value: number | string;
    description: string;
}

export const StatCard = ({ title, value, description }: StatCardProps) => {
    return (
        <div className="stat-card">
            <p className="stat-title">{title}</p>
            <strong className="stat-value">{value}</strong>
            <span className="stat-description">{description}</span>
        </div>
    );
};