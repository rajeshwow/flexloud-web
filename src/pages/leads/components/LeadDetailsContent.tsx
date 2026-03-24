import { DatePicker, Input, Select } from "antd";
import { formatDateTime } from "../../../shared/Utils/utils";
import DetailsField from "../../Details-page/DetailsField";
import DetailsGrid from "../../Details-page/DetailsGrid";
import DetailsSectionCard from "../../Details-page/DetailsSectionCard";

type Props = {
    details?: any;
    isEditing: boolean;
    statusOptions: { label: string; value: string }[];
    sourceOptions: { label: string; value: string }[];
    priorityOptions: { label: string; value: string }[];
    assignedUserOptions: { label: string; value: string }[];
};

export default function LeadDetailsContent({
    details,
    isEditing,
    statusOptions,
    sourceOptions,
    priorityOptions,
    assignedUserOptions,
}: Props) {
    return (
        <>
            <DetailsSectionCard title="Basic Information">
                <DetailsGrid>
                    <DetailsGrid.Item>
                        <DetailsField
                            label="First Name"
                            name="first_name"
                            value={details?.first_name}
                            isEditing={isEditing}
                            input={<Input />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Last Name"
                            name="last_name"
                            value={details?.last_name}
                            isEditing={isEditing}
                            input={<Input />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Status"
                            name="status_id"
                            value={details?.status_label}
                            isEditing={isEditing}
                            input={<Select options={statusOptions} placeholder="Select status" />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Priority"
                            name="priority_id"
                            value={details?.priority_label}
                            isEditing={isEditing}
                            input={<Select options={priorityOptions} placeholder="Select priority" />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Source"
                            name="source_id"
                            value={details?.source_label}
                            isEditing={isEditing}
                            input={<Select options={sourceOptions} placeholder="Select source" />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Email"
                            name="email"
                            value={details?.emails?.[0]?.email || ""}
                            isEditing={isEditing}
                            input={<Input />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Mobile"
                            name="mobile"
                            value={details?.mobile}
                            isEditing={isEditing}
                            input={<Input />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Assigned To"
                            name="assigned_to"
                            value={
                                details?.assigned_to_name ||
                                assignedUserOptions?.find((item) => item.value === details?.assigned_to)?.label ||
                                "-"
                            }
                            isEditing={isEditing}
                            input={<Select options={assignedUserOptions} placeholder="Select user" allowClear />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Next Followup"
                            name="next_followup_date"
                            value={formatDateTime(details?.next_followup)}
                            isEditing={isEditing}
                            input={
                                <DatePicker
                                    showTime
                                    style={{ width: "100%" }}
                                    format="DD MMM YYYY hh:mm A"
                                />
                            }
                        />
                    </DetailsGrid.Item>
                </DetailsGrid>
            </DetailsSectionCard>
            <div style={{ height: 16 }} />

            <DetailsSectionCard title="Additional Information">
                <DetailsGrid>
                    <DetailsGrid.Item xl={24}>
                        <DetailsField
                            label="Description"
                            name="description"
                            value={details?.description}
                            isEditing={isEditing}
                            input={<Input.TextArea rows={4} placeholder="Enter description" />}
                        />
                    </DetailsGrid.Item>
                </DetailsGrid>
            </DetailsSectionCard>
        </>
    );
}