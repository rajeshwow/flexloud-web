import { Checkbox, Col, Form, Input, Row, Typography } from "antd";

const { Title } = Typography;

type Props = {
    copyAddress?: boolean;
    onCopyAddressChange?: (checked: boolean) => void;
};

export default function AddressSection({
    copyAddress,
    onCopyAddressChange,
}: Props) {



    return (
        <Row gutter={24}>
            <Col xs={24} md={12}>
                <Title level={5}>Primary Address</Title>

                <Form.Item label="Street" name="primary_address_street">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item label="Area" name="primary_address_area">
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Postal Code"
                    name="primary_address_postal_code"
                    rules={[
                        { len: 6, message: "Postal code must be 6 digits" },
                    ]}
                    getValueFromEvent={(e) => e.target.value.replace(/\D/g, "").slice(0, 6)}
                >
                    <Input maxLength={6} inputMode="numeric" placeholder="Enter 6 digit postal code" />
                </Form.Item>

                <Form.Item label="City" name="primary_address_city">
                    <Input />
                </Form.Item>

                <Form.Item label="State" name="primary_address_state">
                    <Input />
                </Form.Item>

                <Form.Item label="Country" name="primary_address_country">
                    <Input />
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Title level={5}>Alternate Address</Title>

                    <Checkbox
                        checked={!!copyAddress}
                        onChange={(e) => onCopyAddressChange?.(e.target.checked)}
                    >
                        Copy from Primary
                    </Checkbox>
                </div>

                <Form.Item label="Street" name="alternate_address_street">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item label="Area" name="alternate_address_area">
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Postal Code"
                    name="alternate_address_postal_code"
                    rules={[{ len: 6, message: "Postal code must be 6 digits" }]}
                    getValueFromEvent={(e) => e.target.value.replace(/\D/g, "").slice(0, 6)}
                >
                    <Input maxLength={6} inputMode="numeric" placeholder="Enter 6 digit postal code" />
                </Form.Item>

                <Form.Item label="City" name="alternate_address_city">
                    <Input />
                </Form.Item>

                <Form.Item label="State" name="alternate_address_state">
                    <Input />
                </Form.Item>

                <Form.Item label="Country" name="alternate_address_country">
                    <Input />
                </Form.Item>
            </Col>
        </Row>
    );
}