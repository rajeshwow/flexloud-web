/* eslint-disable react-hooks/set-state-in-effect */
import { Button, Drawer, Select, Space, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    assignUsersToRole,
    fetchRoleById
} from "../../../redux/reducers/rbac.slice";
import { getUsers } from "../../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { toTitleCase } from "../../../shared/Utils/utils";

const { Text } = Typography;

type Props = {
    open: boolean;
    onClose: () => void;
    roleId: string;
};

export default function UserRoleAssignDrawer({ open, onClose, roleId }: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const { userList, listLoading } = useSelector(
        (state: RootState) => state.users
    );

    const { currentRole, submitting } = useSelector(
        (state: RootState) => state.rbac
    );

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            dispatch(getUsers());
        }
    }, [dispatch, open]);

    useEffect(() => {
        if (open && currentRole?.id === roleId) {
            const ids = (currentRole?.users || []).map((user) => user.id).filter(Boolean);
            setSelectedUserIds(ids);
        }
    }, [open, currentRole, roleId]);

    const userOptions = useMemo(() => {
        return userList.map((user) => ({
            label:
                toTitleCase(user.name) ||
                `${toTitleCase(user.first_name || "")} ${toTitleCase(user.last_name || "")}`.trim() ||
                user.email ||
                "Unnamed User",
            value: user.id,
        }));
    }, [userList]);

    const handleSave = async () => {
        try {
            await dispatch(
                assignUsersToRole({
                    roleId,
                    user_ids: selectedUserIds,
                })
            ).unwrap();

            message.success("Users assigned successfully");
            dispatch(fetchRoleById(roleId));
            onClose();
        } catch (error: any) {
            message.error(error || "Failed to assign users");
        }
    };

    return (
        <Drawer
            title="Assign Users"
            open={open}
            onClose={onClose}
            width={520}
            destroyOnClose
            extra={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" loading={submitting} onClick={handleSave}>
                        Save
                    </Button>
                </Space>
            }
        >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Text type="secondary">
                    Select users who should have this role.
                </Text>

                <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    style={{ width: "100%" }}
                    placeholder="Select users"
                    value={selectedUserIds}
                    loading={listLoading}
                    options={userOptions}
                    onChange={(values) => setSelectedUserIds(values)}
                    filterOption={(input, option) =>
                        String(option?.label || "").toLowerCase().includes(input.toLowerCase())
                    }
                />
            </Space>
        </Drawer>
    );
}