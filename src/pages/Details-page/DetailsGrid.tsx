import { Col, Row } from "antd";

type ItemProps = {
    children: React.ReactNode;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
};

type DetailsGridProps = {
    children: React.ReactNode;
};

function Item({
    children,
    xs = 24,
    sm = 24,
    md = 12,
    lg = 12,
    xl = 8,
}: ItemProps) {
    return (
        <Col xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
            {children}
        </Col>
    );
}

function DetailsGrid({ children }: DetailsGridProps) {
    return <Row gutter={[12, 12]}>{children}</Row>;
}

DetailsGrid.Item = Item;

export default DetailsGrid as typeof DetailsGrid & {
    Item: typeof Item;
};