import {
    Button,
    Col,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Tabs,
    Typography
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProductCategories } from "../../../redux/reducers/products.slice";
import { getUsers } from "../../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { toTitleCase } from "../../../shared/Utils/utils";

const { Title } = Typography;
const { TextArea } = Input;

export type ProductFormValues = {
    name: string;
    part_number?: string;
    hsn_code: string;
    unit_uqc?: string;
    category?: string;
    manufacturer?: string;
    description?: string;
    assigned_to?: string;
    status?: string;
    date_created?: string;
    date_modified?: string;

    cost_price_currency?: string;
    cost_price?: number;
    msp_currency?: string;
    msp?: number;
    selling_price_currency?: string;
    selling_price?: number;
    tax?: string;

    opening_stock?: number;
    opening_stock_value?: number;
    stock_on_hand?: number;
    committed_stock?: number;
    available_for_sale?: number;
    qty_to_be_invoiced_shipped?: number;
    qty_to_be_received_billed?: number;
};

type Props = {
    initialValues?: Partial<ProductFormValues>;
    saveLoading?: boolean;
    onSubmit?: (values: ProductFormValues) => void;
    onCancel?: () => void;
};

const currencyOptions = [
    { label: "₹", value: "₹" },
];

const unitOptions = [
    { label: "PCS", value: "PCS" },
    { label: "BOX", value: "BOX" },
    { label: "KG", value: "KG" },
    { label: "LTR", value: "LTR" },
];

const categoryOptions = [
    { label: "Rack - Floor Mount", value: "rack-floor-mount" },
    { label: "Cables", value: "cables" },
    { label: "Accessories", value: "accessories" },
];

const manufacturerOptions = [
    { label: "NetRack", value: "NetRack" },
    { label: "Molex", value: "Molex" },
    { label: "Dreamer Technologies", value: "Dreamer Technologies" },
];

const assignedToOptions = [
    { label: "ArtiJain", value: "arti-jain" },
    { label: "Admin", value: "admin" },
];

const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

const taxOptions = [
    { label: "GST 18%", value: "gst-18" },
    { label: "GST 12%", value: "gst-12" },
    { label: "GST 5%", value: "gst-5" },
    { label: "No Tax", value: "no-tax" },
];

export default function ProductForm({
    initialValues,
    saveLoading = false,
    onSubmit,
    onCancel,
}: Props) {
    const [form] = Form.useForm<ProductFormValues>();

    const defaultValues = useMemo<ProductFormValues>(
        () => ({
            name: "",
            part_number: "",
            hsn_code: "",
            unit_uqc: undefined,
            category: undefined,
            manufacturer: undefined,
            description: "",
            assigned_to: undefined,
            status: "active",
            date_created: "",
            date_modified: "",

            cost_price_currency: "₹",
            cost_price: undefined,
            msp_currency: "₹",
            msp: undefined,
            selling_price_currency: "₹",
            selling_price: undefined,
            tax: undefined,

            opening_stock: undefined,
            opening_stock_value: undefined,
            stock_on_hand: undefined,
            committed_stock: undefined,
            available_for_sale: undefined,
            qty_to_be_invoiced_shipped: undefined,
            qty_to_be_received_billed: undefined,

            ...initialValues,
        }),
        [initialValues]
    );

    const [productCategories, setProductCategories] = useState([] as any);

    const dispatch = useDispatch<AppDispatch>();

    //in assigned to getusers
    const { userList } = useSelector((state: RootState) => state.users);

    useEffect(() => {
        dispatch(getUsers());
        dispatch(getProductCategories()).then((res: any) => {
            setProductCategories(res.payload.data);
        });
    }, []);


    const handleFinish = (values: ProductFormValues) => {
        onSubmit?.(values);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>
                    Create Product Catalog
                </Title>

                <Space>
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" loading={saveLoading} onClick={() => form.submit()}>
                        Save
                    </Button>
                </Space>
            </div>

            <Form<ProductFormValues>
                form={form}
                layout="vertical"
                initialValues={defaultValues}
                onFinish={handleFinish}
            >
                <Tabs
                    defaultActiveKey="sale_information"
                    destroyInactiveTabPane={false}
                    items={[
                        {
                            key: "sale_information",
                            label: "Basic Information",
                            children: (
                                <>
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        Basic Information
                                    </Title>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item
                                                label="Name"
                                                name="name"
                                                rules={[{ required: true, message: "Name is required" }]}
                                            >
                                                <Input placeholder="Enter product name" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Part Number" name="part_number">
                                                <Input placeholder="Enter part number" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item
                                                label="HSN Code"
                                                name="hsn_code"
                                                rules={[{ required: true, message: "HSN code is required" }]}
                                            >
                                                <Input placeholder="Enter HSN code" />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Unit UQC" name="unit_uqc">
                                                <Select allowClear placeholder="Select unit" options={unitOptions} />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Category" name="category">
                                                <Select allowClear showSearch placeholder="Select category" options={productCategories} />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Manufacturer" name="manufacturer">
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="Select manufacturer"
                                                    options={manufacturerOptions}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Assigned To" name="assigned_to">
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="Select assignee"
                                                    options={userList.map((user: any) => ({
                                                        label: toTitleCase(user.name),
                                                        value: user.id,
                                                    }))}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Status" name="status">
                                                <Select allowClear placeholder="Select status" options={statusOptions} />
                                            </Form.Item>
                                        </Col>



                                        <Col xs={24} xl={16}>
                                            <Form.Item label="Description" name="description">
                                                <TextArea rows={5} placeholder="Enter description" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ),
                        },
                        {
                            key: "sales_information",
                            label: "Pricing Information",
                            children: (
                                <>
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        Pricing Information
                                    </Title>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Cost Price" style={{ marginBottom: 0 }}>
                                                <Input.Group compact>
                                                    <Form.Item name="cost_price_currency" noStyle>
                                                        <Select style={{ width: "28%" }} options={currencyOptions} />
                                                    </Form.Item>
                                                    <Form.Item name="cost_price" noStyle>
                                                        <InputNumber
                                                            style={{ width: "72%" }}
                                                            min={0}
                                                            placeholder="Enter cost price"
                                                            controls={false}
                                                        />
                                                    </Form.Item>
                                                </Input.Group>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="MSP" style={{ marginBottom: 0 }}>
                                                <Input.Group compact>
                                                    <Form.Item name="msp_currency" noStyle>
                                                        <Select style={{ width: "28%" }} options={currencyOptions} />
                                                    </Form.Item>
                                                    <Form.Item name="msp" noStyle>
                                                        <InputNumber
                                                            style={{ width: "72%" }}
                                                            min={0}
                                                            placeholder="Enter MSP"
                                                            controls={false}
                                                        />
                                                    </Form.Item>
                                                </Input.Group>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Selling Price" style={{ marginBottom: 0 }}>
                                                <Input.Group compact>
                                                    <Form.Item name="selling_price_currency" noStyle>
                                                        <Select style={{ width: "28%" }} options={currencyOptions} />
                                                    </Form.Item>
                                                    <Form.Item name="selling_price" noStyle>
                                                        <InputNumber
                                                            style={{ width: "72%" }}
                                                            min={0}
                                                            placeholder="Enter selling price"
                                                            controls={false}
                                                        />
                                                    </Form.Item>
                                                </Input.Group>
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Tax" name="tax">
                                                <Select allowClear placeholder="Select tax" options={taxOptions} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ),
                        },
                        {
                            key: "inventory_information",
                            label: "Inventory Information",
                            children: (
                                <>
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        Inventory Information
                                    </Title>

                                    <Row gutter={16}>
                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Opening Stock" name="opening_stock">
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    min={0}
                                                    placeholder="Enter opening stock"
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Opening Stock Value" name="opening_stock_value">
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    min={0}
                                                    placeholder="Enter opening stock value"
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Stock On Hand" name="stock_on_hand">
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    min={0}
                                                    placeholder="Enter stock on hand"
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Committed Stock" name="committed_stock">
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    min={0}
                                                    placeholder="Enter committed stock"
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Available For Sale" name="available_for_sale">
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    min={0}
                                                    placeholder="Enter available for sale"
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Qty To Be Invoiced / Shipped" name="qty_to_be_invoiced_shipped">
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    min={0}
                                                    placeholder="Enter qty to be invoiced / shipped"
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12} xl={8}>
                                            <Form.Item label="Qty To Be Received / Billed" name="qty_to_be_received_billed">
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    min={0}
                                                    placeholder="Enter qty to be received / billed"
                                                    controls={false}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </>
                            ),
                        },
                    ]}
                />
            </Form>
        </div>
    );
}