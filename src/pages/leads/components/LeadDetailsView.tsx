import {
    Card,
    Col,
    DatePicker,
    Descriptions,
    Form,
    Input,
    Row,
    Select,
    Typography,
} from "antd";
import dayjs from "dayjs";
import { toTitleCase } from "../../../shared/Utils/utils";

const { TextArea } = Input;
const { Title } = Typography;

type OptionItem = {
    label: string;
    value: string;
};

type Props = {
    form: any;
    details: any;
    isEditing: boolean;
    statusOptions?: OptionItem[];
    sourceOptions?: OptionItem[];
    priorityOptions?: OptionItem[];
    assignedUserOptions?: OptionItem[];
};

function renderValue(value: any) {
    if (value === undefined || value === null || value === "") return "-";
    return toTitleCase(value);
}

export default function LeadDetailsView({
    form,
    details,
    isEditing,
    statusOptions = [],
    sourceOptions = [],
    priorityOptions = [],
    assignedUserOptions = [],
}: Props) {
    if (!isEditing) {
        return (
            <>
                <Card className="theme-card" title="Basic Information">
                    <Descriptions column={3} bordered size="middle">
                        <Descriptions.Item label="Lead Name">{renderValue(details?.name || `${details?.first_name || ""} ${details?.last_name || ""}`.trim())}</Descriptions.Item>
                        <Descriptions.Item label="Status">{renderValue(details?.status)}</Descriptions.Item>
                        <Descriptions.Item label="Priority">{renderValue(details?.priority)}</Descriptions.Item>

                        <Descriptions.Item label="Source">{renderValue(details?.source)}</Descriptions.Item>
                        <Descriptions.Item label="Email">{renderValue(details?.email)}</Descriptions.Item>
                        <Descriptions.Item label="Mobile">{renderValue(details?.mobile)}</Descriptions.Item>

                        <Descriptions.Item label="Company">{renderValue(details?.company)}</Descriptions.Item>
                        <Descriptions.Item label="Designation">{renderValue(details?.designation)}</Descriptions.Item>
                        <Descriptions.Item label="Assigned To">{renderValue(toTitleCase(details?.assigned_to_name as string) || details?.assigned_to)}</Descriptions.Item>

                        <Descriptions.Item label="Next Followup">
                            {details?.next_followup_date
                                ? dayjs(details.next_followup_date).format("DD/MM/YYYY hh:mm A")
                                : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Organization">{renderValue(details?.organization_name)}</Descriptions.Item>
                        <Descriptions.Item label="Contact">{renderValue(details?.contact_name)}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card className="theme-card" title="Address & Notes" style={{ marginTop: 16 }}>
                    <Descriptions column={2} bordered size="middle">
                        <Descriptions.Item label="Address Line 1">{renderValue(details?.address_line_1)}</Descriptions.Item>
                        <Descriptions.Item label="Address Line 2">{renderValue(details?.address_line_2)}</Descriptions.Item>
                        <Descriptions.Item label="City">{renderValue(details?.city)}</Descriptions.Item>
                        <Descriptions.Item label="State">{renderValue(details?.state)}</Descriptions.Item>
                        <Descriptions.Item label="Country">{renderValue(details?.country)}</Descriptions.Item>
                        <Descriptions.Item label="Zip Code">{renderValue(details?.zip_code)}</Descriptions.Item>
                        <Descriptions.Item label="Remarks" span={2}>{renderValue(details?.remarks || details?.notes)}</Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card className="theme-card" title="System Information" style={{ marginTop: 16 }}>
                    <Descriptions column={3} bordered size="middle">
                        <Descriptions.Item label="Created By">{renderValue(details?.created_by_name)}</Descriptions.Item>
                        <Descriptions.Item label="Created At">
                            {details?.created_at ? dayjs(details.created_at).format("DD/MM/YYYY hh:mm A") : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Updated At">
                            {details?.updated_at ? dayjs(details.updated_at).format("DD/MM/YYYY hh:mm A") : "-"}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </>
        );
    }

    return (
        <>
            <Card className="theme-card" title="Edit Lead">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="first_name" label="First Name">
                            <Input placeholder="Enter first name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="last_name" label="Last Name">
                            <Input placeholder="Enter last name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="status" label="Status">
                            <Select options={statusOptions} allowClear placeholder="Select status" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="priority" label="Priority">
                            <Select options={priorityOptions} allowClear placeholder="Select priority" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="source" label="Source">
                            <Select options={sourceOptions} allowClear placeholder="Select source" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="assigned_to_user_id" label="Assigned To">
                            <Select
                                options={assignedUserOptions}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                placeholder="Select user"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="email" label="Email">
                            <Input placeholder="Enter email" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="mobile" label="Mobile">
                            <Input placeholder="Enter mobile" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="company" label="Company">
                            <Input placeholder="Enter company" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="designation" label="Designation">
                            <Input placeholder="Enter designation" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="next_followup_date" label="Next Followup Date">
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY hh:mm A"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="address_line_1" label="Address Line 1">
                            <Input placeholder="Enter address line 1" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="address_line_2" label="Address Line 2">
                            <Input placeholder="Enter address line 2" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="city" label="City">
                            <Input placeholder="Enter city" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="state" label="State">
                            <Input placeholder="Enter state" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="country" label="Country">
                            <Input placeholder="Enter country" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} xl={8}>
                        <Form.Item name="zip_code" label="Zip Code">
                            <Input placeholder="Enter zip code" />
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item name="remarks" label="Remarks">
                            <TextArea rows={5} placeholder="Enter remarks" />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
        </>
    );
}