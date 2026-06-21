import { EditFilled, EllipsisOutlined, EyeOutlined, MailOutlined, PlusOutlined, PrinterOutlined, SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, message, Modal, Select, Space, Spin, Table, Tag, Typography, type MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import TableExportButton from "../../layouts/TableExportButton";
import { fetchQuotes, type QuoteItem } from "../../redux/reducers/quotes.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { Client } from "../../shared/Utils/api-client";
import { getQuoteStatusColor, quoteStatusOptions, toTitleCase, withTenant } from "../../shared/Utils/utils";
import QuoteEmailModal from "./components/QuoteEmailModal";

const { Title } = Typography;

export default function QuotesListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    // const { list, listLoading } = useSelector((state: RootState) => state.quotes);
    const { list, listLoading, total } = useSelector(
        (state: RootState) => state.quotes,
    );
    const defaultFilters = {
        search: "",
        stage: undefined as string | undefined,
        assigned_to: undefined as string | undefined,
        so_status: undefined as string | undefined,
        customer_id: undefined as string | undefined,
        organization_id: undefined as string | undefined,
        from_date: undefined as string | undefined,
        to_date: undefined as string | undefined,
    };

    const [filters, setFilters] = useState(defaultFilters);


    const [users, setUsers] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    const [emailModalOpen, setEmailModalOpen] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
    const [printLoadingId, setPrintLoadingId] = useState<string | null>(null);

    const userOptions = users.map((user: any) => ({
        label: toTitleCase(user.name || user.full_name || user.email),
        value: user.id,
    }));

    const handleFiltersChange = (newFilters: Partial<typeof defaultFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setCurrentPage(1);
        setPageSize(10);
    };
    useEffect(() => {
        dispatch(getUsers({ limit: 1000 }))
            .unwrap()
            .then((res: any) => {
                setUsers(res?.data || []);
            })
            .catch(() => {
                message.error("Users load nahi ho paye");
            });
    }, [dispatch]);


    const getQuotePdfBlobUrl = async (quoteId: string) => {
        const res = await Client.get(withTenant(`/quotes/${quoteId}/pdf`), {
            responseType: "blob",
            shouldHideError: true,
        });

        const blob = res.data;

        console.log("PDF blob check:", {
            type: blob?.type,
            size: blob?.size,
        });

        if (!(blob instanceof Blob) || blob.size === 0) {
            throw new Error("Invalid PDF response");
        }

        return URL.createObjectURL(blob);
    };

    const handlePreviewPdf = async (record: QuoteItem) => {
        try {
            setPreviewLoadingId(record.id);

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            const url = await getQuotePdfBlobUrl(record.id);
            setPreviewUrl(url);
            setPreviewOpen(true);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Unable to preview PDF");
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const handlePrintPdf = async (record: QuoteItem) => {
        try {
            setPrintLoadingId(record.id);

            const url = await getQuotePdfBlobUrl(record.id);
            const printWindow = window.open(url, "_blank");

            if (!printWindow) {
                message.error("Please allow popup to print PDF");
                return;
            }

            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
            };

            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error: any) {
            message.error(error?.response?.data?.message || "Unable to print PDF");
        } finally {
            setPrintLoadingId(null);
        }
    };

    const handleSendMail = (record: QuoteItem) => {
        setSelectedQuote(record);
        setEmailModalOpen(true);
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            dispatch(
                fetchQuotes({
                    search: filters.search.trim(),
                    stage: filters.stage,
                    assigned_to: filters.assigned_to,
                    so_status: filters.so_status,
                    customer_id: filters.customer_id,
                    organization_id: filters.organization_id,
                    from_date: filters.from_date,
                    to_date: filters.to_date,
                    page: currentPage,
                    limit: pageSize,
                    offset: (currentPage - 1) * pageSize,
                } as any)
            );
        }, 500);

        return () => window.clearTimeout(timer);
    }, [dispatch, filters, currentPage, pageSize]);

    const columns: ColumnsType<QuoteItem> = [
        {
            title: "Quote No",
            dataIndex: "quote_number",
            key: "quote_number",
            width: 160,
            render: (_, record) => (
                <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/${slug}/quotes/${record.id}`)}>
                    {record.quote_number}
                </Button>
            ),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (_, record) => (
                <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/${slug}/quotes/${record.id}`)}>
                    {toTitleCase(record.title)}
                </Button>
            ),
            width: 200,
        },
        {
            title: "Stage",
            dataIndex: "quote_stage",
            key: "quote_stage",
            width: 120,
            render: (value, record) => {

                return (
                    <Space direction="vertical">
                        <Tag color={getQuoteStatusColor(value)}>{String(value || "").toUpperCase()}</Tag>

                    </Space>
                )
            }

        },
        {
            title: "Quote Date",
            dataIndex: "quotation_date",
            key: "quotation_date",
            width: 100,
            render: (value) => dayjs(value).format("DD MMM YYYY"),
        },
        //assigned to
        {
            title: "Assigned To",
            dataIndex: "assigned_to_name",
            key: "assigned_to_name",
            width: 130,
            render: (value) => toTitleCase(value as string),
        },
        {
            title: "Valid Until",
            dataIndex: "valid_until",
            key: "valid_until",
            width: 100,
            render: (value) => dayjs(value).format("DD MMM YYYY"),
        },
        {
            title: "Grand Total",
            dataIndex: "grand_total",
            key: "grand_total",
            width: 130,
            render: (value) => <Tag color='green'>₹ {Number(value || 0).toFixed(2)}</Tag>,
        },
        {
            title: "Actions",
            key: "actions",
            // fixed: "right",
            width: 180,
            render: (_, record) => {

                //make here three dot menu and inside that menu add all the buttons
                const items: MenuProps['items'] = [
                    {
                        label: "View PDF",
                        key: "view-pdf",
                        icon: <EyeOutlined />,
                        onClick: () => handlePreviewPdf(record),
                    },
                    {
                        label: "Send Mail",
                        key: "send-mail",
                        icon: <MailOutlined />,
                        onClick: () => handleSendMail(record),
                    },
                    {
                        label: "Print PDF",
                        key: "print-pdf",
                        icon: <PrinterOutlined />,
                        onClick: () => handlePrintPdf(record),
                    },
                    // view and edit options here
                    {
                        label: "View Quote",
                        key: "view-quote",
                        icon: <EyeOutlined />,
                        onClick: () => navigate(`/${slug}/quotes/${record.id}`),
                    },
                    {
                        label: "Edit Quote",
                        key: "edit-quote",
                        icon: <EditFilled />,
                        onClick: () => navigate(`/${slug}/quotes/${record.id}/edit`),
                    },
                ];
                const quoteStage = String(record?.quote_stage || "").toLowerCase();
                const canCreateSalesOrder =
                    quoteStage === "approved" &&
                    !record?.sales_order_id;

                return (
                    <Space>
                        <Dropdown menu={{ items }} placement="bottomRight">
                            <Button icon={<EllipsisOutlined />} />
                        </Dropdown>



                        {/* <Button title="View Quote" type="primary" size="small" onClick={() => navigate(`/${slug}/quotes/${record.id}`)}>
                                <EyeOutlined />
                            </Button>

                            <Button title="Edit Quote" type="primary" size="small" onClick={() => navigate(`/${slug}/quotes/${record.id}/edit`)}>
                                <EditFilled />
                            </Button> */}

                        {record?.sales_order_id && (
                            <Button
                                title="View Sales Order"
                                size="small"
                                onClick={() => navigate(`/${slug}/sales-orders/${record.sales_order_id}`)}
                            >
                                View SO
                            </Button>
                        )}
                        {canCreateSalesOrder && (
                            <Button

                                type="primary"
                                size="small"
                                icon={<ShoppingCartOutlined />}
                                onClick={() =>
                                    navigate(`/${slug}/sales-orders/create`, {
                                        state: {
                                            quoteId: record.id,
                                            fromQuote: true,
                                        },
                                    })
                                }
                            >
                                Create SO
                            </Button>
                        )}
                    </Space>
                );
            },
        }
    ];

    return (
        <div>
            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Quotes
                </Title>

                <Space wrap>
                    <Input
                        allowClear
                        placeholder="Search quotes"
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={(e) => handleFiltersChange({ search: e.target.value })}
                        style={{ width: 240 }}
                    />

                    <Select
                        allowClear
                        placeholder="Stage"
                        value={filters.stage}
                        onChange={(value) => handleFiltersChange({ stage: value })}
                        options={quoteStatusOptions}
                        style={{ width: 150 }}
                    />

                    <Select
                        allowClear
                        showSearch
                        placeholder="Assigned To"
                        value={filters.assigned_to}
                        onChange={(value) => handleFiltersChange({ assigned_to: value })}
                        options={userOptions}
                        optionFilterProp="label"
                        style={{ width: 180 }}
                    />



                    <Button
                        onClick={() => {
                            setFilters(defaultFilters);
                            setCurrentPage(1);
                            setPageSize(10);
                        }}
                    >
                        Reset
                    </Button>

                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/${slug}/quotes/create`)}>
                        Create Quote
                    </Button>
                    <TableExportButton
                        moduleKey="quotes"
                        params={{
                            q: filters.search,
                            status: filters.stage,
                            assigned_to: filters.assigned_to,
                            customer_id: filters.customer_id,
                            organization_id: filters.organization_id,
                            from_date: filters.from_date,
                            to_date: filters.to_date,
                        }}
                    />
                </Space>
            </Space>

            <Table
                rowKey="id"
                loading={listLoading}
                dataSource={list}
                columns={columns}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: total || 0,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    onChange: (newPage, newPageSize) => {
                        const nextPageSize = newPageSize || 10;
                        const pageSizeChanged = nextPageSize !== pageSize;

                        setCurrentPage(pageSizeChanged ? 1 : newPage);
                        setPageSize(nextPageSize);
                    },
                }}
            />

            <Modal
                open={!!previewLoadingId}
                footer={null}
                closable={false}
                centered
                maskClosable={false}
                destroyOnHidden
            >
                <div style={{ textAlign: "center", padding: "28px 12px" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16, fontWeight: 500 }}>
                        PDF is generating, please wait...
                    </div>
                </div>
            </Modal>

            <Modal
                open={previewOpen}
                title="Quote PDF Preview"
                onCancel={() => {
                    setPreviewOpen(false);
                    if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl("");
                    }
                }}
                footer={null}
                width="85%"
                centered
                destroyOnHidden
            >
                {previewUrl ? (
                    <iframe
                        src={previewUrl}
                        title="Quote PDF Preview"
                        style={{
                            width: "100%",
                            height: "75vh",
                            border: "none",
                            borderRadius: 8,
                        }}
                    />
                ) : null}
            </Modal>

            <QuoteEmailModal
                open={emailModalOpen}
                quote={selectedQuote}
                onClose={() => {
                    setEmailModalOpen(false);
                    setSelectedQuote(null);
                }}
                onSent={() => {
                    setEmailModalOpen(false);
                    setSelectedQuote(null);
                }}
            />
        </div>
    );
}