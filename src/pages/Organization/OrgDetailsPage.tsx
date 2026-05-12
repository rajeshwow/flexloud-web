import {
    ArrowLeftOutlined,
    CloseOutlined,
    EditOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { Button, Form, Space, Spin, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Client } from "../../shared/Utils/api-client";
import { toTitleCase, withTenant } from "../../shared/Utils/utils";
import OrganizationDetailsView from "./components/OrganizationDetailsView";
import OrganizationForm, {
    type OrganizationFormValues,
} from "./components/OrganizationForm";

type RouteParams = {
    slug: string;
    id: string;
};

type SelectOption = {
    label: string;
    value: string;
};

export default function OrgDetailsPage() {
    const navigate = useNavigate();

    const { slug, id } = useParams<RouteParams>();
    const location = useLocation();

    const [form] = Form.useForm<OrganizationFormValues>();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [organization, setOrganization] = useState<any>(null);

    const [industryOptions, setIndustryOptions] = useState<SelectOption[]>([]);
    const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
    const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
    const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
    const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (location.state?.edit) {
            setIsEditing(true);
        }
    }, [location.state]);

    const typeOptions = useMemo<SelectOption[]>(
        () => [
            { label: "Customer", value: "customer" },
            { label: "Partner", value: "partner" },
            { label: "Vendor", value: "vendor" },
            { label: "Other", value: "other" },
        ],
        []
    );

    const mapDetailsToForm = (data: any): OrganizationFormValues => ({
        name: data?.name || "",
        gst_number: data?.gst_number || "",
        email: data?.email || "",
        type: data?.type || undefined,
        industry: data?.industry || undefined,
        assigned_to: data?.assigned_to || undefined,
        registered_address: {
            street: data?.registered_street || "",
            area: data?.registered_area || "",
            postal_code: data?.registered_postal_code || "",
            city_id: data?.registered_city_id || undefined,
            state_id: data?.registered_state_id || undefined,
            country_id: data?.registered_country_id || undefined,
        },
        branches: Array.isArray(data?.branches)
            ? data.branches.map((branch: any) => ({
                id: branch.id,
                name: branch.name || "",
                code: branch.code || "",
                is_head_office: !!branch.is_head_office,
                contact_person: branch.contact_person || "",
                phone: branch.phone || "",
                email: branch.email || "",
                gst_number: branch.gst_number || "",
                assigned_to: branch.assigned_to || undefined,
                billing_street: branch.billing_street || "",
                billing_area: branch.billing_area || "",
                billing_postal_code: branch.billing_postal_code || "",
                billing_city_id: branch.billing_city_id || undefined,
                billing_state_id: branch.billing_state_id || undefined,
                billing_country_id: branch.billing_country_id || undefined,
                shipping_street: branch.shipping_street || "",
                shipping_area: branch.shipping_area || "",
                shipping_postal_code: branch.shipping_postal_code || "",
                shipping_city_id: branch.shipping_city_id || undefined,
                shipping_state_id: branch.shipping_state_id || undefined,
                shipping_country_id: branch.shipping_country_id || undefined,
                is_shipping_same_as_billing: !!branch.is_shipping_same_as_billing,
                status: branch.status || "active",
            }))
            : [],
    });

    const fetchOrganizationDetails = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const res = await Client.get(withTenant(`/organizations/${id}`));
            const data = res?.data?.data || res?.data;
            setOrganization(data);
            form.setFieldsValue(mapDetailsToForm(data));
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to fetch organization details");
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterOptions = async () => {
        try {
            const [industryRes, usersRes, cityRes, stateRes, countryRes] = await Promise.all([
                Client.get(withTenant("/masters/values"), { params: { type_code: "industry", limit: 500 } }),
                Client.get(withTenant("/users"), { params: { page: 1, limit: 500 } }),
                Client.get(withTenant("/masters/values"), { params: { type_code: "city", limit: 500 } }),
                Client.get(withTenant("/masters/values"), { params: { type_code: "state", limit: 500 } }),
                Client.get(withTenant("/masters/values"), { params: { type_code: "country", limit: 500 } }),
            ]);

            setIndustryOptions(
                (industryRes?.data?.data || []).map((item: any) => ({
                    label: toTitleCase(item.label),
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
                    label: toTitleCase(item.label),
                    value: item.id,
                }))
            );

            setStateOptions(
                (stateRes?.data?.data || []).map((item: any) => ({
                    label: toTitleCase(item.label),
                    value: item.id,
                }))
            );

            setCountryOptions(
                (countryRes?.data?.data || []).map((item: any) => ({
                    label: toTitleCase(item.label),
                    value: item.id,
                }))
            );
        } catch {
            // silent
        }
    };

    useEffect(() => {
        fetchMasterOptions();
        fetchOrganizationDetails();
    }, [id]);

    const handleEdit = () => {
        if (!organization) return;
        form.setFieldsValue(mapDetailsToForm(organization));
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (organization) {
            form.setFieldsValue(mapDetailsToForm(organization));
        }
        setIsEditing(false);
    };

    const handleSubmit = async (values: OrganizationFormValues) => {
        if (!id) return;

        try {
            setSaveLoading(true);
            await Client.patch(withTenant(`/organizations/${id}`), values);
            message.success("Organization updated successfully");
            setIsEditing(false);
            fetchOrganizationDetails();
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to update organization");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return <Spin fullscreen />;
    }

    return (
        <div>
            <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/${slug}/organization/view`)}>
                    Back
                </Button>

                {!isEditing ? (
                    <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                        Edit
                    </Button>
                ) : (
                    <Space>
                        <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={saveLoading}
                            onClick={() => form.submit()}
                        >
                            Save
                        </Button>
                    </Space>
                )}
            </Space>

            {!isEditing ? (
                <OrganizationDetailsView organization={organization} />
            ) : (
                <OrganizationForm
                    // form={form}
                    mode="edit"
                    initialData={organization}
                    loading={saveLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleCancelEdit}
                    industryOptions={industryOptions}
                    typeOptions={typeOptions}
                    userOptions={userOptions}
                    cityOptions={cityOptions}
                    stateOptions={stateOptions}
                    countryOptions={countryOptions}
                />
            )}
        </div>
    );
}