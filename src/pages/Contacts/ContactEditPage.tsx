import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Result, Space, Spin, Typography, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "../../shared/Utils/api-client";
import { withTenant } from "../../shared/Utils/utils";
import ContactForm from "./ContactForm";

const { Title } = Typography;

export default function ContactEditPage() {
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
                message.error("Failed to load contact");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    const initialValues = useMemo(() => {
        if (!contact) return undefined;

        return {
            first_name: contact.first_name || "",
            last_name: contact.last_name || "",
            organization_id: contact.organization_id || undefined,
            mobile: contact.mobile || "",
            assigned_to: contact.assigned_to || undefined,
            birthdate: contact.birthdate ? dayjs(contact.birthdate) : undefined,
            primary_contact: contact.primary_contact || undefined,
            emails:
                contact.emails?.length
                    ? contact.emails.map((item: any) => ({
                        email: item.email || "",
                        primary: !!item.primary,
                        optOut: !!item.opt_out,
                        invalid: !!item.invalid,
                    }))
                    : [{ email: "", primary: true, optOut: false, invalid: false }],

            primary_address_street: contact.primary_address?.street || "",
            primary_address_area: contact.primary_address?.area || "",
            primary_address_postal_code: contact.primary_address?.postal_code || "",
            primary_address_city: contact.primary_address?.city || "",
            primary_address_state: contact.primary_address?.state || "",
            primary_address_country: contact.primary_address?.country || "",

            alternate_address_street: contact.alternate_address?.street || "",
            alternate_address_area: contact.alternate_address?.area || "",
            alternate_address_postal_code: contact.alternate_address?.postal_code || "",
            alternate_address_city: contact.alternate_address?.city || "",
            alternate_address_state: contact.alternate_address?.state || "",
            alternate_address_country: contact.alternate_address?.country || "",
        };
    }, [contact]);

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
            <Space style={{ marginBottom: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(`/${slug}/contacts/${id}`)}
                >
                    Back
                </Button>

                <Title level={4} style={{ margin: 0 }}>
                    Edit Contact
                </Title>
            </Space>

            <ContactForm
                mode="edit"
                contactId={id}
                initialValues={initialValues}
                onSuccess={() => navigate(`/${slug}/contacts/${id}`)}
            />
        </div>
    );
}