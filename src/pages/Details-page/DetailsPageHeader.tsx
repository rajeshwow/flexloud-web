import {
    ArrowLeftOutlined,
    CloseOutlined,
    EditOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Tag } from "antd";

type DetailsPageHeaderProps = {
    title: string;
    subtitle?: string;
    status?: string;
    statusColor?: string;
    isEditing?: boolean;
    saveLoading?: boolean;
    onBack?: () => void;
    onEdit?: () => void;
    onCancel?: () => void;
    onSave?: () => void;
    extra?: React.ReactNode;
};

export default function DetailsPageHeader({
    title,
    subtitle,
    status,
    statusColor = "blue",
    isEditing = false,
    saveLoading = false,
    onBack,
    onEdit,
    onCancel,
    onSave,
    extra,
}: DetailsPageHeaderProps) {
    return (
        <Card
            className="theme-card"
            styles={{ body: { padding: 16 } }}
            style={{ marginBottom: 16, borderRadius: 16 }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <Space size={12} wrap>
                    {onBack ? (
                        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                            Back
                        </Button>
                    ) : null}

                    <div>
                        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
                            {title}
                        </div>

                        {subtitle ? (
                            <div style={{ color: "var(--text-secondary, #8c8c8c)", marginTop: 4 }}>
                                {subtitle}
                            </div>
                        ) : null}
                    </div>

                    {status ? (
                        <Tag
                            color={statusColor}
                            style={{
                                textTransform: "capitalize",
                                borderRadius: 999,
                                paddingInline: 10,
                                paddingBlock: 4,
                            }}
                        >
                            {status}
                        </Tag>
                    ) : null}
                </Space>

                <Space wrap>
                    {extra}

                    {onEdit || onSave || onCancel ? (
                        !isEditing ? (
                            <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
                                Edit
                            </Button>
                        ) : (
                            <>
                                <Button icon={<CloseOutlined />} onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    loading={saveLoading}
                                    onClick={onSave}
                                >
                                    Save
                                </Button>
                            </>
                        )
                    ) : null}
                </Space>
            </div>
        </Card>
    );
}