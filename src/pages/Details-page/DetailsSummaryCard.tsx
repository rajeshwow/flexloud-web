import { Card } from "antd";
import DetailsMetaList from "./DetailsMetaList";

type MetaItem = {
    label: string;
    value?: React.ReactNode;
    span?: number;
};

type DetailsSummaryCardProps = {
    title?: string;
    items: MetaItem[];
};

export default function DetailsSummaryCard({
    title = "Summary",
    items,
}: DetailsSummaryCardProps) {
    return (
        <Card
            className="theme-card"
            title={<span style={{ fontWeight: 700 }}>{title}</span>}
            styles={{ body: { padding: 16 } }}
            style={{ borderRadius: 16 }}
        >
            <DetailsMetaList items={items} />
        </Card>
    );
}