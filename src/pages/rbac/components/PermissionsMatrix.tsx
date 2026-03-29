import { SearchOutlined } from "@ant-design/icons";
import {
    Checkbox,
    Empty,
    Input,
    Space,
    Tag,
    Typography,
    theme,
} from "antd";
import { useMemo, useState } from "react";

const { Text } = Typography;

type RawPermission =
    | string
    | {
        id?: string;
        code?: string;
        name?: string;
        label?: string;
        description?: string;
        module?: string;
        group?: string;
        category?: string;
    };

type PermissionItem = {
    code: string;
    label: string;
    description?: string;
    group: string;
};

type Props = {
    permissions?: RawPermission[];
    value?: string[];
    onChange?: (value: string[]) => void;
};

function startCase(value: string) {
    return value
        .replace(/[._-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePermission(permission: RawPermission): PermissionItem | null {
    if (!permission) return null;

    if (typeof permission === "string") {
        const code = permission.trim();
        if (!code) return null;

        const groupKey = code.includes(".") ? code.split(".")[0] : "general";
        const actionKey = code.includes(".") ? code.split(".").slice(1).join(".") : code;

        return {
            code,
            label: startCase(actionKey),
            description: code,
            group: startCase(groupKey),
        };
    }

    const code = String(permission.code || "").trim();
    if (!code) return null;

    const explicitGroup =
        permission.group || permission.module || permission.category || "";
    const groupKey = explicitGroup || (code.includes(".") ? code.split(".")[0] : "general");
    const actionKey = code.includes(".") ? code.split(".").slice(1).join(".") : code;

    return {
        code,
        label:
            String(permission.label || permission.name || "").trim() ||
            startCase(actionKey),
        description: permission.description || code,
        group: startCase(groupKey),
    };
}

export default function PermissionsMatrix({
    permissions = [],
    value = [],
    onChange,
}: Props) {
    const { token } = theme.useToken();
    const [search, setSearch] = useState("");

    const normalizedPermissions = useMemo(() => {
        const uniqueMap = new Map<string, PermissionItem>();

        (permissions || []).forEach((item) => {
            const normalized = normalizePermission(item);
            if (!normalized) return;

            if (!uniqueMap.has(normalized.code)) {
                uniqueMap.set(normalized.code, normalized);
            }
        });

        return Array.from(uniqueMap.values()).sort((a, b) => {
            if (a.group !== b.group) return a.group.localeCompare(b.group);
            return a.label.localeCompare(b.label);
        });
    }, [permissions]);

    const filteredPermissions = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return normalizedPermissions;

        return normalizedPermissions.filter((item) => {
            return (
                item.code.toLowerCase().includes(keyword) ||
                item.label.toLowerCase().includes(keyword) ||
                item.group.toLowerCase().includes(keyword) ||
                (item.description || "").toLowerCase().includes(keyword)
            );
        });
    }, [normalizedPermissions, search]);

    const groupedPermissions = useMemo(() => {
        return filteredPermissions.reduce<Record<string, PermissionItem[]>>((acc, item) => {
            if (!acc[item.group]) acc[item.group] = [];
            acc[item.group].push(item);
            return acc;
        }, {});
    }, [filteredPermissions]);

    const selectedSet = useMemo(() => new Set(value || []), [value]);

    const allVisibleCodes = useMemo(
        () => filteredPermissions.map((item) => item.code),
        [filteredPermissions]
    );

    const togglePermission = (code: string, checked: boolean) => {
        const current = new Set(value || []);
        if (checked) current.add(code);
        else current.delete(code);
        onChange?.(Array.from(current));
    };

    const toggleGroup = (codes: string[], checked: boolean) => {
        const current = new Set(value || []);
        codes.forEach((code) => {
            if (checked) current.add(code);
            else current.delete(code);
        });
        onChange?.(Array.from(current));
    };

    const toggleAllVisible = (checked: boolean) => {
        const current = new Set(value || []);
        allVisibleCodes.forEach((code) => {
            if (checked) current.add(code);
            else current.delete(code);
        });
        onChange?.(Array.from(current));
    };

    const totalSelectedVisible = allVisibleCodes.filter((code) =>
        selectedSet.has(code)
    ).length;

    const allVisibleChecked =
        allVisibleCodes.length > 0 && totalSelectedVisible === allVisibleCodes.length;

    const someVisibleChecked =
        totalSelectedVisible > 0 && totalSelectedVisible < allVisibleCodes.length;

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                }}
            >
                <Input
                    allowClear
                    size="large"
                    prefix={<SearchOutlined />}
                    placeholder="Search permissions"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        maxWidth: 420,
                        borderRadius: 12,
                    }}
                />

                <Space size={10} wrap>
                    <Tag
                        style={{
                            borderRadius: 999,
                            paddingInline: 12,
                            paddingBlock: 6,
                            marginInlineEnd: 0,
                        }}
                    >
                        {value?.length || 0} selected
                    </Tag>

                    <Checkbox
                        checked={allVisibleChecked}
                        indeterminate={someVisibleChecked}
                        onChange={(e) => toggleAllVisible(e.target.checked)}
                    >
                        Select filtered
                    </Checkbox>
                </Space>
            </div>

            {!filteredPermissions.length ? (
                <div
                    style={{
                        border: `1px dashed ${token.colorBorder}`,
                        borderRadius: 16,
                        padding: 32,
                        background: token.colorFillAlter,
                    }}
                >
                    <Empty description="No permissions found" />
                </div>
            ) : (
                <div style={{ display: "grid", gap: 18 }}>
                    {Object.entries(groupedPermissions).map(([groupName, items]) => {
                        const groupCodes = items.map((item) => item.code);
                        const selectedInGroup = groupCodes.filter((code) =>
                            selectedSet.has(code)
                        ).length;

                        const groupChecked =
                            groupCodes.length > 0 && selectedInGroup === groupCodes.length;
                        const groupIndeterminate =
                            selectedInGroup > 0 && selectedInGroup < groupCodes.length;

                        return (
                            <div
                                key={groupName}
                                style={{
                                    border: `1px solid ${token.colorBorderSecondary}`,
                                    borderRadius: 18,
                                    background: token.colorBgContainer,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        padding: "16px 18px",
                                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                                        background: token.colorFillAlter,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 12,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: token.colorTextHeading,
                                            }}
                                        >
                                            {groupName}
                                        </div>
                                        <Text type="secondary">
                                            {selectedInGroup}/{groupCodes.length} selected
                                        </Text>
                                    </div>

                                    <Checkbox
                                        checked={groupChecked}
                                        indeterminate={groupIndeterminate}
                                        onChange={(e) => toggleGroup(groupCodes, e.target.checked)}
                                    >
                                        Select all
                                    </Checkbox>
                                </div>

                                <div
                                    style={{
                                        padding: 16,
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                        gap: 14,
                                    }}
                                >
                                    {items.map((item) => {
                                        const checked = selectedSet.has(item.code);

                                        return (
                                            <label
                                                key={item.code}
                                                style={{
                                                    border: checked
                                                        ? `1px solid ${token.colorPrimary}`
                                                        : `1px solid ${token.colorBorderSecondary}`,
                                                    background: checked
                                                        ? token.colorPrimaryBg
                                                        : token.colorBgContainer,
                                                    borderRadius: 16,
                                                    padding: 14,
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: 12,
                                                    minHeight: 88,
                                                }}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={(e) =>
                                                        togglePermission(item.code, e.target.checked)
                                                    }
                                                    style={{ marginTop: 2 }}
                                                />

                                                <div style={{ minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            color: token.colorTextHeading,
                                                            marginBottom: 4,
                                                            lineHeight: 1.35,
                                                        }}
                                                    >
                                                        {item.label}
                                                    </div>

                                                    <Text
                                                        type="secondary"
                                                        style={{
                                                            fontSize: 12,
                                                            display: "block",
                                                            wordBreak: "break-word",
                                                        }}
                                                    >
                                                        {item.code}
                                                    </Text>

                                                    {item.description && item.description !== item.code ? (
                                                        <Text
                                                            type="secondary"
                                                            style={{
                                                                fontSize: 12,
                                                                display: "block",
                                                                marginTop: 6,
                                                                wordBreak: "break-word",
                                                            }}
                                                        >
                                                            {item.description}
                                                        </Text>
                                                    ) : null}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}