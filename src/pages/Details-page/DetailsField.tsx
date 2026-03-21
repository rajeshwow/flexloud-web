import { Form, theme } from "antd";

type DetailsFieldProps = {
    label: string;
    name?: string;
    value?: React.ReactNode;
    isEditing?: boolean;
    input?: React.ReactNode;
    span?: number;
};

export default function DetailsField({
    label,
    name,
    value,
    isEditing = false,
    input,
}: DetailsFieldProps) {

    const { token } = theme.useToken();
    if (isEditing && name) {
        return (
            <Form.Item label={label} name={name} style={{ marginBottom: 0 }}>
                {input}
            </Form.Item>
        );
    }

    return (
        <div
            style={{
                border: "1px solid var(--border-color, token.colorBorder)",
                borderRadius: 12,
                padding: 14,
                minHeight: 72,
                background: token.colorBgContainer,
            }}
        >
            <div
                style={{
                    fontSize: 13,
                    marginBottom: 6,
                    color: "var(--text-secondary, token.colorTextSecondary)",
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontSize: 15,
                    fontWeight: 500,
                    wordBreak: "break-word",
                    textTransform: typeof value === "string" ? "none" : undefined,
                }}
            >
                {value || "-"}
            </div>
        </div>
    );
}