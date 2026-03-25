import { Card, Col, Row, Tag, Typography } from "antd";

const { Text, Title } = Typography;

type Props = {
    organization: any;
};

export default function OrganizationQuickInfoCard({ organization }: Props) {
    return (
        <Card style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Title level={4} style={{ marginBottom: 8 }}>
                        {organization?.name || "-"}
                    </Title>
                    <Text type="secondary">
                        {organization?.industry_name || organization?.industry || "-"}
                    </Text>
                </Col>

                <Col xs={24} md={12}>
                    <Row gutter={[12, 12]}>
                        <Col span={12}>
                            <Text type="secondary">Type</Text>
                            <div>{organization?.type || "-"}</div>
                        </Col>

                        <Col span={12}>
                            <Text type="secondary">Assigned To</Text>
                            <div>{organization?.assigned_to_name || "-"}</div>
                        </Col>

                        <Col span={12}>
                            <Text type="secondary">Email</Text>
                            <div>{organization?.email || "-"}</div>
                        </Col>

                        <Col span={12}>
                            <Text type="secondary">GST</Text>
                            <div>{organization?.gst_number || "-"}</div>
                        </Col>

                        <Col span={12}>
                            <Text type="secondary">Branches</Text>
                            <div>{organization?.branch_count ?? organization?.branches?.length ?? 0}</div>
                        </Col>

                        <Col span={12}>
                            <Text type="secondary">Head Office</Text>
                            <div>
                                {organization?.head_office_name ? (
                                    <Tag color="blue">{organization.head_office_name}</Tag>
                                ) : (
                                    "-"
                                )}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    );
}