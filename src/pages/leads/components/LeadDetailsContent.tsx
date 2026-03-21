import { DatePicker, Input, Select } from "antd";
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
                            label="Lead Name"
                            name="name"
                            value={details?.first_name + " " + details?.last_name}
                            isEditing={isEditing}
                            input={<Input />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Status"
                            name="status"
                            value={details?.status}
                            isEditing={isEditing}
                            input={<Select options={statusOptions} placeholder="Select status" />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Priority"
                            name="priority"
                            value={details?.priority}
                            isEditing={isEditing}
                            input={<Select options={priorityOptions} placeholder="Select priority" />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Source"
                            name="source"
                            value={details?.source}
                            isEditing={isEditing}
                            input={<Select options={sourceOptions} placeholder="Select source" />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Email"
                            name="email"
                            value={details?.email}
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
                            value={details?.assigned_to_name || details?.assigned_to}
                            isEditing={isEditing}
                            input={<Select options={assignedUserOptions} placeholder="Select user" />}
                        />
                    </DetailsGrid.Item>

                    <DetailsGrid.Item>
                        <DetailsField
                            label="Next Followup"
                            name="next_followup_date"
                            value={details?.next_followup}
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