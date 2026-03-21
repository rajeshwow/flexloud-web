import {
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Typography
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts } from "../../../redux/reducers/contacts.slice";
import { fetchLeads } from "../../../redux/reducers/leads.slice";
import { getOrganization } from "../../../redux/reducers/organization.slice";
import { getUsers } from "../../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
    calculateDurationInMinutes,
    formatDuration,
    getTotalCost,
    toDayjs,
    VISIT_REGARDING_OPTIONS,
    VISIT_STATUS_OPTIONS,
    VISIT_TICKET_STATUS_OPTIONS,
} from "../utils/visitForm.utils";

const { TextArea } = Input;
const { Title } = Typography;

type OptionItem = {
    label: string;
    value: string;
};

type Props = {
    form: any;
    initialValues?: any;

    isEdit?: boolean;
};

export default function VisitForm({
    form,
    initialValues,

    isEdit = false,
}: Props) {
    const startDate = Form.useWatch("start_date", form);
    const endDate = Form.useWatch("end_date", form);
    const spareCost = Form.useWatch("spare_cost", form);
    const employeeCost = Form.useWatch("employee_cost", form);
    const travellingCost = Form.useWatch("travelling_cost", form);
    const otherCost = Form.useWatch("other_cost", form);

    const dispatch = useDispatch<AppDispatch>();



    const { orgList } = useSelector(
        (state: RootState) => state.organization
    );

    const { userList } = useSelector(
        (state: RootState) => state.users
    );

    const { contactList } = useSelector(
        (state: RootState) => state.contacts
    );

    const { leads } = useSelector(
        (state: RootState) => state.leads
    );


    useEffect(() => {
        dispatch(getOrganization({ page: 1, limit: 1000 }));
        dispatch(getUsers({ page: 1, limit: 1000 }));
        dispatch(fetchContacts({ page: 1, limit: 1000 }));
        dispatch(fetchLeads());
    }, [dispatch]);

    const usersOptions = useMemo(
        () => (userList || []).map((item: any) => ({ label: item.name, value: item.id })),
        [userList]
    );

    const organizationOptions = useMemo(
        () => (orgList || []).map((item: any) => ({ label: item.name, value: item.id })),
        [orgList]
    );

    const contactOptions = useMemo(
        () => (contactList || []).map((item: any) => ({ label: item.first_name + " " + item.last_name, value: item.id })),
        [contactList]
    );

    const leadOptions = useMemo(
        () => (leads || []).map((item: any) => ({ label: item.first_name + " " + item.last_name, value: item.id })),
        [leads]
    );


    const durationInMinutes = useMemo(() => {
        return calculateDurationInMinutes(startDate, endDate);
    }, [startDate, endDate]);

    const durationText = useMemo(() => {
        return formatDuration(durationInMinutes);
    }, [durationInMinutes]);

    const totalCost = useMemo(() => {
        return getTotalCost({
            spare_cost: spareCost,
            employee_cost: employeeCost,
            travelling_cost: travellingCost,
            other_cost: otherCost,
        });
    }, [spareCost, employeeCost, travellingCost, otherCost]);

    useEffect(() => {
        form.setFieldsValue({
            duration: durationText,
            duration_in_minutes: durationInMinutes,
            total_cost: totalCost,
        });
    }, [durationText, durationInMinutes, totalCost, form]);

    useEffect(() => {
        if (!initialValues) return;

        form.setFieldsValue({
            ...initialValues,
            start_date: toDayjs(initialValues.start_date),
            end_date: toDayjs(initialValues.end_date),
            next_followup_date: toDayjs(initialValues.next_followup_date),
        });
    }, [initialValues, form]);

    return (
        <div>
            <Title level={5}>Basic</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} xl={8}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter name" }]}
                    >
                        <Input placeholder="Enter name" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Status" name="status">
                        <Select
                            placeholder="Select status"
                            options={VISIT_STATUS_OPTIONS}
                            allowClear
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item
                        label="Regarding"
                        name="regarding"
                        rules={[{ required: true, message: "Please select regarding" }]}
                    >
                        <Select
                            placeholder="Select regarding"
                            options={VISIT_REGARDING_OPTIONS}
                            allowClear
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Start Date" name="start_date">
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY hh:mm A"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="End Date" name="end_date">
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY hh:mm A"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item
                        label="Next Followup Date"
                        name="next_followup_date"
                        rules={[
                            { required: true, message: "Please select next followup date" },
                        ]}
                    >
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY hh:mm A"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Duration" name="duration">
                        <Input disabled placeholder="Auto calculated" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Duration In Minutes" name="duration_in_minutes">
                        <InputNumber
                            disabled
                            style={{ width: "100%" }}
                            placeholder="Auto calculated"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Ticket Status" name="ticket_status">
                        <Select
                            placeholder="Select ticket status"
                            options={VISIT_TICKET_STATUS_OPTIONS}
                            allowClear
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Assigned To" name="assigned_to_user_id">
                        <Select
                            placeholder="Select user"
                            options={usersOptions}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Organization" name="organization_id">
                        <Select
                            placeholder="Select organization"
                            options={organizationOptions}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Contacts" name="contact_id">
                        <Select
                            placeholder="Select contact"
                            options={contactOptions}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Leads" name="lead_id">
                        <Select
                            placeholder="Select lead"
                            options={leadOptions}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Cases" name="case_id">
                        <Select
                            placeholder="Select case"
                            options={[]}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Created By Name" name="created_by_name">
                        <Input disabled placeholder="Auto" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Date Created" name="created_at">
                        <Input
                            disabled
                            value={
                                initialValues?.created_at
                                    ? dayjs(initialValues.created_at).format("DD/MM/YYYY hh:mm A")
                                    : ""
                            }
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Modified By Name" name="updated_by_name">
                        <Input disabled placeholder="Auto" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Date Modified" name="updated_at">
                        <Input
                            disabled
                            value={
                                initialValues?.updated_at
                                    ? dayjs(initialValues.updated_at).format("DD/MM/YYYY hh:mm A")
                                    : ""
                            }
                        />
                    </Form.Item>
                </Col>

                <Col xs={24}>
                    <Form.Item
                        label="Remarks"
                        name="remarks"
                        rules={[{ required: true, message: "Please enter remarks" }]}
                    >
                        <TextArea rows={5} placeholder="Enter remarks" />
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            <Title level={5}>Check In Details</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Checkin Address" name="checkin_address">
                        <TextArea rows={4} placeholder="Enter checkin address" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Checkout Address" name="checkout_address">
                        <TextArea rows={4} placeholder="Enter checkout address" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8} />

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Checkin Latitude" name="checkin_latitude" rules={[
                        {
                            validator: (_, value) => {
                                if (value === undefined || value === null || value === "") {
                                    return Promise.resolve();
                                }
                                if (Number(value) < -90 || Number(value) > 90) {
                                    return Promise.reject(
                                        new Error("Checkin latitude must be between -90 and 90"),
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}>
                        <InputNumber step={0.0000001} min={-90}
                            max={90}
                            precision={7} style={{ width: "100%" }} placeholder="Latitude" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Checkin Longitude" name="checkin_longitude" rules={[
                        {
                            validator: (_, value) => {
                                if (value === undefined || value === null || value === "") {
                                    return Promise.resolve();
                                }
                                if (Number(value) < -180 || Number(value) > 180) {
                                    return Promise.reject(
                                        new Error("Checkin longitude must be between -180 and 180"),
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}>
                        <InputNumber step={0.0000001} min={-180}
                            max={180}
                            precision={7} style={{ width: "100%" }} placeholder="Longitude" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Checkout Latitude" name="checkout_latitude" rules={[
                        {
                            validator: (_, value) => {
                                if (value === undefined || value === null || value === "") {
                                    return Promise.resolve();
                                }
                                if (Number(value) < -90 || Number(value) > 90) {
                                    return Promise.reject(
                                        new Error("Checkout latitude must be between -90 and 90"),
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}>
                        <InputNumber step={0.0000001} min={-90}
                            max={90}
                            precision={7} style={{ width: "100%" }} placeholder="Latitude" />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Checkout Longitude" name="checkout_longitude" rules={[
                        {
                            validator: (_, value) => {
                                if (value === undefined || value === null || value === "") {
                                    return Promise.resolve();
                                }
                                if (Number(value) < -180 || Number(value) > 180) {
                                    return Promise.reject(
                                        new Error("Checkout longitude must be between -180 and 180"),
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}>
                        <InputNumber step={0.0000001} min={-180}
                            max={180}
                            precision={7} style={{ width: "100%" }} placeholder="Longitude" />
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            <Title level={5}>Cost Details</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Spare Cost" name="spare_cost">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Employee Cost" name="employee_cost">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Travelling Cost" name="travelling_cost">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Other Cost" name="other_cost">
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col xs={24} md={12} xl={8}>
                    <Form.Item label="Total Cost" name="total_cost">
                        <InputNumber disabled style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
}