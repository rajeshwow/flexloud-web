import { EyeOutlined, MailOutlined, PlusOutlined, PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuotes, type QuoteItem } from "../../redux/reducers/quotes.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { Client } from "../../shared/Utils/api-client";
import { getQuoteStatusColor, toTitleCase, withTenant } from "../../shared/Utils/utils";
import QuoteEmailModal from "./components/QuoteEmailModal";

const { Title } = Typography;

export default function QuotesListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug } = useParams();

    const { list, listLoading } = useSelector((state: RootState) => state.quotes);
    const [search, setSearch] = useState("");

    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    const [emailModalOpen, setEmailModalOpen] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
    const [printLoadingId, setPrintLoadingId] = useState<string | null>(null);


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
        dispatch(fetchQuotes({ search }));
    }, [dispatch, search]);

    const columns: ColumnsType<QuoteItem> = [
        {
            title: "Quote No",
            dataIndex: "quote_number",
            key: "quote_number",
            width: 160,
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
            render: (value) => <Tag color={getQuoteStatusColor(value)}>{String(value || "").toUpperCase()}</Tag>,
        },
        {
            title: "Quotation Date",
            dataIndex: "quotation_date",
            key: "quotation_date",
            width: 130,
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
            width: 180,
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
            width: 250,
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        loading={previewLoadingId === record.id}
                        onClick={() => handlePreviewPdf(record)}
                    >
                        Preview
                    </Button>

                    <Button
                        size="small"
                        icon={<MailOutlined />}
                        onClick={() => handleSendMail(record)}
                    >
                        Mail
                    </Button>

                    <Button
                        size="small"
                        icon={<PrinterOutlined />}
                        loading={printLoadingId === record.id}
                        onClick={() => handlePrintPdf(record)}
                    >
                        Print
                    </Button>
                    <Button size="small" onClick={() => navigate(`/${slug}/quotes/${record.id}`)}>
                        View
                    </Button>
                    <Button size="small" onClick={() => navigate(`/${slug}/quotes/${record.id}/edit`)}>
                        Edit
                    </Button>
                </Space>
            ),
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
            >
                <Title level={3} style={{ margin: 0 }}>
                    Quotes
                </Title>

                <Space>
                    <Input
                        allowClear
                        placeholder="Search quotes"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 260 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/${slug}/quotes/create`)}>
                        Create Quote
                    </Button>
                </Space>
            </Space>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={list}
                loading={listLoading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1500 }}
            />

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