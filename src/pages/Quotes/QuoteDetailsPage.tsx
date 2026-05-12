import {
    ArrowLeftOutlined,
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseOutlined,
    EditOutlined,
    FileTextOutlined,
    MailOutlined,
    PhoneOutlined,
    SaveOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Form,
    Row,
    Skeleton,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
    message,
    theme
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ActivityTimeline from "../../layouts/ActivityTimeline";
import { fetchActivityTimeline } from "../../redux/reducers/activity.slice";
import {
    clearQuoteDetails,
    fetchQuoteDetails,
    updateQuote,
} from "../../redux/reducers/quotes.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { getQuoteStatusColor, toTitleCase } from "../../shared/Utils/utils";
import QuoteForm from "./components/QuoteForm";

const { Title, Text, Paragraph } = Typography;

const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    return dayjs(value).isValid() ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "-";
};

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return dayjs(value).isValid() ? dayjs(value).format("DD MMM YYYY") : "-";
};

const money = (value?: number | string | null) => {
    const num = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(num);
};

const getText = (...values: any[]) => {
    for (const value of values) {
        if (!value) continue;

        if (typeof value === "string" || typeof value === "number") {
            return String(value);
        }

        const label =
            value?.label ||
            value?.name ||
            value?.full_name ||
            value?.title ||
            value?.value ||
            value?.email;

        if (label) return String(label);
    }

    return "-";
};



export default function QuoteDetailsPage() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug, id } = useParams();
    const location = useLocation();
    const { token } = theme.useToken();

    const [timelineData, setTimelineData] = useState<any[]>([]);
    const [timelineLoading, setTimelineLoading] = useState(false);

    const isEditMode = useMemo(
        () => location.pathname.endsWith("/edit"),
        [location.pathname]
    );

    const { details, detailsLoading, updateLoading } = useSelector(
        (state: RootState) => state.quotes
    );

    const fetchTimeline = async (quoteId: string) => {
        try {
            setTimelineLoading(true);

            const res = await dispatch(
                fetchActivityTimeline({
                    entityType: "quote",
                    entityId: quoteId,
                })
            ).unwrap();

            setTimelineData(res || []);
        } catch (error) {
            console.error("quote timeline fetch failed", error);
            setTimelineData([]);
        } finally {
            setTimelineLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        fetchTimeline(id);
    }, [id]);

    useEffect(() => {
        if (!id) return;

        dispatch(fetchQuoteDetails(id));

        return () => {
            dispatch(clearQuoteDetails());
        };
    }, [dispatch, id]);

    const handleUpdate = async (values: any) => {
        if (!id) return;

        try {
            await dispatch(updateQuote({ id, payload: values })).unwrap();
            message.success("Quote updated successfully");
            navigate(`/${slug}/quotes/${id}`);
        } catch (error: any) {
            message.error(error || "Failed to update quote");
        }
    };

    if (detailsLoading) {
        return <Skeleton active paragraph={{ rows: 12 }} />;
    }

    if (!details) {
        return (
            <Card>
                <Empty description="Quote not found" />
            </Card>
        );
    }

    const quoteNumber = getText(
        details.quote_display_id,
        details.quote_number,
        details.quote_no,
        details.display_id
    );

    const status = getText(
        details.status_label,
        details.status_name,
        details.status,
        details.quote_stage
    );

    const customerName = getText(
        details.organization_name,
        details.organization,
        details.contact_name,
        details.contact
    );

    const contactName = getText(details.contact_name, details.contact);
    const assignedTo = getText(
        details.assigned_to_name,
        details.assigned_to_full_name,
        details.assigned_to_email,
        details.assigned_to
    );

    const relatedToLabel = (() => {
        switch (details.related_to_type) {
            case "organization":
                return getText(details.organization_name, details.organization);
            case "contact":
                return getText(details.contact_name, details.contact);
            case "lead":
                return getText(details.lead_name, details.lead);
            case "opportunity":
                return getText(details.opportunity_name, details.opportunity);
            default:
                return "-";
        }
    })();

    const validUntil = details.valid_until || details.expiry_date;
    const quoteDate = details.quote_date || details.created_at;

    const items =
        details.items ||
        details.products ||
        details.quote_items ||
        details.line_items ||
        [];

    const itemsSubtotal = items.reduce((sum: number, row: any) => {
        const qty = Number(row.quantity || 0);
        const rate = Number(row.sale_price || row.list_price || row.rate || row.price || row.unit_price || 0);
        const discountValue = Number(row.discount_value || row.discount || row.discount_amount || 0);

        return sum + Math.max(qty * rate - discountValue, 0);
    }, 0);

    const itemsDiscount = items.reduce((sum: number, row: any) => {
        return sum + Number(row.discount_value || row.discount || row.discount_amount || 0);
    }, 0);

    const itemsTax = items.reduce((sum: number, row: any) => {
        return sum + Number(row.tax_amount || 0);
    }, 0);

    const itemsGrandTotal = items.reduce((sum: number, row: any) => {
        return sum + Number(row.line_total || row.total || row.amount || row.final_amount || 0);
    }, 0);

    const subtotal = items.length
        ? itemsSubtotal
        : Number(details.sub_total || details.subtotal || details.amount || 0);

    const discount = items.length
        ? itemsDiscount
        : Number(details.discount_amount || details.discount || 0);

    const tax = items.length
        ? itemsTax
        : Number(details.tax || details.tax_amount || details.gst_amount || 0);

    const grandTotal = items.length
        ? itemsGrandTotal
        : Number(
            details.grand_total ||
            details.total_amount ||
            details.final_amount ||
            details.net_amount ||
            0
        );

    const itemColumns: ColumnsType<any> = [
        {
            title: "Item",
            dataIndex: "name",
            key: "name",
            width: 260,
            render: (_: any, row: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>
                        {getText(
                            toTitleCase(row.product_display_name),
                            toTitleCase(row.product_name),
                            toTitleCase(row.name),
                            toTitleCase(row.title),
                            toTitleCase(row.item_name)
                        )}
                    </Text>

                    {row.hsn_code && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            HSN: {row.hsn_code}
                        </Text>
                    )}

                    {row.description && <Text type="secondary">{row.description}</Text>}
                </Space>
            ),
        },
        {
            title: "Qty",
            dataIndex: "quantity",
            key: "quantity",
            width: 90,
            align: "right",
            render: (value: any) => Number(value || 0).toFixed(2),
        },
        {
            title: "Rate",
            dataIndex: "rate",
            key: "rate",
            width: 140,
            align: "right",
            render: (_: any, row: any) =>
                money(row.sale_price || row.list_price || row.rate || row.price || row.unit_price),
        },
        {
            title: "Discount",
            dataIndex: "discount",
            key: "discount",
            width: 130,
            align: "right",
            render: (_: any, row: any) =>
                money(row.discount_value || row.discount || row.discount_amount),
        },
        {
            title: "GST %",
            dataIndex: "tax_rate",
            key: "tax_rate",
            width: 100,
            align: "right",
            render: (_: any, row: any) => `${Number(row.tax_rate || row.tax || 0).toFixed(2)}%`,
        },
        {
            title: "CGST",
            dataIndex: "tax_type_1",
            key: "tax_type_1",
            width: 120,
            align: "right",
            render: (_: any, row: any) => money(row.tax_type_1 || row.cgst),
        },
        {
            title: "SGST",
            dataIndex: "tax_type_2",
            key: "tax_type_2",
            width: 120,
            align: "right",
            render: (_: any, row: any) => money(row.tax_type_2 || row.sgst),
        },
        {
            title: "Tax",
            dataIndex: "tax_amount",
            key: "tax_amount",
            width: 120,
            align: "right",
            render: (_: any, row: any) => money(row.tax_amount),
        },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            width: 150,
            align: "right",
            render: (_: any, row: any) =>
                money(row.total || row.line_total || row.amount || row.final_amount),
        },
    ];

    return (
        <div>
            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
                wrap
                align="center"
            >
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(`/${slug}/quotes`)}
                    >
                        Back
                    </Button>

                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            {isEditMode ? "Edit Quote" : "Quote Details"}
                        </Title>
                        <Text type="secondary">Manage quotation, customer and amount details</Text>
                    </div>
                </Space>

                {!isEditMode ? (
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/${slug}/quotes/${id}/edit`)}
                    >
                        Edit Quote
                    </Button>
                ) : (
                    <Space>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={() => navigate(`/${slug}/quotes/${id}`)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={updateLoading}
                            onClick={() => form.submit()}
                        >
                            Save Changes
                        </Button>
                    </Space>
                )}
            </Space>

            {isEditMode ? (
                <Card style={{ borderRadius: 18 }}>
                    <QuoteForm
                        form={form}
                        initialValues={details}
                        onSubmit={handleUpdate}
                        loading={updateLoading}
                        submitText="Save"
                        isEdit
                    />
                </Card>
            ) : (
                <>
                    <Card
                        style={{
                            borderRadius: 20,
                            marginBottom: 16,
                            overflow: "hidden",
                            border: `1px solid ${token.colorBorderSecondary}`,
                            background: token.colorBgContainer,
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div
                            style={{
                                padding: 24,
                                background: `linear-gradient(135deg, ${token.colorPrimaryBg}, ${token.colorBgContainer})`,
                                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                            }}
                        >
                            <Row gutter={[20, 20]} align="middle">
                                <Col xs={24} lg={14}>
                                    <Space align="start" size={16}>
                                        <Avatar
                                            size={56}
                                            icon={<FileTextOutlined />}
                                            style={{
                                                background: token.colorPrimary,
                                                color: token.colorWhite,
                                            }}
                                        />

                                        <div>
                                            <Space wrap style={{ marginBottom: 6 }}>
                                                <Title level={2} style={{ margin: 0 }}>
                                                    {quoteNumber}
                                                </Title>
                                                <Tag color={getQuoteStatusColor(status)}>{toTitleCase(status)}</Tag>
                                            </Space> <br />

                                            <Text type="secondary">
                                                Quote for <Text strong>{toTitleCase(customerName as string)}</Text>
                                            </Text>

                                            <div style={{ marginTop: 12 }}>
                                                <Space wrap size={[8, 8]}>
                                                    <Tag icon={<CalendarOutlined />}>
                                                        Quote Date: {formatDate(quoteDate)}
                                                    </Tag>
                                                    <Tag icon={<ClockCircleOutlined />}>
                                                        Valid Until: {formatDate(validUntil)}
                                                    </Tag>
                                                    <Tag icon={<UserOutlined />}>Owner: {toTitleCase(assignedTo as string)}</Tag>
                                                </Space>
                                            </div>
                                        </div>
                                    </Space>
                                </Col>

                                <Col xs={24} lg={10}>
                                    <Row gutter={[12, 12]}>
                                        <Col xs={24} sm={12}>
                                            <Card size="small" style={{ borderRadius: 14 }}>
                                                <Statistic title="Subtotal" value={money(subtotal)} />
                                                <small>Excluding Tax</small>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Card size="small" style={{ borderRadius: 14 }}>
                                                <Statistic title="Grand Total" value={money(grandTotal)} />
                                                <small>Including Tax</small>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>

                        <div style={{ padding: 20 }}>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Space>
                                        <BankOutlined style={{ color: token.colorPrimary }} />
                                        <div>
                                            <Text type="secondary">Customer</Text>
                                            <br />
                                            <Text strong>{toTitleCase(customerName as string)}</Text>
                                        </div>
                                    </Space>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Space>
                                        <UserOutlined style={{ color: token.colorPrimary }} />
                                        <div>
                                            <Text type="secondary">Contact Person</Text>
                                            <br />
                                            <Text strong>{toTitleCase(contactName as string)}</Text>
                                        </div>
                                    </Space>
                                </Col>

                                <Col xs={24} md={8}>
                                    <Space>
                                        <CheckCircleOutlined style={{ color: token.colorPrimary }} />
                                        <div>
                                            <Text type="secondary">Current Status</Text>
                                            <br />
                                            <Tag color={getQuoteStatusColor(status)}>{toTitleCase(status)}</Tag>
                                        </div>
                                    </Space>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} xl={16}>
                            <Card
                                title="Quote Items"
                                style={{ borderRadius: 18, marginBottom: 16 }}
                            >
                                <Table
                                    rowKey={(row, index) => row.id || row.product_id || String(index)}
                                    columns={itemColumns}
                                    dataSource={items}
                                    pagination={false}
                                    size="middle"
                                    locale={{ emptyText: "No quote items found" }}
                                    scroll={{ x: 1250 }}
                                />

                                <Divider />

                                <Row justify="end">
                                    <Col xs={24} sm={14} md={10}>
                                        <Space
                                            direction="vertical"
                                            style={{ width: "100%" }}
                                            size={10}
                                        >
                                            <Row justify="space-between">
                                                <Text type="secondary">Subtotal</Text>
                                                <Text>{money(subtotal)}</Text>
                                            </Row>

                                            <Row justify="space-between">
                                                <Text type="secondary">Discount</Text>
                                                <Text>{money(discount)}</Text>
                                            </Row>

                                            <Row justify="space-between">
                                                <Text type="secondary">Tax / GST</Text>
                                                <Text>{money(tax)}</Text>
                                            </Row>

                                            <Divider style={{ margin: "8px 0" }} />

                                            <Row justify="space-between">
                                                <Title level={5} style={{ margin: 0 }}>
                                                    Grand Total
                                                </Title>
                                                <Title level={5} style={{ margin: 0 }}>
                                                    {money(grandTotal)}
                                                </Title>
                                            </Row>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>

                            <Card
                                title={
                                    <Space>
                                        <FileTextOutlined />
                                        Quote Information
                                    </Space>
                                }
                                style={{ borderRadius: 18 }}
                                styles={{
                                    body: {
                                        paddingTop: 8,
                                    },
                                }}
                            >
                                <Row gutter={[12, 12]}>
                                    {[
                                        {
                                            label: "Quote Number",
                                            value: quoteNumber,
                                        },
                                        {
                                            label: "Status",
                                            value: <Tag color={getQuoteStatusColor(status)}>{toTitleCase(status)}</Tag>,
                                        },
                                        {
                                            label: "Assigned To",
                                            value: toTitleCase(assignedTo as string),
                                        },
                                        {
                                            label: "Quote Date",
                                            value: formatDateTime(quoteDate),
                                        },
                                        {
                                            label: "Valid Until",
                                            value: formatDateTime(validUntil),
                                        },
                                        {
                                            label: "Created At",
                                            value: formatDateTime(details.created_at),
                                        },
                                        {
                                            label: "Updated At",
                                            value: formatDateTime(details.updated_at),
                                        },
                                    ].map((item) => (
                                        <Col xs={24} sm={12} key={item.label}>
                                            <div
                                                style={{
                                                    padding: 14,
                                                    borderRadius: 14,
                                                    background: token.colorFillAlter,
                                                    border: `1px solid ${token.colorBorderSecondary}`,
                                                    height: "100%",
                                                }}
                                            >
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: 12,
                                                        display: "block",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    {item.label}
                                                </Text>

                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        color: token.colorText,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {item.value || "-"}
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>

                            {(details.description || details.notes || details.terms) && (
                                <Card
                                    title="Description, Notes & Terms"
                                    style={{ borderRadius: 18, marginTop: 16 }}
                                >
                                    {details.description && (
                                        <>
                                            <Text strong>Description</Text>
                                            <Paragraph style={{ marginTop: 8 }}>
                                                {details.description}
                                            </Paragraph>
                                        </>
                                    )}

                                    {details.notes && (
                                        <>
                                            <Divider />
                                            <Text strong>Notes</Text>
                                            <Paragraph style={{ marginTop: 8 }}>{details.notes}</Paragraph>
                                        </>
                                    )}

                                    {details.terms && (
                                        <>
                                            <Divider />
                                            <Text strong>Terms & Conditions</Text>
                                            <Paragraph style={{ marginTop: 8 }}>{details.terms}</Paragraph>
                                        </>
                                    )}
                                </Card>
                            )}
                        </Col>

                        <Col xs={24} xl={8}>
                            <Card title="Customer Details" style={{ borderRadius: 18 }}>
                                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                                    <Space align="start">
                                        <Avatar icon={<BankOutlined />} />
                                        <div>
                                            <Text type="secondary">Organization</Text>
                                            <br />
                                            <Text strong>{getText(toTitleCase(details.organization_name), (details.organization))}</Text>
                                        </div>
                                    </Space>

                                    <Space align="start">
                                        <Avatar icon={<UserOutlined />} />
                                        <div>
                                            <Text type="secondary">Contact</Text>
                                            <br />
                                            <Text strong>{toTitleCase(contactName as string)}</Text>
                                        </div>
                                    </Space>

                                    <Space align="start">
                                        <Avatar icon={<MailOutlined />} />
                                        <div>
                                            <Text type="secondary">Email</Text>
                                            <br />
                                            <Text>{getText(details.email, details.contact_email)}</Text>
                                        </div>
                                    </Space>

                                    <Space align="start">
                                        <Avatar icon={<PhoneOutlined />} />
                                        <div>
                                            <Text type="secondary">Phone</Text>
                                            <br />
                                            <Text>
                                                {getText(details.mobile, details.phone, details.contact_mobile)}
                                            </Text>
                                        </div>
                                    </Space>
                                </Space>
                            </Card>

                            <Card
                                title="Amount Summary"
                                style={{ borderRadius: 18, marginTop: 16 }}
                            >
                                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                                    <Row justify="space-between">
                                        <Text type="secondary">Subtotal</Text>
                                        <Text>{money(subtotal)}</Text>
                                    </Row>

                                    <Row justify="space-between">
                                        <Text type="secondary">Discount</Text>
                                        <Text>{money(discount)}</Text>
                                    </Row>

                                    <Row justify="space-between">
                                        <Text type="secondary">Tax / GST</Text>
                                        <Text>{money(tax)}</Text>
                                    </Row>

                                    <Divider style={{ margin: "4px 0" }} />

                                    <Row justify="space-between">
                                        <Text strong>Payable Amount</Text>
                                        <Text strong>{money(grandTotal)}</Text>
                                    </Row>
                                </Space>
                            </Card>

                            <Card
                                title="Quote Timeline"
                                style={{ borderRadius: 18, marginTop: 16 }}
                            >
                                <ActivityTimeline
                                    data={timelineData}
                                    loading={timelineLoading}
                                    title="Quote Timeline"
                                />
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
}