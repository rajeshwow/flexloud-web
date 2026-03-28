import {
    ContactsOutlined,
    DollarOutlined,
    PlusOutlined,
    ScheduleOutlined,
    UserAddOutlined,
} from "@ant-design/icons";
import { Button, FloatButton, Popover, Space, Typography, theme } from "antd";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { Text } = Typography;

type QuickCreateItem = {
    key: string;
    label: string;
    description: string;
    icon: ReactNode;
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
                label: "Contact",
                description: "Add a new contact",
                icon: <ContactsOutlined />,
                path: `/${slug}/contacts/create`,
            },
            {
                key: "lead",
                label: "Lead",
                description: "Create a sales lead",
                icon: <UserAddOutlined />,
                path: `/${slug}/leads/create`,
            },
            {
                key: "opportunity",
                label: "Opportunity",
                description: "Track a new deal",
                icon: <DollarOutlined />,
                path: `/${slug}/opportunities/create`,
            },
            {
                key: "task",
                label: "Task",
                description: "Add a follow-up task",
                icon: <ScheduleOutlined />,
                path: `/${slug}/tasks/create`,
            },
        ],
        [slug],
    );

    if (!slug) return null;

    const handleNavigate = (path: string) => {
        setOpen(false);
        navigate(path);
    };

    const content = (
        <div
            style={{
                width: 280,
                padding: 4,
            }}
        >
            <div
                style={{
                    padding: "6px 8px 10px",
                }}
            >
                <Text
                    style={{
                        fontSize: 13,
                        color: token.colorTextSecondary,
                        fontWeight: 600,
                        letterSpacing: 0.3,
                    }}
                >
                    Quick Create
                </Text>
            </div>

            <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {items.map((item) => (
                    <motion.div
                        key={item.key}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                    >
                        <Button
                            type="text"
                            block
                            onClick={() => handleNavigate(item.path)}
                            style={{
                                height: "auto",
                                padding: 0,
                                borderRadius: 14,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "12px 14px",
                                    borderRadius: 14,
                                    background: token.colorBgElevated,
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        minWidth: 40,
                                        borderRadius: 12,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: token.colorFillSecondary,
                                        fontSize: 18,
                                    }}
                                >
                                    {item.icon}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        textAlign: "left",
                                        flex: 1,
                                        minWidth: 0,
                                    }}
                                >
                                    <Text
                                        strong
                                        style={{
                                            fontSize: 14,
                                            lineHeight: "20px",
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: token.colorTextSecondary,
                                            lineHeight: "18px",
                                        }}
                                    >
                                        {item.description}
                                    </Text>
                                </div>
                            </div>
                        </Button>
                    </motion.div>
                ))}
            </Space>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger={["hover", "click"]}
            placement="topRight"
            open={open}
            onOpenChange={setOpen}
            mouseEnterDelay={0.08}
            overlayInnerStyle={{
                padding: 10,
                borderRadius: 18,
            }}
        >
            <FloatButton
                icon={<PlusOutlined />}
                type="default"
                tooltip={<span>Quick Create</span>}
                style={{
                    insetInlineEnd: 24,
                    bottom: 24,
                    opacity: 0.75,
                    backdropFilter: "blur(8px)",
                    boxShadow: token.boxShadowSecondary,
                    border: `1px solid ${token.colorBorderSecondary}`,
                }}
            />
        </Popover>
    );
}