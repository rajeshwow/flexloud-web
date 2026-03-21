import { Card } from "antd";

type DetailsSectionCardProps = {
    title: string;
    extra?: React.ReactNode;
    children: React.ReactNode;
};

export default function DetailsSectionCard({
    title,
    extra,
    children,
}: DetailsSectionCardProps) {
    return (
        <Card
            className="theme-card"
            title={<span style={{ fontWeight: 700 }}>{title}</span>}
            extra={extra}
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 16 }}
        >
            {children}
        </Card>
    );
}