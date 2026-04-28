import {
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Descriptions, Row, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { toTitleCase } from "../../../shared/Utils/utils";

const { Title, Text } = Typography;

type AddressType = {
    street?: string;
    area?: string;
    postal_code?: string;
    city?: string;
    state?: string;
    country?: string;
};

type EmailItem = {
    email: string;
    primary?: boolean;
    opt_out?: boolean;
    invalid?: boolean;
};

type ContactDetails = {
    id: string;
    first_name?: string;
    last_name?: string;
    mobile?: string;
    birthdate?: string | null;
    primary_contact?: string;
    organization_name?: string | null;
    assigned_to_name?: string | null;
    created_at?: string;
    updated_at?: string;
    emails?: EmailItem[];
    primary_address?: AddressType | null;
    alternate_address?: AddressType | null;
};

type Props = {
    contact: ContactDetails;
};

function formatAddress(address?: AddressType | null) {
    if (!address) return "-";

    const parts = [
        address.street,
        address.area,
        address.city,
        address.state,
        address.country,
        address.postal_code,
    ].filter(Boolean);

    return parts.length ? parts.join(", ") : "-";
}

export default function ContactDetailsView({ contact }: Props) {
    const fullName =
        `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "-";

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
                bordered
                style={{ borderRadius: 16 }}
                bodyStyle={{ padding: 20 }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size={8}>
                            <Space wrap>
                                <Title level={3} style={{ margin: 0 }}>
                                    {fullName}
                                </Title>

                                {contact.primary_contact ? (
                                    <Tag color={contact.primary_contact === "yes" ? "green" : "default"}>
                                        {contact.primary_contact === "yes" ? "Primary Contact" : "Secondary Contact"}
                                    </Tag>
                                ) : null}

                                {contact.organization_name ? (
                                    <Tag color="blue">{contact.organization_name}</Tag>
                                ) : null}

                                {contact.assigned_to_name ? (
                                    <Tag color="purple">{contact.assigned_to_name}</Tag>
                                ) : null}
                            </Space>

                            <Space wrap size={[12, 8]}>
                                <Text>
                                    <PhoneOutlined /> {contact.mobile || "-"}
                                </Text>

                                <Text>
                                    <UserOutlined /> {contact.assigned_to_name || "-"}
                                </Text>

                                <Text>
                                    DOB: {contact.birthdate ? dayjs(contact.birthdate).format("DD MMM YYYY") : "-"}
                                </Text>
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Basic Information" bordered style={{ borderRadius: 16 }}>
                        <Descriptions column={1} size="small" labelStyle={{ width: 140 }}>
                            <Descriptions.Item label="First Name">
                                {contact.first_name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Name">
                                {contact.last_name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mobile">
                                {contact.mobile || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Organization">
                                {contact.organization_name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Assigned To">
                                {toTitleCase(contact.assigned_to_name as string) || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created At">
                                {contact.created_at
                                    ? dayjs(contact.created_at).format("DD MMM YYYY, hh:mm A")
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Updated At">
                                {contact.updated_at
                                    ? dayjs(contact.updated_at).format("DD MMM YYYY, hh:mm A")
                                    : "-"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Email Addresses" bordered style={{ borderRadius: 16 }}>
                        <Space direction="vertical" size={10} style={{ width: "100%" }}>
                            {contact.emails?.length ? (
                                contact.emails.map((item, index) => (
                                    <Card
                                        key={`${item.email}-${index}`}
                                        size="small"
                                        style={{ borderRadius: 12 }}
                                    >
                                        <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                            <Text>
                                                <MailOutlined /> {item.email}
                                            </Text>

                                            <Space wrap>
                                                {item.primary ? <Tag color="green">Primary</Tag> : null}
                                                {item.opt_out ? <Tag color="orange">Opt Out</Tag> : null}
                                                {item.invalid ? <Tag color="red">Invalid</Tag> : null}
                                            </Space>
                                        </Space>
                                    </Card>
                                ))
                            ) : (
                                <Text type="secondary">No email added</Text>
                            )}
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Primary Address" bordered style={{ borderRadius: 16 }}>
                        <Text>
                            <EnvironmentOutlined /> {formatAddress(contact.primary_address)}
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Alternate Address" bordered style={{ borderRadius: 16 }}>
                        <Text>
                            <EnvironmentOutlined /> {formatAddress(contact.alternate_address)}
                        </Text>
                    </Card>
                </Col>
            </Row>
        </Space>
    );
}