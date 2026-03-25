import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Result, Space, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";
import ContactDetailsView from "./components/ContactDetailsView";

const { Title } = Typography;

export default function ContactDetailsPage() {
    const { slug = "", id = "" } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [contact, setContact] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const res = await Client.get(withTenant(`/contacts/${id}`));
                setContact(res?.data?.data || res?.data || null);
            } catch (error) {
                message.error("Failed to load contact details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!contact) {
        return (
            <Result
                status="404"
                title="Contact not found"
                extra={
                    <Button onClick={() => navigate(`/${slug}/contacts`)}>
                        Back to Contacts
                    </Button>
                }
            />
        );
    }

    return (
        <div style={{ padding: 16 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: "wrap",
                }}
            >
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(`/${slug}/contacts`)}
                    >
                        Back
                    </Button>

                    <Title level={4} style={{ margin: 0 }}>
                        Contact Details
                    </Title>
                </Space>

                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/${slug}/contacts/${id}/edit`)}
                >
                    Edit Contact
                </Button>
            </div>

            <ContactDetailsView contact={contact} />
        </div>
    );
}