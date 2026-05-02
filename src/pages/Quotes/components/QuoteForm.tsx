/* eslint-disable react-hooks/set-state-in-effect */

import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Space,
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
import { fetchContacts } from "../../../redux/reducers/contacts.slice";
import { fetchLeads } from "../../../redux/reducers/leads.slice";
import { fetchOpportunities } from "../../../redux/reducers/opportunities.slice";
import { getOrganization } from "../../../redux/reducers/organization.slice";
import { getProducts } from "../../../redux/reducers/products.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { Client } from "../../../shared/Utils/api-client";
import { toTitleCase, withTenant } from "../../../shared/Utils/utils";

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

const quoteStageOptions = [
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
];

const currencyOptions = [{ label: "Indian Rupee : ₹", value: "INR" }];

const freightTypeOptions = [
    { label: "None", value: "" },
    { label: "Included", value: "included" },
    { label: "Extra", value: "extra" },
];

const paymentTermOptions = [
    { label: "Advance", value: "advance" },
    { label: "Partial", value: "partial" },
    { label: "Post Delivery", value: "post_delivery" },
];

const termsConditionOptions = [
    { label: "Terms & Conditions", value: "terms_conditions" },
];

const validationOptions = [
    { label: "7 Days", value: 7 },
    { label: "15 Days", value: 15 },
    { label: "30 Days", value: 30 },
    { label: "45 Days", value: 45 },
];

function toDate(value?: string | null) {
    return value ? dayjs(value) : undefined;
}

function getLineTotal(item: any) {
    const quantity = Number(item?.quantity || 0);
    const salePrice = Number(item?.sale_price || 0);
    const discountValue = Number(item?.discount_value || 0);
    const discountType = item?.discount_type || "pct";
    const taxAmount = Number(item?.tax_amount || 0);

    const base = quantity * salePrice;
    const discount =
        discountType === "pct" ? (base * discountValue) / 100 : discountValue;

    return Math.max(base - discount + taxAmount, 0);
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
    const [contactOptions, setContactOptions] = useState<OptionItem[]>([]);
    const [opportunityOptions, setOpportunityOptions] = useState<OptionItem[]>([]);
    const [userOptions, setUserOptions] = useState<OptionItem[]>([]);

    const [countryOptions, setCountryOptions] = useState<OptionItem[]>([]);
    const [stateOptions, setStateOptions] = useState<OptionItem[]>([]);
    const [cityOptions, setCityOptions] = useState<OptionItem[]>([]);

    const [allStates, setAllStates] = useState<MasterValueItem[]>([]);
    const [allCities, setAllCities] = useState<MasterValueItem[]>([]);

    const watchedLineItems = Form.useWatch("line_items", form);
    const watchedFreight = Form.useWatch("freight_charges", form);
    const watchedTax = Form.useWatch("tax", form);
    const watchedTaxOnFreight = Form.useWatch("tax_on_freight", form);
    const sameAsBilling = Form.useWatch("same_as_billing", form);

    const billingCountry = Form.useWatch("billing_country", form);
    const billingState = Form.useWatch("billing_state", form);
    const shippingCountry = Form.useWatch("shipping_country", form);
    const shippingState = Form.useWatch("shipping_state", form);
    const products = useSelector(
        (state: RootState) =>
            state.products?.productList
    );
    const [lineItems, setLineItems] = useState<OpportunityLineItem[]>([
        createDefaultOpportunityLineItem(),
    ]);

    const dispatch = useDispatch<AppDispatch>();

    const relatedToType = Form.useWatch("related_to_type", form);
    const [relatedToOptions, setRelatedToOptions] = useState<OptionItem[]>([]);

    useEffect(() => {
        dispatch(getProducts({ page: 1, limit: 100 }));
    }, [dispatch]);


    const normalizeRelatedOptions = (list: any[], type: string): OptionItem[] => {
        switch (type) {
            case "organization":
                return list.map((item) => ({
                    label: toTitleCase(item.name),
                    value: item.id,
                    raw: item,
                }));

            case "contact":
                return list.map((item) => ({
                    label: toTitleCase(`${item.first_name || ""} ${item.last_name || ""}`.trim() || item.email),
                    value: item.id,
                    raw: item,
                }));

            case "lead":
                return list.map((item) => ({
                    label: toTitleCase(`${item.first_name || ""} ${item.last_name || ""}`.trim() || item.email),
                    value: item.id,
                    raw: item,
                }));

            case "opportunity":
                return list.map((item) => ({
                    label: toTitleCase(item.title || item.name || item.opportunity_name),
                    value: item.id,
                    raw: item,
                }));

            default:
                return [];
        }
    };

    const loadRelatedOptions = async (value: string) => {
        try {
            let list: any[] = [];

            if (value === "organization") {
                const res = await dispatch(getOrganization({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            } else if (value === "contact") {
                const res = await dispatch(fetchContacts({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            } else if (value === "lead") {
                const res = await dispatch(fetchLeads({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            } else if (value === "opportunity") {
                const res = await dispatch(fetchOpportunities({ page: 1, limit: 100 })).unwrap();
                list = res?.data || [];
            }

            setRelatedToOptions(normalizeRelatedOptions(list, value));
        } catch (error) {
            setRelatedToOptions([]);
        }
    };

    const handleRelatedToTypeChange = async (value: string) => {
        form.setFieldsValue({
            related_to_id: undefined,
        });

        if (!value) {
            setRelatedToOptions([]);
            return;
        }

        await loadRelatedOptions(value);
    };

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
                valid_until: dayjs().add(30, "day"),
                validation_period: 30,
                quote_stage: "draft",
                currency: "INR",
                payment_terms: "advance",
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

    useEffect(() => {
        if (!relatedToType) {
            setRelatedToOptions([]);
            return;
        }

        loadRelatedOptions(relatedToType);
    }, [relatedToType]);

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
                const oppData = oppRes?.data?.data || [];
                const userData = userRes?.data?.data || [];
                const countries = countryRes?.data?.data || [];
                const states = stateRes?.data?.data || [];
                const cities = cityRes?.data?.data || [];

                setOrganizationOptions(
                    orgData.map((item: any) => ({
                        label: item.name,
                        value: item.id,
                        raw: item,
                    }))
                );

                setContactOptions(
                    contactData.map((item: any) => ({
                        label:
                            `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
                            item.name ||
                            item.email,
                        value: item.id,
                        raw: item,
                    }))
                );

                setOpportunityOptions(
                    oppData.map((item: any) => ({
                        label: item.title || item.name || item.opportunity_name,
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

    const handleOrganizationChange = (orgId: string) => {
        const selectedOrg = organizationOptions.find((org) => org.value === orgId)?.raw;
        if (!selectedOrg) return;

        form.setFieldsValue({
            gstin: selectedOrg.gst_number || selectedOrg.gstin || "",
            billing_street:
                selectedOrg?.registered_address?.street ||
                selectedOrg?.billing_address?.street ||
                "",
            billing_area:
                selectedOrg?.registered_address?.area ||
                selectedOrg?.billing_address?.area ||
                "",
            billing_city:
                selectedOrg?.registered_address?.city ||
                selectedOrg?.billing_address?.city ||
                "",
            billing_state:
                selectedOrg?.registered_address?.state ||
                selectedOrg?.billing_address?.state ||
                "",
            billing_country:
                selectedOrg?.registered_address?.country ||
                selectedOrg?.billing_address?.country ||
                "",
            billing_postal_code:
                selectedOrg?.registered_address?.postal_code ||
                selectedOrg?.billing_address?.postal_code ||
                "",
        });
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

    return (
        <Form layout="vertical" form={form} onFinish={submitHandler}>
            <Card bordered={false}>
                <Title level={4} style={{ marginTop: 0 }}>
                    Overview
                </Title>

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

                    <Col xs={24} md={8}>
                        <Form.Item name="related_to_type" label="Related To">
                            <Select
                                allowClear
                                placeholder="Select type"
                                onChange={handleRelatedToTypeChange}
                                options={[
                                    { label: "Organization", value: "organization" },
                                    { label: "Contact", value: "contact" },
                                    { label: "Lead", value: "lead" },
                                    { label: "Opportunity", value: "opportunity" },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="related_to_id" label="Related Record">
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select related record"
                                disabled={!relatedToType}
                                options={relatedToOptions}
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
                            name="valid_until"
                            label="Valid Until"
                            rules={[{ required: true, message: "Valid until is required" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="validation_period"
                            label="Validation Period"
                            rules={[{ required: true, message: "Validation period is required" }]}
                        >
                            <Select options={validationOptions} placeholder="Select validation period" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="quote_stage"
                            label="Quote Stage"
                            rules={[{ required: true, message: "Quote stage is required" }]}
                        >
                            <Select options={quoteStageOptions} placeholder="Select stage" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="company_name" label="Company">
                            <Input placeholder="Enter company name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="terms_condition" label="Terms Condition">
                            <Select options={termsConditionOptions} placeholder="Select terms condition" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="material_delivery_time" label="Material Delivery Time">
                            <Input placeholder="e.g. 15 days after PO copy" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="payment_terms" label="Payment Terms">
                            <Select options={paymentTermOptions} placeholder="Select payment terms" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="assigned_to" label="Assigned To">
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
                        <Form.Item name="currency" label="Currency">
                            <Select options={currencyOptions} placeholder="Select currency" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="terms_condition_description" label="Terms Condition ">
                            <TextArea rows={4} placeholder="Enter terms condition description" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="payment_terms_description" label="Payment Terms ">
                            <TextArea rows={4} placeholder="Enter payment terms description" />
                        </Form.Item>
                    </Col>


                </Row>

                <Divider />

                <Title level={4}>Address Information</Title>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="organization_id"
                            label="Organization"
                            rules={[{ required: true, message: "Organization is required" }]}
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
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item
                            name="contact_id"
                            label="Contact"
                            rules={[{ required: true, message: "Contact is required" }]}
                        >
                            <Select
                                allowClear
                                showSearch
                                options={contactOptions}
                                placeholder="Select contact"
                                optionFilterProp="label"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
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

                <Divider />

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

                <Divider />

                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {submitText}
                    </Button>
                </Space>
            </Card>
        </Form>
    );
}