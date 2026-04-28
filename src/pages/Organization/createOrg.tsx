import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form, message, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "../../shared/Utils/api-client";
import { toTitleCase, withTenant } from "../../shared/Utils/utils";
import OrganizationForm, {
    type OrganizationFormValues,
} from "./components/OrganizationForm";

type RouteParams = {
    slug: string;
};

type SelectOption = {
    label: string;
    value: string;
};

export default function CreateOrganizationPage() {
    const navigate = useNavigate();
    const { slug } = useParams<RouteParams>();
    const [form] = Form.useForm<OrganizationFormValues>();

    const [loading, setLoading] = useState(false);

    const [industryOptions, setIndustryOptions] = useState<SelectOption[]>([]);
    const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
    const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
    const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
    const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);

    const typeOptions = useMemo<SelectOption[]>(
        () => [
            { label: "Customer", value: "customer" },
            { label: "Partner", value: "partner" },
            { label: "Vendor", value: "vendor" },
            { label: "Other", value: "other" },
        ],
        []
    );

    const fetchMasterOptions = async () => {
        try {
            const [industryRes, usersRes, cityRes, stateRes, countryRes] = await Promise.all([
                Client.get(withTenant("/masters/values"), {
                    params: { type_code: "industry", limit: 500 },
                }),
                Client.get(withTenant("/users"), {
                    params: { page: 1, limit: 500 },
                }),
                Client.get(withTenant("/masters/values"), {
                    params: { type_code: "city", limit: 500 },
                }),
                Client.get(withTenant("/masters/values"), {
                    params: { type_code: "state", limit: 500 },
                }),
                Client.get(withTenant("/masters/values"), {
                    params: { type_code: "country", limit: 500 },
                }),
            ]);

            setIndustryOptions(
                (industryRes?.data?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );

            setUserOptions(
                (usersRes?.data?.data || []).map((item: any) => ({
                    label: toTitleCase(item.name),
                    value: item.id,
                }))
            );

            setCityOptions(
                (cityRes?.data?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );

            setStateOptions(
                (stateRes?.data?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );

            setCountryOptions(
                (countryRes?.data?.data || []).map((item: any) => ({
                    label: item.label,
                    value: item.id,
                }))
            );
        } catch (error) {
            console.error("Failed to load dropdown options", error);
        }
    };

    useEffect(() => {
        fetchMasterOptions();
    }, []);

    const handleSubmit = async (values: OrganizationFormValues) => {
        try {
            setLoading(true);

            const payload = {
                ...values,
                gst_number: values.gst_number || null,
                email: values.email || null,
                type: values.type || null,
                industry: values.industry || null,
                assigned_to: values.assigned_to || null,
                registered_address: {
                    street: values.registered_address?.street || null,
                    area: values.registered_address?.area || null,
                    postal_code: values.registered_address?.postal_code || null,
                    city_id: values.registered_address?.city_id || null,
                    state_id: values.registered_address?.state_id || null,
                    country_id: values.registered_address?.country_id || null,
                },
                branches: (values.branches || []).map((branch) => ({
                    ...branch,
                    code: branch.code || null,
                    contact_person: branch.contact_person || null,
                    phone: branch.phone || null,
                    email: branch.email || null,
                    gst_number: branch.gst_number || null,
                    assigned_to: branch.assigned_to || null,

                    billing_street: branch.billing_street || null,
                    billing_area: branch.billing_area || null,
                    billing_postal_code: branch.billing_postal_code || null,
                    billing_city_id: branch.billing_city_id || null,
                    billing_state_id: branch.billing_state_id || null,
                    billing_country_id: branch.billing_country_id || null,

                    shipping_street: branch.shipping_street || null,
                    shipping_area: branch.shipping_area || null,
                    shipping_postal_code: branch.shipping_postal_code || null,
                    shipping_city_id: branch.shipping_city_id || null,
                    shipping_state_id: branch.shipping_state_id || null,
                    shipping_country_id: branch.shipping_country_id || null,

                    is_head_office: !!branch.is_head_office,
                    is_shipping_same_as_billing: !!branch.is_shipping_same_as_billing,
                    status: branch.status || "active",
                })),
            };

            const response = await Client.post(withTenant("/organizations"), payload);

            message.success(response?.data?.message || "Organization created successfully");
            form.resetFields();
            navigate(`/${slug}/organizations`);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to create organization");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/${slug}/organizations`)}>
                    Back
                </Button>
            </Space>

            <OrganizationForm
                form={form}
                mode="create"
                loading={loading}
                onSubmit={handleSubmit}
                industryOptions={industryOptions}
                typeOptions={typeOptions}
                userOptions={userOptions}
                cityOptions={cityOptions}
                stateOptions={stateOptions}
                countryOptions={countryOptions}
            />
        </div>
    );
}