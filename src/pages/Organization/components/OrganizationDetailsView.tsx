import { Card, Col, Row, Typography } from "antd";
import { formatDateTime } from "../../../shared/Utils/utils";
import OrganizationBranchesSection from "./OrganizationBranchesSection";
import OrganizationQuickInfoCard from "./OrganizationQuickInfoCard";

const { Title, Text } = Typography;

type Props = {
    organization: any;
};

function renderAddress(parts: Array<string | undefined | null>) {
    return parts.filter(Boolean).join(", ") || "-";
}

export default function OrganizationDetailsView({ organization }: Props) {
    return (
        <>
            <OrganizationQuickInfoCard organization={organization} />

            <Card style={{ marginBottom: 16 }}>
                <Title level={5}>Registered Address</Title>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Text type="secondary">Address</Text>
                        <div>
                            {renderAddress([
                                organization?.registered_street,
                                organization?.registered_area,
                                organization?.registered_city_name,
                                organization?.registered_state_name,
                                organization?.registered_country_name,
                                organization?.registered_postal_code,
                            ])}
                        </div>
                    </Col>

                    <Col xs={24} md={6}>
                        <Text type="secondary">Created At</Text>
                        <div>{formatDateTime(organization?.created_at) || "-"}</div>
                    </Col>

                    <Col xs={24} md={6}>
                        <Text type="secondary">Updated At</Text>
                        <div>{formatDateTime(organization?.updated_at) || "-"}</div>
                    </Col>
                </Row>
            </Card>

            <OrganizationBranchesSection branches={organization?.branches || []} />
        </>
    );
}