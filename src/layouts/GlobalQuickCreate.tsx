import {
    ContactsOutlined,
    DollarOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    ScheduleOutlined,
} from "@ant-design/icons";
import { Button, FloatButton, Popover, Space, Tooltip, theme } from "antd";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type QuickCreateItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
    path: string;
};

export default function GlobalQuickCreate() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { token } = theme.useToken();
    const [open, setOpen] = useState(false);

    const items: QuickCreateItem[] = useMemo(
        () => [
            {
                key: "contact",
                label: "Create Contact",
                icon: <ContactsOutlined />,
                path: `/${slug}/contacts/create`,
            },
            {
                key: "lead",
                label: "Create Lead",
                icon: <FundProjectionScreenOutlined />,
                path: `/${slug}/leads/create`,
            },
            {
                key: "opportunity",
                label: "Create Opportunity",
                icon: <DollarOutlined />,
                path: `/${slug}/opportunities/create`,
            },
            {
                key: "task",
                label: "Create Task",
                icon: <ScheduleOutlined />,
                path: `/${slug}/tasks/create`,
            },
        ],
        [slug],
    );

    const content = (
        <div style={{ minWidth: 220 }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {items.map((item) => (
                    <Button
                        key={item.key}
                        type="text"
                        block
                        icon={item.icon}
                        style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            height: 40,
                            borderRadius: 10,
                        }}
                        onClick={() => {
                            setOpen(false);
                            navigate(item.path);
                        }}
                    >
                        {item.label}
                    </Button>
                ))}
            </Space>
        </div>
    );

    if (!slug) return null;

    return (
        <Popover
            content={content}
            trigger="hover"
            placement="topRight"
            open={open}
            onOpenChange={setOpen}
            overlayInnerStyle={{
                borderRadius: 14,
                padding: 10,
            }}
        >
            <Tooltip title="Quick Create">
                <FloatButton
                    icon={<PlusOutlined />}
                    type="default"
                    style={{
                        insetInlineEnd: 28,
                        bottom: 28,
                        opacity: 0.78,
                        boxShadow: token.boxShadowSecondary,
                    }}
                />
            </Tooltip>
        </Popover>
    );
}