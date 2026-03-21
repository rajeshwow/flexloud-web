import { Col, Row } from "antd";

type MetaItem = {
    label: string;
    value?: React.ReactNode;
    span?: number;
};

type DetailsMetaListProps = {
    items: MetaItem[];
};

export default function DetailsMetaList({ items }: DetailsMetaListProps) {
    return (
        <Row gutter={[16, 20]}>
            {items.map((item, index) => (
                <Col key={`${item.label}-${index}`} span={item.span || 12}>
                    <div style={{ color: "var(--text-secondary, #8c8c8c)", marginBottom: 6 }}>
                        {item.label}
                    </div>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            wordBreak: "break-word",
                        }}
                    >
                        {item.value || "-"}
                    </div>
                </Col>
            ))}
        </Row>
    );
}