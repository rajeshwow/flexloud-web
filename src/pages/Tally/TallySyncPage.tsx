import {
    ApiOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloudSyncOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Empty,
    Row,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
    message,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    checkTallyConnection,
    fetchTallySyncStatus,
    runTallyManualSync,
} from "../../redux/reducers/tallySync.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { formatUnderScoreToSpace } from "../../shared/Utils/utils";

const { Title, Text } = Typography;

function formatDate(value?: string | null) {
    if (!value) return "-";
    return dayjs(value).format("DD MMM YYYY, hh:mm A");
}

function getStatusTagColor(status?: string) {
    if (status === "success" || status === "completed") return "green";
    if (status === "failed" || status === "error") return "red";
    if (status === "running" || status === "pending") return "blue";
    return "default";
}

export default function TallySyncPage() {
    const dispatch = useDispatch<AppDispatch>();

    const { loading, checking, running, status, connectionCheck, error } =
        useSelector((state: RootState) => state.tallySync);

    const connection = status?.connection;
    const lastSync = status?.last_sync;
    const recentErrors = status?.recent_errors || [];

    useEffect(() => {
        dispatch(fetchTallySyncStatus());
    }, [dispatch]);

    const handleRefresh = async () => {
        try {
            await dispatch(fetchTallySyncStatus()).unwrap();
            message.success("Tally sync status refreshed");
        } catch (err: any) {
            message.error(err || "Failed to refresh Tally sync status");
        }
    };

    const handleCheckConnection = async () => {
        try {
            const result = await dispatch(checkTallyConnection()).unwrap();

            if (result?.reachable) {
                message.success("Tally agent connected successfully");
            } else {
                message.error(result?.error || "Tally agent is not reachable");
            }

            await dispatch(fetchTallySyncStatus()).unwrap();
        } catch (err: any) {
            message.error(err || "Connection check failed");
        }
    };

    const handleRunSync = async () => {
        try {
            await dispatch(runTallyManualSync()).unwrap();
            message.success("Tally sync started");

            setTimeout(() => {
                dispatch(fetchTallySyncStatus());
            }, 2500);
        } catch (err: any) {
            message.error(err || "Failed to start Tally sync");
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <Card>
                    <Row gutter={[16, 16]} align="middle" justify="space-between">
                        <Col xs={24} lg={12}>
                            <Space direction="vertical" size={2}>
                                <Title level={3} style={{ margin: 0 }}>
                                    Tally Sync
                                </Title>
                                <Text type="secondary">
                                    Run manual sync, check Tally agent connection, and monitor last
                                    sync status.
                                </Text>
                            </Space>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Row justify="end">
                                <Space wrap>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleRefresh}
                                        loading={loading}
                                    >
                                        Refresh
                                    </Button>

                                    <Button
                                        icon={<ApiOutlined />}
                                        onClick={handleCheckConnection}
                                        loading={checking}
                                    >
                                        Check Connection
                                    </Button>

                                    <Button
                                        type="primary"
                                        icon={<CloudSyncOutlined />}
                                        onClick={handleRunSync}
                                        loading={running}
                                    >
                                        Run Sync Now
                                    </Button>
                                </Space>
                            </Row>
                        </Col>
                    </Row>
                </Card>

                {error ? (
                    <Alert
                        type="error"
                        showIcon
                        message="Tally sync error"
                        description={error}
                    />
                ) : null}

                {connectionCheck ? (
                    <Alert
                        closable
                        // onClose={() => setConnectionCheck(null)}
                        type={connectionCheck?.reachable ? "success" : "error"}
                        showIcon
                        message={
                            connectionCheck?.reachable
                                ? "Tally agent is reachable"
                                : "Tally agent is not reachable"
                        }
                        description={
                            connectionCheck?.reachable
                                ? connectionCheck?.agent?.message ||
                                connectionCheck?.agent?.data?.service ||
                                "Connection successful"
                                : connectionCheck?.error
                        }
                    />
                ) : null}

                <Spin spinning={loading}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                            <Card>
                                <Statistic
                                    title="Connection"
                                    value={connection?.is_active ? "Active" : "Inactive"}
                                    prefix={
                                        connection?.is_active ? (
                                            <CheckCircleOutlined />
                                        ) : (
                                            <ExclamationCircleOutlined />
                                        )
                                    }
                                />

                                <div style={{ marginTop: 12 }}>
                                    <Tag color={connection?.is_active ? "green" : "red"}>
                                        {connection?.company_name || "No company configured"}
                                    </Tag>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card>
                                <Statistic
                                    title="Last Sync"
                                    value={formatDate(
                                        lastSync?.completed_at ||
                                        lastSync?.created_at ||
                                        connection?.last_synced_at,
                                    )}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card>
                                <Statistic
                                    title="Last Sync Status"
                                    value={formatUnderScoreToSpace(lastSync?.status) || "No sync yet"}
                                    prefix={<CloudSyncOutlined />}
                                />

                                <div style={{ marginTop: 12 }}>
                                    <Tag color={getStatusTagColor(lastSync?.status)}>
                                        {formatUnderScoreToSpace(lastSync?.sync_type) || "FULL"}
                                    </Tag>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} lg={12}>
                            <Card title="Tally Connection Details">
                                {connection ? (
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item label="Company">
                                            {connection.company_name || "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Tally URL">
                                            {connection.tally_url || "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Direction">
                                            {connection.sync_direction || "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Frequency">
                                            {connection.sync_frequency_minutes
                                                ? `${connection.sync_frequency_minutes} minutes`
                                                : "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Active">
                                            <Tag color={connection.is_active ? "green" : "red"}>
                                                {connection.is_active ? "Active" : "Inactive"}
                                            </Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Last Synced At">
                                            {formatDate(connection.last_synced_at)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                ) : (
                                    <Empty description="No Tally connection configured" />
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title="Last Sync Details">
                                {lastSync ? (
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item label="Sync Type">
                                            {formatUnderScoreToSpace(lastSync.sync_type) || "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Direction">
                                            {formatUnderScoreToSpace(lastSync.direction) || "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Status">
                                            <Tag color={getStatusTagColor(lastSync.status)}>
                                                {formatUnderScoreToSpace(lastSync.status) || "-"}
                                            </Tag>
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Total Records">
                                            {lastSync.total_records ?? "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Success">
                                            {lastSync.success_count ?? "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Failed">
                                            {lastSync.failed_count ?? "-"}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Started At">
                                            {formatDate(lastSync.started_at)}
                                        </Descriptions.Item>

                                        <Descriptions.Item label="Completed At">
                                            {formatDate(lastSync.completed_at)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                ) : (
                                    <Empty description="No sync history found" />
                                )}
                            </Card>
                        </Col>
                    </Row>

                    <Card title="Recent Sync Errors" style={{ marginTop: 16 }}>
                        {recentErrors.length ? (
                            <Space direction="vertical" style={{ width: "100%" }}>
                                {recentErrors.map((item: any) => (
                                    <Alert
                                        key={item.id}
                                        type="error"
                                        showIcon
                                        message={`${item.entity_type || "Entity"} - ${item.tally_name || item.tally_guid || "-"
                                            }`}
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Text>{item.error_message}</Text>
                                                <Text type="secondary">
                                                    {formatDate(item.created_at)}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                ))}
                            </Space>
                        ) : (
                            <Empty description="No recent sync errors" />
                        )}
                    </Card>
                </Spin>
            </Space>
        </div>
    );
}