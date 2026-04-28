import { Card, Col, Row, Tag, Typography } from "antd";
import { toTitleCase } from "../../../shared/Utils/utils";

const { Title, Text } = Typography;

type Props = {
    branches?: any[];
};

function renderAddress(parts: Array<string | undefined | null>) {
    return parts.filter(Boolean).join(", ") || "-";
}

export default function OrganizationBranchesSection({ branches = [] }: Props) {
    return (
        <Card>
            <Title level={5}>Branches</Title>

            {branches.length === 0 ? (
                <Text type="secondary">No branches available</Text>
            ) : (
                <Row gutter={[16, 16]}>
                    {branches.map((branch) => (
                        <Col xs={24} md={12} key={branch.id || branch.code || branch.name}>
                            <Card size="small">
                                <Row gutter={[12, 12]}>
                                    <Col span={24}>
                                        <SpaceWrap>
                                            <Title level={5} style={{ margin: 0 }}>
                                                {branch.name || "-"}
                                            </Title>
                                            {branch.is_head_office ? <Tag color="blue">Head Office</Tag> : null}
                                            {branch.status ? (
                                                <Tag color={branch.status === "active" ? "green" : "default"}>
                                                    {branch.status}
                                                </Tag>
                                            ) : null}
                                        </SpaceWrap>
                                    </Col>

                                    <Col span={12}>
                                        <Text type="secondary">Code</Text>
                                        <div>{branch.code || "-"}</div>
                                    </Col>

                                    <Col span={12}>
                                        <Text type="secondary">Contact Person</Text>
                                        <div>{branch.contact_person || "-"}</div>
                                    </Col>

                                    <Col span={12}>
                                        <Text type="secondary">Phone</Text>
                                        <div>{branch.phone || "-"}</div>
                                    </Col>

                                    <Col span={12}>
                                        <Text type="secondary">Email</Text>
                                        <div>{branch.email || "-"}</div>
                                    </Col>

                                    <Col span={12}>
                                        <Text type="secondary">GST</Text>
                                        <div>{branch.gst_number || "-"}</div>
                                    </Col>

                                    <Col span={12}>
                                        <Text type="secondary">Assigned To</Text>
                                        <div>{toTitleCase(branch.assigned_to_name as string) || "-"}</div>
                                    </Col>

                                    <Col span={24}>
                                        <Text type="secondary">Billing Address</Text>
                                        <div>
                                            {renderAddress([
                                                branch.billing_street,
                                                branch.billing_area,
                                                branch.billing_city_name,
                                                branch.billing_state_name,
                                                branch.billing_country_name,
                                                branch.billing_postal_code,
                                            ])}
                                        </div>
                                    </Col>

                                    <Col span={24}>
                                        <Text type="secondary">Shipping Address</Text>
                                        <div>
                                            {branch.is_shipping_same_as_billing
                                                ? "Same as billing"
                                                : renderAddress([
                                                    branch.shipping_street,
                                                    branch.shipping_area,
                                                    branch.shipping_city_name,
                                                    branch.shipping_state_name,
                                                    branch.shipping_country_name,
                                                    branch.shipping_postal_code,
                                                ])}
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Card>
    );
}

function SpaceWrap({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {children}
        </div>
    );
}