import {
    ApartmentOutlined,
    BankOutlined,
    CheckCircleOutlined,
    DatabaseOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    SearchOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import {
    Badge,
    Button,
    Card,
    Checkbox,
    Col,
    Empty,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTallyCompanies,
    fetchTallyCompanyCostCenterAccess,
    fetchTenantUsers,
    fetchUserCostCenters,
    resetTallyCompanyAccessState,
    setSelectedUserId,
    type TallyCompany,
    type TallyCompanyCostCenter,
    type TenantUser,
    updateTallyCompanyCostCenterAccess,
    updateUserCostCenters,
    type UserCostCenter
} from "../../redux/reducers/tallyCompanies.slice";
import type { AppDispatch, RootState } from "../../redux/store";

const { Title, Text } = Typography;
const { Search } = Input;

function StatPill({
    label,
    value,
}: {
    label: string;
    value?: number | string | null;
}) {
    return (
        <Space size={6}>
            <Text type="secondary">{label}</Text>
            <Tag bordered={false}>{value || 0}</Tag>
        </Space>
    );
}

export default function TallyCompaniesPage() {
    const dispatch = useDispatch<AppDispatch>();

    const {
        items,
        total,
        page,
        limit,
        loading,
        accessLoading,
        savingAccess,
        selectedCompany,
        accessCostCenters,
        users,
        usersLoading,
        selectedUserId,
        userCostCenters,
        userCostCentersLoading,
        savingUserCostCenters,
    } = useSelector((state: RootState) => state.tallyCompanies);

    const [search, setSearch] = useState("");
    const [accessModalOpen, setAccessModalOpen] = useState(false);
    const [costCenterSearch, setCostCenterSearch] = useState("");
    const [activeAccessTab, setActiveAccessTab] = useState("company-cost-centers");
    const [selectedCostCenterIds, setSelectedCostCenterIds] = useState<string[]>(
        [],
    );
    const [selectedUserCostCenterIds, setSelectedUserCostCenterIds] = useState<string[]>([]);

    const loadCompanies = (nextPage = page, nextLimit = limit, nextSearch = search) => {
        dispatch(
            fetchTallyCompanies({
                page: nextPage,
                limit: nextLimit,
                search: nextSearch || undefined,
            }),
        );
    };

    useEffect(() => {
        loadCompanies(1, 20, "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        setSelectedCostCenterIds(
            accessCostCenters.filter((item: any) => item.checked).map((item: any) => item.id),
        );
    }, [accessCostCenters]);

    const filteredCostCenters = useMemo(() => {
        const keyword = costCenterSearch.trim().toLowerCase();

        if (!keyword) return accessCostCenters;

        return accessCostCenters.filter((item: TallyCompanyCostCenter) => {
            return (
                item.name?.toLowerCase().includes(keyword) ||
                item.parent_name?.toLowerCase().includes(keyword) ||
                item.tally_guid?.toLowerCase().includes(keyword)
            );
        });
    }, [accessCostCenters, costCenterSearch]);

    const selectedCount = selectedCostCenterIds.length;

    const handleOpenAccess = async (company: TallyCompany) => {
        try {
            setAccessModalOpen(true);
            setCostCenterSearch("");
            setSelectedUserCostCenterIds([]);
            setActiveAccessTab("company-cost-centers");

            const [, usersResponse] = await Promise.all([
                dispatch(fetchTallyCompanyCostCenterAccess(company.id)).unwrap(),
                dispatch(fetchTenantUsers()).unwrap(),
            ]);

            const firstUserId = usersResponse?.[0]?.id;

            if (firstUserId) {
                dispatch(setSelectedUserId(firstUserId));
                await dispatch(fetchUserCostCenters(firstUserId)).unwrap();
            }
        } catch (error: any) {
            message.error(error || "Failed to fetch access");
        }
    };

    useEffect(() => {
        const checkedIds = userCostCenters
            .filter((item: UserCostCenter) => Boolean(item.checked || item.assignment_id))
            .map((item: UserCostCenter) => item.id)
            .filter(Boolean);

        setSelectedUserCostCenterIds(checkedIds);
    }, [userCostCenters]);

    const handleUserChange = async (userId?: string) => {
        try {
            if (!userId) {
                dispatch(setSelectedUserId(null));
                setSelectedUserCostCenterIds([]);
                return;
            }

            dispatch(setSelectedUserId(userId));
            setSelectedUserCostCenterIds([]);

            await dispatch(fetchUserCostCenters(userId)).unwrap();
        } catch (error: any) {
            message.error(error || "Failed to fetch user cost centers");
        }
    };

    const allowedCompanyCostCenters = useMemo(() => {
        const allowedSet = new Set(selectedCostCenterIds);

        return userCostCenters.filter((item: UserCostCenter) => allowedSet.has(item.id));
    }, [userCostCenters, selectedCostCenterIds]);

    const handleSaveUserAssignment = async () => {
        if (!selectedUserId) {
            message.warning("Please select a user first");
            return;
        }

        const allowedSet = new Set(selectedCostCenterIds);

        const finalCostCenterIds = selectedUserCostCenterIds.filter((id) =>
            allowedSet.has(id),
        );

        try {
            await dispatch(
                updateUserCostCenters({
                    userId: selectedUserId,
                    cost_center_ids: finalCostCenterIds,
                }),
            ).unwrap();

            message.success("User cost center assignment updated successfully");
            await dispatch(fetchUserCostCenters(selectedUserId)).unwrap();
        } catch (error: any) {
            message.error(error || "Failed to update user assignment");
        }
    };

    const handleCloseAccess = () => {
        setAccessModalOpen(false);
        setSelectedCostCenterIds([]);
        setCostCenterSearch("");
        dispatch(resetTallyCompanyAccessState());
    };

    const handleSaveAccess = async () => {
        if (!selectedCompany?.id) return;

        try {
            await dispatch(
                updateTallyCompanyCostCenterAccess({
                    companyId: selectedCompany.id,
                    cost_center_ids: selectedCostCenterIds,
                }),
            ).unwrap();

            message.success("Cost center access updated successfully");
            handleCloseAccess();
            loadCompanies();
        } catch (error: any) {
            message.error(error || "Failed to update access");
        }
    };

    const columns: ColumnsType<TallyCompany> = [
        {
            title: "Company",
            dataIndex: "name",
            key: "name",
            width: 250,
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Space>
                        <BankOutlined />
                        <Text strong>{record.name}</Text>
                        {record.is_active ? (
                            <Tag color="success" bordered={false}>
                                Active
                            </Tag>
                        ) : (
                            <Tag bordered={false}>Inactive</Tag>
                        )}
                    </Space>
                    {/* <Text type="secondary" style={{ fontSize: 12 }}>
                        GUID: {record.tally_guid || "Not available"}
                    </Text> */}
                </Space>
            ),
        },
        {
            title: "Location",
            key: "location",
            width: 180,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.state || "-"}</Text>
                    <Text type="secondary">{record.country || "-"}</Text>
                </Space>
            ),
        },
        {
            title: "Mapped Cost Centers",
            dataIndex: "cost_center_count",
            key: "cost_center_count",
            width: 180,
            render: (value) => (
                <Badge
                    count={value || 0}
                    showZero
                    style={{ boxShadow: "none" }}
                />
            ),
        },
        {
            title: "Synced Data",
            key: "synced_data",
            width: 310,
            render: (_, record) => (
                <Space direction="vertical" size={4}>
                    <Space wrap>
                        <StatPill label="Ledgers" value={record.ledger_count} />
                        <StatPill label="Outstanding" value={record.outstanding_count} />
                    </Space>
                    <Space wrap>
                        <StatPill label="SO" value={record.sales_order_count} />
                        <StatPill label="PO" value={record.purchase_order_count} />
                    </Space>
                </Space>
            ),
        },
        {
            title: "Action",
            key: "action",
            align: "right",
            width: 180,
            render: (_, record) => (
                <Button
                    icon={<SettingOutlined />}
                    onClick={() => handleOpenAccess(record)}
                >
                    Manage Access
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: 16,
                }}
            >
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col xs={24} md={14}>
                        <Space direction="vertical" size={4}>
                            <Space>
                                <DatabaseOutlined style={{ fontSize: 22 }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    Tally Companies
                                </Title>
                            </Space>
                            <Text type="secondary">
                                Manage Tally company access by cost centers. Users will see data
                                only for assigned and allowed cost centers.
                            </Text>
                        </Space>
                    </Col>

                    <Col xs={24} md={10}>
                        <Space
                            style={{ width: "100%", justifyContent: "flex-end" }}
                            wrap
                        >
                            <Search
                                allowClear
                                placeholder="Search company..."
                                prefix={<SearchOutlined />}
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onSearch={(value) => {
                                    setSearch(value);
                                    loadCompanies(1, limit, value);
                                }}
                                style={{ width: 280 }}
                            />
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => loadCompanies(1, limit, search)}
                            >
                                Refresh
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <div style={{ marginTop: 20 }}>
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={items}
                        scroll={{ x: 1100 }}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total,
                            showSizeChanger: true,
                            showTotal: (count) => `${count} companies`,
                            onChange: (nextPage, nextLimit) => {
                                loadCompanies(nextPage, nextLimit, search);
                            },
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="No Tally companies found"
                                />
                            ),
                        }}
                    />
                </div>
            </Card>

            <Modal
                title={
                    <Space direction="vertical" size={2}>
                        <Space>
                            <SafetyCertificateOutlined />
                            <Text strong>Manage Cost Center Access</Text>
                        </Space>
                        <Text type="secondary">
                            {selectedCompany?.name || "Tally company"}
                        </Text>
                    </Space>
                }
                open={accessModalOpen}
                onCancel={handleCloseAccess}
                width={760}
                destroyOnClose
                confirmLoading={activeAccessTab === "company-cost-centers" ? savingAccess : savingUserCostCenters}
                onOk={activeAccessTab === "company-cost-centers" ? handleSaveAccess : handleSaveUserAssignment}
                okText={activeAccessTab === "company-cost-centers" ? "Save Company Access" : "Save User Assignment"}
            >
                <Tabs
                    activeKey={activeAccessTab}
                    onChange={(key) => setActiveAccessTab(key)}
                    items={[
                        {
                            key: "company-cost-centers",
                            label: "Company Cost Centers",
                            children: (
                                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                                    <Card size="small" bordered>
                                        <Row gutter={[12, 12]} align="middle" justify="space-between">
                                            <Col>
                                                <Space>
                                                    <ApartmentOutlined />
                                                    <Text strong>{selectedCount}</Text>
                                                    <Text type="secondary">cost centers selected</Text>
                                                </Space>
                                            </Col>
                                            <Col>
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        setSelectedCostCenterIds(accessCostCenters.map((item) => item.id))
                                                    }
                                                >
                                                    Select All
                                                </Button>
                                                <Button
                                                    size="small"
                                                    style={{ marginLeft: 8 }}
                                                    onClick={() => setSelectedCostCenterIds([])}
                                                >
                                                    Clear
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card>

                                    <Input
                                        allowClear
                                        prefix={<SearchOutlined />}
                                        placeholder="Search cost center..."
                                        value={costCenterSearch}
                                        onChange={(event) => setCostCenterSearch(event.target.value)}
                                    />

                                    <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
                                        {accessLoading ? (
                                            <Card loading />
                                        ) : filteredCostCenters.length ? (
                                            <Checkbox.Group
                                                value={selectedCostCenterIds}
                                                onChange={(values) => setSelectedCostCenterIds(values.map(String))}
                                                style={{ width: "100%" }}
                                            >
                                                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                                                    {filteredCostCenters.map((item: TallyCompanyCostCenter) => (
                                                        <Card key={item.id} size="small" bordered style={{ borderRadius: 12 }}>
                                                            <Row align="middle" justify="space-between" gutter={12}>
                                                                <Col flex="auto">
                                                                    <Checkbox value={item.id}>
                                                                        <Space direction="vertical" size={0}>
                                                                            <Space>
                                                                                <Text strong>{item.name}</Text>
                                                                                {item.checked ? (
                                                                                    <Tag
                                                                                        bordered={false}
                                                                                        icon={<CheckCircleOutlined />}
                                                                                        color="success"
                                                                                    >
                                                                                        Existing
                                                                                    </Tag>
                                                                                ) : null}
                                                                            </Space>
                                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                                {item.parent_name || "No parent"}{" "}
                                                                                {item.tally_guid ? `• ${item.tally_guid}` : ""}
                                                                            </Text>
                                                                        </Space>
                                                                    </Checkbox>
                                                                </Col>
                                                                <Col>
                                                                    <Tag bordered={false}>{item.status || "active"}</Tag>
                                                                </Col>
                                                            </Row>
                                                        </Card>
                                                    ))}
                                                </Space>
                                            </Checkbox.Group>
                                        ) : (
                                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No cost centers found" />
                                        )}
                                    </div>
                                </Space>
                            ),
                        },
                        {
                            key: "user-assignment",
                            label: "User Assignment",
                            children: (
                                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                                    <Card size="small" bordered>
                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            <Text strong>Select User</Text>

                                            <Select
                                                showSearch
                                                allowClear
                                                loading={usersLoading}
                                                placeholder="Select user to assign cost centers"
                                                value={selectedUserId || undefined}
                                                onChange={handleUserChange}
                                                optionFilterProp="label"
                                                style={{ width: "100%" }}
                                                options={(users || []).map((user: TenantUser) => ({
                                                    value: user.id,
                                                    label: `${user.name || user.email} (${user.role || "-"})`,
                                                }))}
                                            />

                                            <Text type="secondary">
                                                User can access only cost centers selected in Company Cost Centers tab.
                                            </Text>
                                        </Space>
                                    </Card>

                                    {selectedUserId ? (
                                        <>
                                            <Card size="small" bordered>
                                                <Row justify="space-between" align="middle">
                                                    <Col>
                                                        <Space>
                                                            <Text strong>{selectedUserCostCenterIds.length}</Text>
                                                            <Text type="secondary">cost centers assigned to user</Text>
                                                        </Space>
                                                    </Col>

                                                    <Col>
                                                        <Space>
                                                            <Button
                                                                size="small"
                                                                onClick={() =>
                                                                    setSelectedUserCostCenterIds(
                                                                        allowedCompanyCostCenters.map((item: UserCostCenter) => item.id),
                                                                    )
                                                                }
                                                            >
                                                                Select All Allowed
                                                            </Button>

                                                            <Button
                                                                size="small"
                                                                onClick={() => setSelectedUserCostCenterIds([])}
                                                            >
                                                                Clear
                                                            </Button>

                                                            <Button
                                                                size="small"
                                                                type="primary"
                                                                loading={savingUserCostCenters}
                                                                onClick={handleSaveUserAssignment}
                                                            >
                                                                Save User Assignment
                                                            </Button>
                                                        </Space>
                                                    </Col>
                                                </Row>
                                            </Card>

                                            <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
                                                {userCostCentersLoading ? (
                                                    <Card loading />
                                                ) : allowedCompanyCostCenters.length ? (
                                                    <Checkbox.Group
                                                        value={selectedUserCostCenterIds}
                                                        onChange={(values) =>
                                                            setSelectedUserCostCenterIds(values.map(String))
                                                        }
                                                        style={{ width: "100%" }}
                                                    >
                                                        <Space direction="vertical" style={{ width: "100%" }} size={8}>
                                                            {allowedCompanyCostCenters.map((item: UserCostCenter) => (
                                                                <Card
                                                                    key={item.id}
                                                                    size="small"
                                                                    bordered
                                                                    style={{ borderRadius: 12 }}
                                                                >
                                                                    <Row align="middle" justify="space-between" gutter={12}>
                                                                        <Col flex="auto">
                                                                            <Checkbox value={item.id}>
                                                                                <Space direction="vertical" size={0}>
                                                                                    <Space>
                                                                                        <Text strong>{item.name}</Text>
                                                                                        {item.checked ? (
                                                                                            <Tag color="success" bordered={false}>
                                                                                                Assigned
                                                                                            </Tag>
                                                                                        ) : null}
                                                                                    </Space>
                                                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                                                        {item.parent_name || "No parent"}
                                                                                    </Text>
                                                                                </Space>
                                                                            </Checkbox>
                                                                        </Col>
                                                                    </Row>
                                                                </Card>
                                                            ))}
                                                        </Space>
                                                    </Checkbox.Group>
                                                ) : (
                                                    <Empty
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                        description="No company-allowed cost centers found. Select cost centers in first tab."
                                                    />
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="Select a user to assign cost centers"
                                        />
                                    )}
                                </Space>
                            ),
                        },
                    ]}
                />
            </Modal>
        </div>
    );
}