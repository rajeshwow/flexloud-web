import {
    FilterOutlined,
    PlusOutlined,
    SearchOutlined
} from "@ant-design/icons";
import {
    Button,
    Input,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    getProducts,
    type GetProductsParams,
    type ProductItem
} from "../../redux/reducers/products.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title } = Typography;

export default function ProductListPage() {
    const navigate = useNavigate();
    const { slug = "" } = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const {
        productList,
        loading,
        productListPagination
    } = useSelector((state: RootState) => state.products);

    const fetchProducts = (params?: Partial<GetProductsParams>) => {
        if (!slug) return;

        dispatch(
            getProducts({
                page,
                limit,
                search,
                status: "",
                category: "",
                manufacturer: "",
                assigned_to: "",
                ...params,
            })
        );
    };

    useEffect(() => {
        if (!slug) return;

        const timer = setTimeout(() => {
            fetchProducts({
                page: 1,
                limit,
                search,
            });
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [dispatch, slug, search, limit]);

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const nextPage = pagination.current || 1;
        const nextLimit = pagination.pageSize || 10;

        setPage(nextPage);
        setLimit(nextLimit);

        fetchProducts({
            page: nextPage,
            limit: nextLimit,
            search,
        });
    };

    const columns: ColumnsType<ProductItem> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 260,
            render: (value: string) => <span>{value}</span>,
        },
        {
            title: "HSN Code",
            dataIndex: "hsn_code",
            key: "hsn_code",
            width: 130,
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: 180,
        },
        {
            title: "Selling Price",
            dataIndex: "selling_price",
            key: "selling_price",
            width: 140,
            render: (value: number) => `₹${Number(value || 0).toFixed(2)}`,
        },
        {
            title: "Source",
            dataIndex: "source",
            key: "source",
            width: 120,
            render: (source?: string) => (
                <Tag color={source === "tally" ? "blue" : "default"}>
                    {source === "tally" ? "Tally" : "System"}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (value: string) => (
                <Tag color={String(value).toLowerCase() === "active" ? "blue" : "default"}>
                    {value}
                </Tag>
            ),
        },
        {
            title: "Date Created",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (value: string) => {
                if (!value) return "-";

                const date = new Date(value);

                return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            },
        },
    ];

    return (
        <div>
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
                <Title level={4} style={{ margin: 0 }}>
                    Products
                </Title>

                <Space wrap>
                    <Input
                        allowClear
                        placeholder="Search by name, HSN, category, manufacturer..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 320 }}
                    />

                    <Button icon={<FilterOutlined />}>Filter</Button>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/${slug}/products/create`)}
                    >
                        Create Product
                    </Button>
                </Space>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={productList}
                loading={loading}
                onChange={handleTableChange}
                pagination={{
                    current: productListPagination?.page || page,
                    pageSize: productListPagination?.limit || limit,
                    total: productListPagination?.total || 0,
                    showSizeChanger: true,
                    showTotal: (total, range) =>
                        `${range[0]} - ${range[1]} of ${total}`,
                }}
                scroll={{ x: 1400 }}
            />
        </div>
    );
}