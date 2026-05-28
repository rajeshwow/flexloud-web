

import {
    Alert,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Select,
    message
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMasterValues } from "../../redux/reducers/masters.slice";
import { fetchRoles } from "../../redux/reducers/rbac.slice";
import { createUser, updateUser, type UserItem } from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    mode?: "create" | "edit";
    initialData?: UserItem | null;
};

const { Option } = Select;

export default function UserCreateModal({ open, onClose, onSuccess, mode = "create", initialData }: Props) {
    const [form] = Form.useForm();
    const dispatch = useDispatch<AppDispatch>();
    const isEditMode = mode === "edit";
    const [generatedPassword, setGeneratedPassword] = useState("");
    const { masterValues, masterValuesLoading } = useSelector(
        (state: RootState) => state.masters
    );

    const { list: rolesList, } = useSelector(
        (state: RootState) => state.rbac
    );

    const countryList = useMemo(() => masterValues?.country || [], [masterValues]);
    const stateList = useMemo(() => masterValues?.state || [], [masterValues]);
    const cityList = useMemo(() => masterValues?.city || [], [masterValues]);

    const selectedCountry = Form.useWatch("country", form);
    const selectedState = Form.useWatch("state", form);

    useEffect(() => {
        dispatch(fetchRoles())
    }, []);

    const countryOptions = useMemo(
        () =>
            countryList.map((item: any) => ({
                label: toTitleCase(item.label),
                value: item.id,
            })),
        [countryList]
    );

    const selectedCountryItem = useMemo(
        () => countryList.find((item: any) => item.id === selectedCountry),
        [countryList, selectedCountry]
    );

    const filteredStateList = useMemo(() => {
        if (!selectedCountryItem?.id) return [];
        return stateList.filter((item: any) => item.parent_id === selectedCountryItem.id);
    }, [stateList, selectedCountryItem]);

    const stateOptions = useMemo(
        () =>
            filteredStateList.map((item: any) => ({
                label: toTitleCase(item.label),
                value: item.id,
            })),
        [filteredStateList]
    );

    const selectedStateItem = useMemo(
        () => filteredStateList.find((item: any) => item.id === selectedState),
        [filteredStateList, selectedState]
    );

    const filteredCityList = useMemo(() => {
        if (!selectedStateItem?.id) return [];
        return cityList.filter((item: any) => item.parent_id === selectedStateItem.id);
    }, [cityList, selectedStateItem]);

    const cityOptions = useMemo(
        () =>
            filteredCityList.map((item: any) => ({
                label: toTitleCase(item.label),
                value: item.id,
            })),
        [filteredCityList]
    );

    useEffect(() => {
        dispatch(fetchMasterValues({ type_code: "country", page: 1, limit: 500 }));
        dispatch(fetchMasterValues({ type_code: "state", page: 1, limit: 1000 }));
        dispatch(fetchMasterValues({ type_code: "city", page: 1, limit: 2000 }));
    }, [dispatch]);

    useEffect(() => {
        if (!open) {
            form.resetFields();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGeneratedPassword("");
            return;
        }

        if (isEditMode && initialData) {
            form.setFieldsValue({
                name: toTitleCase(initialData.name) || "",
                email: initialData.email || "",
                role: (initialData as any).role_id || (initialData as any).role || undefined,

                phone_country_code: initialData.phone_country_code || "",
                phone: initialData.phone || "",

                city: initialData.city || undefined,
                district: initialData.district || "",
                state: initialData.state || undefined,
                country: initialData.country || undefined,
                postal_code: initialData.postal_code || "",

                designation: toTitleCase(initialData.designation as any) || "",
                department: toTitleCase(initialData.department as any) || "",
                employee_code: initialData.employee_code || "",
            });
            return;
        }

        form.resetFields();
    }, [open, isEditMode, initialData, form]);

    const onFinish = async (values: any) => {
        try {
            if (isEditMode) {
                if (!initialData?.id) {
                    message.error("User id missing");
                    return;
                }

                await dispatch(
                    updateUser({
                        id: initialData.id,
                        email: values.email || "",
                        name: values.name,
                        role_id: values.role,

                        phone_country_code: values.phone_country_code || "",
                        phone: values.phone || "",

                        city: values.city || "",
                        district: values.district || "",
                        state: values.state || "",
                        country: values.country || "",
                        postal_code: values.postal_code || "",

                        designation: values.designation || "",
                        department: values.department || "",
                        employee_code: values.employee_code || "",
                    })
                ).unwrap();

                message.success("User updated successfully");
                onSuccess();
                return;
            }

            const res = await dispatch(
                createUser({
                    email: values.email,
                    name: values.name,
                    role_id: values.role,

                    phone_country_code: values.phone_country_code || "",
                    phone: values.phone || "",

                    city: values.city || "",
                    district: values.district || "",
                    state: values.state || "",
                    country: values.country || "",
                    postal_code: values.postal_code || "",

                    designation: values.designation || "",
                    department: values.department || "",
                    employee_code: values.employee_code || "",

                    tempPassword: values.tempPassword || "",
                })
            ).unwrap();

            if (res?.tempPassword) {
                setGeneratedPassword(res.tempPassword);
            }

            message.success("User created successfully");
            onSuccess();
        } catch (error: any) {
            message.error(error || `Failed to ${isEditMode ? "update" : "create"} user`);
        }
    };

    return (
        <Modal
            title={isEditMode ? "Edit User" : "Create User"}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={isEditMode ? "Update" : "Create"}
            destroyOnHidden
            width={900}
        >
            {generatedPassword ? (
                <Alert
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={`Temporary password: ${generatedPassword}`}
                    description="Please copy and share this password securely with the user."
                />
            ) : null}

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Full Name"
                            name="name"
                            rules={[{ required: true, message: "Name is required" }]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                // { required: true, message: "Email is required" },
                                { type: "email", message: "Invalid email" },
                            ]}
                        >
                            <Input placeholder="Enter email" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            label="Role"
                            name="role"
                            initialValue="AGENT"
                            rules={[{ required: true, message: "Role is required" }]}
                        >
                            <Select>
                                {rolesList?.map((role: any) => (
                                    <Option key={role.id} value={role.id}>
                                        {role.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>


                    <Col span={8}>
                        <Form.Item
                            label="Phone"
                            name="phone"
                            rules={[
                                { required: true, message: "Phone is required" },
                                { pattern: /^[0-9]{10}$/, message: "Enter valid 10 digit phone number" },
                            ]}
                        >
                            <Input
                                maxLength={10}
                                placeholder="Enter phone number"
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ""); // remove alphabets
                                    e.target.value = value; // overwrite input value
                                }}
                                onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault(); // block non-numeric keys
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>

                    {!isEditMode ? (
                        <Col span={8}>
                            <Form.Item
                                label="Temporary Password"
                                name="tempPassword"
                                rules={[
                                    {
                                        required: true,
                                        message: "Temporary Password is required and must be at least 6 characters long",
                                    },
                                ]}
                            >
                                <Input.Password placeholder="Leave empty to auto-generate" />
                            </Form.Item>
                        </Col>
                    ) : null}

                    <Col span={8}>
                        <Form.Item label="Department" name="department" >
                            <Input placeholder="Sales / Operations / HR" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Designation" name="designation">
                            <Input placeholder="Manager / Agent / Executive" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Employee Code" name="employee_code" >
                            <Input placeholder="EMP001" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Country" name="country" >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select country"
                                loading={masterValuesLoading}
                                options={countryOptions}
                                optionFilterProp="label"
                                notFoundContent="No countries available"
                                onChange={() => {
                                    form.setFieldsValue({
                                        state: undefined,
                                        city: undefined,
                                    });
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="State" name="state" >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select state"
                                loading={masterValuesLoading}
                                options={stateOptions}
                                optionFilterProp="label"
                                disabled={!selectedCountry}
                                notFoundContent="No states available"
                                onChange={() => {
                                    form.setFieldsValue({
                                        city: undefined,
                                    });
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="City" name="city" >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select city"
                                loading={masterValuesLoading}
                                options={cityOptions}
                                optionFilterProp="label"
                                disabled={!selectedState}
                                notFoundContent="No cities available"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="District" name="district">
                            <Input />
                        </Form.Item>
                    </Col>




                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Postal Code"
                            name="postal_code"
                            rules={[{ pattern: /^[0-9]*$/, message: "Only digits allowed" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
