

import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Radio,
    Row,
    Select,
    Tabs,
    Typography
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OpportunityOrderItems, {
    calculateOpportunityLineItem,
    createDefaultOpportunityLineItem,
    type OpportunityLineItem
} from "../../../layouts/ProductSelection";
import { fetchLeads } from "../../../redux/reducers/leads.slice";
import { getProducts } from "../../../redux/reducers/products.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { Client } from "../../../shared/Utils/api-client";
import { companyNames, getQuoteStageOptions, toTitleCase, withTenant } from "../../../shared/Utils/utils";
import ContactForm from "../../Contacts/ContactForm";
import CreateOpportunityPage from "../../Opportunities/createOpportunities";
import OrganizationForm from "../../Organization/components/OrganizationForm";
import CreateLeadForm from "../../leads/CreateLeads";

const { Title, Text } = Typography;
const { TextArea } = Input;

type OptionItem = {
    label: string;
    value: string;
    raw?: any;
};

type MasterValueItem = {
    id: string;
    label: string;
    value: string;
    parent_id?: string | null;
    parent_label?: string | null;
    parent_value?: string | null;
};

type Props = {
    form: any;
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
    submitText?: string;
    isEdit?: boolean;
};




const paymentTermOptions = [
    { label: "Advance", value: "advance" },
    { label: "CDC", value: "cdc" },
    { label: "PDC", value: "pdc" },
];

const termsConditionOptions = [
    { label: "Terms & Conditions", value: "terms_conditions" },
];



function toDate(value?: string | null) {
    return value ? dayjs(value) : undefined;
}

export default function QuoteForm({
    form,
    initialValues,
    onSubmit,
    loading,
    submitText = "Save",
    isEdit,
}: Props) {
    const [organizationOptions, setOrganizationOptions] = useState<OptionItem[]>([]);
    const [userOptions, setUserOptions] = useState<OptionItem[]>([]);

    const [countryOptions, setCountryOptions] = useState<OptionItem[]>([]);
    const [stateOptions, setStateOptions] = useState<OptionItem[]>([]);
    const [cityOptions, setCityOptions] = useState<OptionItem[]>([]);

    const [allStates, setAllStates] = useState<MasterValueItem[]>([]);
    const [allCities, setAllCities] = useState<MasterValueItem[]>([]);

    const watchedFreight = Form.useWatch("freight_charges", form);
    const watchedTaxOnFreight = Form.useWatch("tax_on_freight", form);
    const sameAsBilling = Form.useWatch("same_as_billing", form);

    const billingCountry = Form.useWatch("billing_country", form);
    const billingState = Form.useWatch("billing_state", form);
    const shippingCountry = Form.useWatch("shipping_country", form);
    const shippingState = Form.useWatch("shipping_state", form);
    const [branchOptions, setBranchOptions] = useState<OptionItem[]>([]);
    const [activeTab, setActiveTab] = useState("overview");



    const products = useSelector(
        (state: RootState) => state.products?.productList
    );

    const [lineItems, setLineItems] = useState<OpportunityLineItem[]>([
        createDefaultOpportunityLineItem(),
    ]);

    const dispatch = useDispatch<AppDispatch>();

    const relatedToType = Form.useWatch("related_to_type", form);
    const [relatedToOptions, setRelatedToOptions] = useState<OptionItem[]>([]);
    const [quickCreateOpen, setQuickCreateOpen] = useState(false);
    const [quickCreateLoading, setQuickCreateLoading] = useState(false);
    const [quickCreateForm] = Form.useForm();


    useEffect(() => {
        dispatch(getProducts({ page: 1, limit: 100 }));
    }, [dispatch]);



    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                quotation_date: toDate(initialValues.quotation_date),
                valid_until: toDate(initialValues.valid_until),
                same_as_billing: false,
                line_items:
                    initialValues.line_items?.map((item: any) => ({
                        ...item,
                        quantity: Number(item.quantity || 0),
                        sale_price: Number(item.sale_price || 0),
                        list_price: Number(item.list_price || 0),
                        discount_value: Number(item.discount_value || 0),
                        tax_amount: Number(item.tax_amount || 0),
                        line_total: Number(item.line_total || 0),
                    })) || [],
                related_to_type: initialValues?.related_to_type || undefined,
                related_to_id: initialValues?.related_to_id || undefined,
            });
        } else {
            form.setFieldsValue({
                quotation_date: dayjs(),
                valid_until: dayjs().add(10, "day"),
                validation_period: 10,
                quote_stage: "draft",
                currency: "INR",
                payment_terms: "advance",
                payment_terms_description: paymentTermsDescriptionMap.advance,
                terms_condition: "terms_conditions",
                freight_charges: 0,
                tax_on_freight: 0,
                tax: 0,
                subtotal: 0,
                discount: 0,
                total: 0,
                grand_total: 0,
                same_as_billing: false,
                line_items: [
                    {
                        item_type: "product",
                        quantity: 1,
                        sale_price: 0,
                        list_price: 0,
                        discount_value: 0,
                        discount_type: "pct",
                        tax_amount: 0,
                        line_total: 0,
                    },
                ],
                related_to_type: undefined,
                related_to_id: undefined,
            });
        }

        if (initialValues?.line_items?.length) {
            setLineItems(
                initialValues.line_items.map((item: any) => ({
                    key: item.id || crypto.randomUUID(),
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name || item.name || "",
                    sku: item.sku || "",
                    quantity: Number(item.quantity || 1),
                    price: Number(item.price || item.sale_price || item.list_price || 0),
                    discount: Number(item.discount || item.discount_value || 0),
                    tax: Number(item.tax || 18),
                    cgst: Number(item.cgst || 0),
                    sgst: Number(item.sgst || 0),
                    amount: Number(item.amount || item.line_total || 0),
                }))
            );
        } else {
            setLineItems([createDefaultOpportunityLineItem()]);
        }
    }, [initialValues, form]);


    const paymentTermsDescriptionMap: Record<string, string> = {
        advance: "80% Advance & 20% Upon handover",
        cdc: "Payment through Current Dated Cheque",
        pdc: "Payment through Post Dated Cheque",
    };

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [orgRes, contactRes, oppRes, userRes, countryRes, stateRes, cityRes] =
                    await Promise.all([
                        Client.get(withTenant("/organizations"), { params: { limit: 1000 } }),
                        Client.get(withTenant("/contacts"), { params: { limit: 1000 } }),
                        Client.get(withTenant("/opportunities"), {
                            params: { limit: 1000 },
                        }).catch(() => ({ data: { data: [] } })),
                        Client.get(withTenant("/users"), {
                            params: { limit: 1000 },
                        }).catch(() => ({ data: { data: [] } })),
                        Client.get(withTenant("/masters/values"), {
                            params: { type_code: "country", limit: 1000, is_active: true },
                        }).catch(() => ({ data: { data: [] } })),
                        Client.get(withTenant("/masters/values"), {
                            params: { type_code: "state", limit: 1000, is_active: true },
                        }).catch(() => ({ data: { data: [] } })),
                        Client.get(withTenant("/masters/values"), {
                            params: { type_code: "city", limit: 1000, is_active: true },
                        }).catch(() => ({ data: { data: [] } })),
                    ]);

                const orgData = orgRes?.data?.data || [];
                const contactData = contactRes?.data?.data || [];
                const userData = userRes?.data?.data || [];
                const countries = countryRes?.data?.data || [];
                const states = stateRes?.data?.data || [];
                const cities = cityRes?.data?.data || [];


                setOrganizationOptions(
                    orgData.map((item: any) => ({
                        label: toTitleCase(item.name),
                        value: item.id,
                        raw: item,
                    }))
                );


                setUserOptions(
                    userData.map((item: any) => ({
                        label:
                            toTitleCase(item.name) ||
                            toTitleCase(item.full_name) ||
                            `${toTitleCase(item.first_name || "")} ${toTitleCase(item.last_name || "")}`.trim() ||
                            toTitleCase(item.email),
                        value: item.id,
                        raw: item,
                    }))
                );

                setCountryOptions(
                    countries.map((item: MasterValueItem) => ({
                        label: item.label,
                        value: item.value,
                        raw: item,
                    }))
                );

                setAllStates(states);
                setAllCities(cities);
            } catch (error) {
                console.error("Failed to load dropdowns", error);
            }
        };

        loadDropdowns();
    }, []);

    useEffect(() => {
        const filteredStates = billingCountry
            ? allStates.filter(
                (item) =>
                    item.parent_value === billingCountry ||
                    item.parent_label === billingCountry
            )
            : allStates;

        const filteredCities = billingState
            ? allCities.filter(
                (item) =>
                    item.parent_value === billingState ||
                    item.parent_label === billingState
            )
            : allCities;

        setStateOptions(
            filteredStates.map((item) => ({
                label: item.label,
                value: item.value,
                raw: item,
            }))
        );

        setCityOptions(
            filteredCities.map((item) => ({
                label: item.label,
                value: item.value,
                raw: item,
            }))
        );
    }, [billingCountry, billingState, allStates, allCities]);

    const shippingStateOptions = useMemo(() => {
        const filtered = shippingCountry
            ? allStates.filter(
                (item) =>
                    item.parent_value === shippingCountry ||
                    item.parent_label === shippingCountry
            )
            : allStates;

        return filtered.map((item) => ({
            label: item.label,
            value: item.value,
            raw: item,
        }));
    }, [shippingCountry, allStates]);

    const shippingCityOptions = useMemo(() => {
        const filtered = shippingState
            ? allCities.filter(
                (item) =>
                    item.parent_value === shippingState ||
                    item.parent_label === shippingState
            )
            : allCities;

        return filtered.map((item) => ({
            label: item.label,
            value: item.value,
            raw: item,
        }));
    }, [shippingState, allCities]);

    const computedSummary = useMemo(() => {
        const subtotal = lineItems.reduce((sum: number, item: OpportunityLineItem) => {
            const calc = calculateOpportunityLineItem(item);
            const taxAmount = Number(calc.cgst || 0) + Number(calc.sgst || 0);

            return sum + Number(calc.amount || 0) - taxAmount;
        }, 0);

        const itemDiscount = lineItems.reduce(
            (sum: number, item: OpportunityLineItem) =>
                sum + Number(item.discount || 0),
            0
        );

        const itemTax = lineItems.reduce((sum: number, item: OpportunityLineItem) => {
            const calc = calculateOpportunityLineItem(item);
            return sum + Number(calc.cgst || 0) + Number(calc.sgst || 0);
        }, 0);

        const freightCharges = Number(watchedFreight || 0);
        const taxOnFreight = Number(watchedTaxOnFreight || 0);

        const total = subtotal - itemDiscount;
        const grandTotal = total + itemTax + freightCharges + taxOnFreight;

        return {
            subtotal,
            discount: itemDiscount,
            tax: itemTax,
            total,
            grandTotal,
        };
    }, [lineItems, watchedFreight, watchedTaxOnFreight]);

    const totals = {
        subtotal: Number(computedSummary.subtotal || 0),
        discount: Number(computedSummary.discount || 0),
        cgst: Number(computedSummary.tax || 0) / 2,
        sgst: Number(computedSummary.tax || 0) / 2,
        tax: Number(computedSummary.tax || 0),
        grandTotal: Number(computedSummary.grandTotal || 0),
    };

    useEffect(() => {
        form.setFieldsValue({
            line_items: lineItems,
            subtotal: Number(computedSummary.subtotal.toFixed(2)),
            discount: Number(computedSummary.discount.toFixed(2)),
            tax: Number(computedSummary.tax.toFixed(2)),
            total: Number(computedSummary.total.toFixed(2)),
            grand_total: Number(computedSummary.grandTotal.toFixed(2)),
        });
    }, [lineItems, computedSummary, form]);

    useEffect(() => {
        if (!sameAsBilling) return;

        form.setFieldsValue({
            shipping_street: form.getFieldValue("billing_street"),
            shipping_area: form.getFieldValue("billing_area"),
            shipping_city: form.getFieldValue("billing_city"),
            shipping_state: form.getFieldValue("billing_state"),
            shipping_country: form.getFieldValue("billing_country"),
            shipping_postal_code: form.getFieldValue("billing_postal_code"),
        });
    }, [
        sameAsBilling,
        form,
        billingCountry,
        billingState,
        Form.useWatch("billing_city", form),
        Form.useWatch("billing_area", form),
        Form.useWatch("billing_street", form),
        Form.useWatch("billing_postal_code", form),
    ]);





    const fillQuoteCustomerFromOrganization = (selectedOrg: any) => {
        if (!selectedOrg) return;

        form.setFieldsValue({
            organization_id: selectedOrg.id,
            // company_name: selectedOrg.name || "",
            gstin:
                selectedOrg.gst_number ||
                selectedOrg.gstin ||
                selectedOrg.head_office?.gst_number ||
                selectedOrg.branches?.find((b: any) => b.is_head_office)?.gst_number ||
                "",
        });

        setBranchesFromOrganization(selectedOrg);
    };

    const getSelectedOrganization = (orgId?: string) => {
        if (!orgId) return null;

        return (
            organizationOptions.find((org) => org.value === orgId)?.raw ||
            relatedToOptions.find((org) => org.value === orgId)?.raw ||
            null
        );
    };

    const getDefaultBranch = (org: any) => {
        if (!org) return null;

        return (
            org.head_office ||
            org.branches?.find((branch: any) => branch.is_head_office) ||
            org.branches?.[0] ||
            null
        );
    };

    const resolveMasterValue = (
        list: MasterValueItem[],
        id?: string | null,
        label?: string | null,
        value?: string | null
    ) => {
        const found = list.find(
            (item) =>
                item.id === id ||
                item.value === value ||
                item.label === label ||
                item.value === label
        );

        return found?.value || value || label || undefined;
    };

    const fillAddressFromBranch = (branch: any) => {
        if (!branch) return;

        form.setFieldsValue({
            organization_branch_id: branch.id,

            gstin: branch.gst_number || form.getFieldValue("gstin") || "",

            billing_street: branch.billing_street || "",
            billing_area: branch.billing_area || "",
            billing_postal_code: branch.billing_postal_code || "",
            billing_country: resolveMasterValue(
                countryOptions.map((item) => item.raw),
                branch.billing_country_id,
                branch.billing_country_name,
                branch.billing_country
            ),
            billing_state: resolveMasterValue(
                allStates,
                branch.billing_state_id,
                branch.billing_state_name,
                branch.billing_state
            ),
            billing_city: resolveMasterValue(
                allCities,
                branch.billing_city_id,
                branch.billing_city_name,
                branch.billing_city
            ),

            shipping_street: branch.shipping_street || "",
            shipping_area: branch.shipping_area || "",
            shipping_postal_code: branch.shipping_postal_code || "",
            shipping_country: resolveMasterValue(
                countryOptions.map((item) => item.raw),
                branch.shipping_country_id,
                branch.shipping_country_name,
                branch.shipping_country
            ),
            shipping_state: resolveMasterValue(
                allStates,
                branch.shipping_state_id,
                branch.shipping_state_name,
                branch.shipping_state
            ),
            shipping_city: resolveMasterValue(
                allCities,
                branch.shipping_city_id,
                branch.shipping_city_name,
                branch.shipping_city
            ),
        });
    };

    const setBranchesFromOrganization = (org: any) => {
        const branches = org?.branches || [];

        setBranchOptions(
            branches.map((branch: any) => ({
                label: branch.is_head_office
                    ? `${branch.name || "Head Office"} (Head Office)`
                    : branch.name || "Branch",
                value: branch.id,
                raw: branch,
            }))
        );

        const defaultBranch = getDefaultBranch(org);

        if (defaultBranch) {
            form.setFieldsValue({
                organization_branch_id: defaultBranch.id,
            });

            fillAddressFromBranch(defaultBranch);
        } else {
            form.setFieldsValue({
                organization_branch_id: undefined,
            });
        }
    };

    const handleOrganizationChange = (orgId?: string) => {
        if (!orgId) {
            setBranchOptions([]);

            form.setFieldsValue({
                organization_id: undefined,
                organization_branch_id: undefined,
                gstin: "",
                // company_name: "",
                billing_street: "",
                billing_area: "",
                billing_city: undefined,
                billing_state: undefined,
                billing_country: undefined,
                billing_postal_code: "",
                shipping_street: "",
                shipping_area: "",
                shipping_city: undefined,
                shipping_state: undefined,
                shipping_country: undefined,
                shipping_postal_code: "",
            });

            return;
        }

        const selectedOrg = getSelectedOrganization(orgId);
        fillQuoteCustomerFromOrganization(selectedOrg);
    };

    const handleBranchChange = (branchId?: string) => {
        if (!branchId) {
            form.setFieldsValue({
                organization_branch_id: undefined,
            });
            return;
        }

        const selectedBranch = branchOptions.find((branch) => branch.value === branchId)?.raw;

        fillAddressFromBranch(selectedBranch);
    };

    const updateValidUntilFromPeriod = (days?: number | null) => {
        const period = Number(days || 0);

        if (!period || period <= 0) {
            form.setFieldsValue({
                valid_until: undefined,
            });
            return;
        }

        const baseDate = form.getFieldValue("quotation_date") || dayjs();

        form.setFieldsValue({
            valid_until: dayjs(baseDate).add(period, "day"),
        });
    };

    const fieldTabMap: Record<string, string> = {
        title: "overview",
        related_to_type: "overview",
        related_to_id: "overview",
        quotation_date: "overview",
        validation_period: "overview",
        valid_until: "overview",
        quote_stage: "overview",
        // company_name: "overview",
        terms_condition: "overview",
        payment_terms: "overview",

        organization_id: "address",
        organization_branch_id: "address",
        contact_id: "address",
        gstin: "address",
        billing_street: "address",
        billing_area: "address",
        billing_country: "address",
        billing_state: "address",
        billing_city: "address",
        billing_postal_code: "address",
        shipping_street: "address",
        shipping_area: "address",
        shipping_country: "address",
        shipping_state: "address",
        shipping_city: "address",
        shipping_postal_code: "address",

        line_items: "items",
    };

    const getFieldName = (name: any) => {
        return Array.isArray(name) ? name[0] : name;
    };

    const handleSubmitFailed = ({ errorFields }: any) => {
        if (!errorFields?.length) return;

        const firstErrorField = errorFields[0];
        const fieldName = getFieldName(firstErrorField.name);
        const targetTab = fieldTabMap[fieldName] || "overview";

        setActiveTab(targetTab);

        const errorMessage =
            firstErrorField?.errors?.[0] || "Please complete required fields";

        message.error(errorMessage);

        setTimeout(() => {
            form.scrollToField(firstErrorField.name, {
                behavior: "smooth",
                block: "center",
            });
        }, 150);
    };

    const submitHandler = (values: any) => {
        const mappedLineItems = lineItems
            .filter((item) => item.product_id)
            .map((item, index) => {
                const calc = calculateOpportunityLineItem(item);

                const quantity = Number(item.quantity || 0);
                const price = Number(item.price || 0);
                const discount = Number(item.discount || 0);
                const taxRate = Number(item.tax || 0);
                const cgst = Number(calc.cgst || 0);
                const sgst = Number(calc.sgst || 0);
                const taxAmount = cgst + sgst;
                const lineTotal = Number(calc.amount || 0);

                return {
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name || "",
                    sku: item.sku || "",
                    item_type: "product",
                    sort_order: index + 1,

                    quantity,
                    list_price: price,
                    sale_price: price,

                    discount_type: "amount",
                    discount_value: discount,

                    tax: taxRate,
                    tax_rate: taxRate,
                    tax_amount: taxAmount,
                    cgst,
                    sgst,

                    line_total: lineTotal,
                    amount: lineTotal,
                };
            });

        const payload = {
            ...values,
            quotation_date: values.quotation_date?.format?.("YYYY-MM-DD"),
            valid_until: values.valid_until?.format?.("YYYY-MM-DD"),
            line_items: mappedLineItems,
            subtotal: Number(computedSummary.subtotal.toFixed(2)),
            discount: Number(computedSummary.discount.toFixed(2)),
            tax: Number(computedSummary.tax.toFixed(2)),
            total: Number(computedSummary.total.toFixed(2)),
            grand_total: Number(computedSummary.grandTotal.toFixed(2)),
        };

        delete payload.same_as_billing;

        onSubmit(payload);
    };

    const handleSubmit = async (values: any) => {

        try {
            // setLoading(true);

            const payload = {
                ...values,
                gst_number: values.gst_number || null,
                email: values.email || null,
                type: values.type || null,
                industry: values.industry || null,
                assigned_to: values.assigned_to || null,
                source: 'system',
                registered_address: {
                    street: values.registered_address?.street || null,
                    area: values.registered_address?.area || null,
                    postal_code: values.registered_address?.postal_code || null,
                    city_id: values.registered_address?.city_id || null,
                    state_id: values.registered_address?.state_id || null,
                    country_id: values.registered_address?.country_id || null,
                },
                branches: (values.branches || []).map((branch: any) => ({
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
            // navigate(`/${slug}/organization/view`);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Failed to create organization");
        } finally {
            // setLoading(false);
        }
    };

    return (
        <>

            <Modal
                // title={`Add New ${getRelatedCreateLabel()}`}
                open={quickCreateOpen}
                onCancel={() => {
                    quickCreateForm.resetFields();
                    setQuickCreateOpen(false);
                }}
                // onOk={() => quickCreateForm.submit()}
                confirmLoading={quickCreateLoading}
                // okText={`Create ${getRelatedCreateLabel()}`}
                width={1000}
                destroyOnHidden
                footer={null}
            >


                {
                    relatedToType === "organization" ? (
                        <OrganizationForm
                            mode="create"
                            loading={loading}
                            onSubmit={handleSubmit} />
                    ) : relatedToType === "contact" ? (
                        <ContactForm onSuccess={() => {
                            quickCreateForm.resetFields();
                            setQuickCreateOpen(false);
                        }} />
                    ) : relatedToType === "lead" ? (
                        <CreateLeadForm
                            redirectOnSuccess={false}
                            onSuccess={(lead) => {
                                setQuickCreateOpen(false);
                                fetchLeads();

                            }}
                            onCancel={() => setQuickCreateOpen(false)}
                        />
                    ) : relatedToType === 'opportunity' ? (
                        <CreateOpportunityPage />
                    ) : null
                }
            </Modal>

            <Form
                layout="vertical"
                form={form}
                onFinish={submitHandler}
                onFinishFailed={handleSubmitFailed}
            >
                <Card bordered={false}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key)}
                        items={[
                            {
                                key: "overview",
                                label: "Overview",
                                forceRender: true,
                                children: (
                                    <>
                                        <Title level={4} style={{ marginTop: 0 }}>
                                            Overview
                                        </Title>

                                        <Row>
                                            <Col>
                                                <Form.Item name="company_name" label="Company" rules={[{ required: true, message: "Company is required" }]}>
                                                    <Radio.Group defaultValue="atvi" options={companyNames} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} md={8}>
                                                <Form.Item
                                                    name="title"
                                                    label="Title"
                                                    rules={[{ required: true, message: "Title is required" }]}
                                                >
                                                    <Input placeholder="Enter quote title" />
                                                </Form.Item>
                                            </Col>


                                            <Col xs={24} md={12} xl={8}>
                                                <Form.Item
                                                    label=" Organization"
                                                    name="organization_id"
                                                    rules={[{ required: true, message: "Organization is required" }]}
                                                >
                                                    <Select
                                                        placeholder="Select  organization"
                                                        showSearch
                                                        optionFilterProp="label"
                                                        options={organizationOptions}
                                                        onChange={handleOrganizationChange}
                                                        allowClear
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={8}>
                                                <Form.Item name="assigned_to" label="Assigned To" rules={[{ required: true, message: "Assigned To is required" }]}>
                                                    <Select
                                                        allowClear
                                                        showSearch
                                                        options={userOptions}
                                                        placeholder="Select user"
                                                        optionFilterProp="label"
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={8}>
                                                <Form.Item
                                                    name="quotation_date"
                                                    label="Quotation Date"
                                                    rules={[{ required: true, message: "Quotation date is required" }]}
                                                >
                                                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={8}>
                                                <Form.Item
                                                    name="validation_period"
                                                    label="Validation Period (In Days)"
                                                    rules={[{ required: true, message: "Validation period is required" }]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        precision={0}
                                                        style={{ width: "100%" }}
                                                        placeholder="Enter days e.g. 5, 10, 30"
                                                        onChange={updateValidUntilFromPeriod}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={8}>
                                                <Form.Item
                                                    name="valid_until"
                                                    label="Valid Until"
                                                    rules={[{ required: true, message: "Valid until is required" }]}
                                                >
                                                    <DatePicker disabledDate={(current) => current.isBefore(dayjs())} style={{ width: "100%" }} format="DD/MM/YYYY" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={8}>
                                                <Form.Item name="material_delivery_time" label="Material Delivery Time">
                                                    <Input placeholder="e.g. 15 days after PO copy" />
                                                </Form.Item>
                                            </Col>




                                            <Col xs={24} md={8}>
                                                <Form.Item
                                                    name="quote_stage"
                                                    label="Quote Stage"
                                                    rules={[{ required: true, message: "Quote stage is required" }]}
                                                >
                                                    <Select options={getQuoteStageOptions()} placeholder="Select stage" />
                                                </Form.Item>
                                            </Col>


                                        </Row>
                                        <Divider />
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="terms_condition" label="Terms Condition">
                                                    <Select options={termsConditionOptions} placeholder="Select terms condition" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="terms_condition_description" label="Terms Condition">
                                                    <TextArea defaultValue={
                                                        'TAX - \nWarranty - \nMaterial Delivery Time - '
                                                    } rows={4} placeholder="Enter terms condition description" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="payment_terms" label="Payment Terms">
                                                    <Select
                                                        onChange={(value) => {
                                                            form.setFieldsValue({
                                                                payment_terms_description: paymentTermsDescriptionMap[value] || "",
                                                            });
                                                        }}
                                                        options={paymentTermOptions} placeholder="Select payment terms" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={12}>
                                                <Form.Item name="payment_terms_description" label="Payment Terms">
                                                    <TextArea
                                                        defaultValue={'80% Advance & 20% Upon handover'}
                                                        rows={4}
                                                        placeholder="Enter payment terms description" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                    </>
                                ),
                            },
                            {
                                key: "address",
                                label: "Customer & Address",
                                forceRender: true,
                                children: (
                                    <>
                                        <Title level={4} style={{ marginTop: 0 }}>
                                            Address Information
                                        </Title>

                                        <Row gutter={16}>
                                            {/* <Col xs={24} md={6}>
                                                <Form.Item
                                                    name="organization_id"
                                                    label="Organization"
                                                // rules={[{ required: true, message: "Organization is required" }]}
                                                >
                                                    <Select
                                                        allowClear
                                                        showSearch
                                                        options={organizationOptions}
                                                        placeholder="Select organization"
                                                        optionFilterProp="label"
                                                        onChange={handleOrganizationChange}
                                                    />
                                                </Form.Item>
                                            </Col> */}
                                            <Col xs={24} md={6}>
                                                <Form.Item name="organization_branch_id" label="Branch">
                                                    <Select
                                                        allowClear
                                                        showSearch
                                                        options={branchOptions}
                                                        placeholder="Select branch"
                                                        optionFilterProp="label"
                                                        // disabled={!form.getFieldValue("organization_id")}
                                                        onChange={handleBranchChange}
                                                    />
                                                </Form.Item>
                                            </Col>



                                            <Col xs={24} md={6}>
                                                <Form.Item name="gstin" label="GSTIN">
                                                    <Input placeholder="Enter GSTIN" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} md={12}>
                                                <Card size="small" title="Billing Address">
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item name="billing_street" label="Street">
                                                                <TextArea rows={3} />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="billing_area" label="Area">
                                                                <Input />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="billing_country" label="Country">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    options={countryOptions}
                                                                    placeholder="Select country"
                                                                    optionFilterProp="label"
                                                                    onChange={() => {
                                                                        form.setFieldsValue({
                                                                            billing_state: undefined,
                                                                            billing_city: undefined,
                                                                        });
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="billing_state" label="State/Region">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    options={stateOptions}
                                                                    placeholder="Select state"
                                                                    optionFilterProp="label"
                                                                    onChange={() => {
                                                                        form.setFieldsValue({
                                                                            billing_city: undefined,
                                                                        });
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="billing_city" label="City">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    options={cityOptions}
                                                                    placeholder="Select city"
                                                                    optionFilterProp="label"
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="billing_postal_code" label="Postal Code">
                                                                <Input />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Col>

                                            <Col xs={24} md={12}>
                                                <Card
                                                    size="small"
                                                    title="Shipping Address"
                                                    extra={
                                                        <Form.Item name="same_as_billing" valuePropName="checked" noStyle>
                                                            <Checkbox>Same as billing address</Checkbox>
                                                        </Form.Item>
                                                    }
                                                >
                                                    <Row gutter={12}>
                                                        <Col span={24}>
                                                            <Form.Item name="shipping_street" label="Street">
                                                                <TextArea rows={3} />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="shipping_area" label="Area">
                                                                <Input />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="shipping_country" label="Country">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    options={countryOptions}
                                                                    placeholder="Select country"
                                                                    optionFilterProp="label"
                                                                    onChange={() => {
                                                                        form.setFieldsValue({
                                                                            shipping_state: undefined,
                                                                            shipping_city: undefined,
                                                                        });
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="shipping_state" label="State/Region">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    options={shippingStateOptions}
                                                                    placeholder="Select state"
                                                                    optionFilterProp="label"
                                                                    onChange={() => {
                                                                        form.setFieldsValue({
                                                                            shipping_city: undefined,
                                                                        });
                                                                    }}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="shipping_city" label="City">
                                                                <Select
                                                                    allowClear
                                                                    showSearch
                                                                    options={shippingCityOptions}
                                                                    placeholder="Select city"
                                                                    optionFilterProp="label"
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <Form.Item name="shipping_postal_code" label="Postal Code">
                                                                <Input />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </>
                                ),
                            },
                            {
                                key: "items",
                                label: "Items & Totals",
                                forceRender: true,
                                children: (
                                    <>
                                        <OpportunityOrderItems
                                            products={products}
                                            lineItems={lineItems}
                                            setLineItems={setLineItems}
                                            totals={totals}
                                        />

                                        {isEdit && initialValues?.created_at ? (
                                            <>
                                                <Divider />
                                                <Row gutter={16}>
                                                    <Col xs={24} md={8}>
                                                        <Text type="secondary">
                                                            Created At: {dayjs(initialValues.created_at).format("DD MMM YYYY, hh:mm A")}
                                                        </Text>
                                                    </Col>
                                                    <Col xs={24} md={8}>
                                                        <Text type="secondary">
                                                            Updated At: {dayjs(initialValues.updated_at).format("DD MMM YYYY, hh:mm A")}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                            </>
                                        ) : null}
                                    </>
                                ),
                            },
                        ]}
                    />

                    <Divider />

                    <Row>
                        <Col span={24}>
                            <Button block type="primary" htmlType="submit" loading={loading}>
                                {submitText}
                            </Button>
                        </Col>
                    </Row>

                </Card>
            </Form>
        </>
    );
}