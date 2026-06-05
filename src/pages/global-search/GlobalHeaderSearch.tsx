import {
    BankOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";
import {
    Dropdown,
    Empty,
    Input,
    List,
    Spin,
    Tag,
    Typography,
    theme,
} from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    fetchGlobalSearchSuggestions,
    resetGlobalSearchSuggestions,
    type GlobalSearchResult,
} from "../../redux/reducers/global-search.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Text } = Typography;

const MIN_SEARCH_LENGTH = 2;

const typeIconMap: Record<string, React.ReactNode> = {
    sales_order: <ShoppingCartOutlined />,
    purchase_order: <FileSearchOutlined />,
    quote: <FileTextOutlined />,
    product: <ShoppingOutlined />,
    organization: <BankOutlined />,
};

const typeColorMap: Record<string, string> = {
    sales_order: "blue",
    purchase_order: "purple",
    quote: "cyan",
    product: "green",
    organization: "gold",
};

function groupResults(results: GlobalSearchResult[]) {
    return results.reduce<Record<string, GlobalSearchResult[]>>((acc, item) => {
        if (!acc[item.module]) acc[item.module] = [];
        acc[item.module].push(item);
        return acc;
    }, {});
}

export default function GlobalHeaderSearch() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { slug } = useParams();
    const { token } = theme.useToken();

    const searchTimerRef = useRef<number | null>(null);

    const { loading, results } = useSelector(
        (state: RootState) => state.globalSearch,
    );

    const [searchText, setSearchText] = useState("");
    const [open, setOpen] = useState(false);

    const groupedResults = useMemo(() => {
        return groupResults(results || []);
    }, [results]);

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                window.clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpen(false);
        setSearchText("");
        dispatch(resetGlobalSearchSuggestions());
    }, [location.pathname, dispatch]);

    const handleSearch = (value: string) => {
        setSearchText(value);

        if (searchTimerRef.current) {
            window.clearTimeout(searchTimerRef.current);
        }

        const trimmedValue = value.trim();

        if (trimmedValue.length < MIN_SEARCH_LENGTH) {
            dispatch(resetGlobalSearchSuggestions());
            setOpen(false);
            return;
        }

        setOpen(true);

        searchTimerRef.current = window.setTimeout(() => {
            dispatch(
                fetchGlobalSearchSuggestions({
                    q: trimmedValue,
                    limit: 6,
                }),
            );
        }, 300);
    };

    const openRecord = (item: GlobalSearchResult) => {
        if (!slug) return;

        setOpen(false);
        setSearchText("");
        dispatch(resetGlobalSearchSuggestions());

        navigate(`/${slug}${item.redirectUrl}`);
    };

    const handleEnter = () => {
        const trimmedValue = searchText.trim();

        if (!trimmedValue || !slug) return;

        setOpen(false);

        if (results.length === 1) {
            navigate(`/${slug}${results[0].redirectUrl}`);
            return;
        }

        navigate(`/${slug}/global-search?q=${encodeURIComponent(trimmedValue)}`);
    };

    const handleClear = () => {
        setSearchText("");
        setOpen(false);
        dispatch(resetGlobalSearchSuggestions());
    };

    const dropdownContent = (
        <div
            style={{
                width: 430,
                maxHeight: 420,
                overflowY: "auto",
                padding: 10,
                borderRadius: token.borderRadiusLG,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowSecondary,
            }}
        >
            {loading ? (
                <div style={{ padding: 16, textAlign: "center" }}>
                    <Spin size="small" />
                </div>
            ) : searchText.trim().length >= MIN_SEARCH_LENGTH && !results.length ? (
                <div style={{ padding: 16, textAlign: "center" }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No matching records"
                    />
                </div>
            ) : (
                Object.keys(groupedResults).map((moduleName) => (
                    <div key={moduleName} style={{ marginBottom: 10 }}>
                        <div
                            style={{
                                padding: "6px 8px",
                                fontSize: 12,
                                fontWeight: 700,
                                color: token.colorTextSecondary,
                            }}
                        >
                            {moduleName}
                        </div>

                        <List
                            size="small"
                            dataSource={groupedResults[moduleName]}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => openRecord(item)}
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: token.borderRadius,
                                        padding: "9px 10px",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 10,
                                        borderBlockEnd: "none",
                                    }}
                                    onMouseEnter={(event) => {
                                        event.currentTarget.style.background =
                                            token.colorFillTertiary;
                                    }}
                                    onMouseLeave={(event) => {
                                        event.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <div
                                        style={{
                                            marginTop: 3,
                                            color: token.colorTextSecondary,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {typeIconMap[item.type] || <SearchOutlined />}
                                    </div>

                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                marginBottom: 3,
                                            }}
                                        >
                                            <Text
                                                strong
                                                ellipsis
                                                style={{
                                                    maxWidth: 240,
                                                    color: token.colorText,
                                                }}
                                            >
                                                {item.title}
                                            </Text>

                                            <Tag
                                                color={typeColorMap[item.type] || "default"}
                                                style={{ marginInlineEnd: 0 }}
                                            >
                                                {item.module}
                                            </Tag>
                                        </div>

                                        {item.subtitle ? (
                                            <Text
                                                type="secondary"
                                                ellipsis
                                                style={{
                                                    display: "block",
                                                    maxWidth: 360,
                                                    fontSize: 12,
                                                    lineHeight: 1.35,
                                                }}
                                            >
                                                {item.subtitle}
                                            </Text>
                                        ) : null}

                                        {item.description ? (
                                            <Text
                                                type="secondary"
                                                ellipsis
                                                style={{
                                                    display: "block",
                                                    maxWidth: 360,
                                                    fontSize: 12,
                                                    lineHeight: 1.35,
                                                }}
                                            >
                                                {item.description}
                                            </Text>
                                        ) : null}
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                ))
            )}
        </div>
    );

    return (
        <Dropdown
            open={open}
            dropdownRender={() => dropdownContent}
            trigger={["click"]}
            placement="bottomLeft"
            overlayStyle={{
                zIndex: 9999,
            }}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    setOpen(false);
                }
            }}
        >
            <Input
                allowClear
                value={searchText}
                prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
                placeholder="Search..."
                onChange={(event) => handleSearch(event.target.value)}
                onPressEnter={handleEnter}
                onClear={handleClear}
                style={{
                    width: 260,
                    height: 32,
                    borderRadius: token.borderRadius,
                    fontSize: 12,
                    background: token.colorBgContainer,
                    color: token.colorText,
                    borderColor: token.colorBorder,
                }}
            />
        </Dropdown>
    );
}