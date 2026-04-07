import { Form, message, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createTask } from "../../redux/reducers/tasks.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { RootState } from "../../redux/store";
import TaskForm from "./TaskForm";

const { Title } = Typography;

export default function CreateTask() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const usersList = useSelector((state: RootState) => state.users?.userList || []);
    const usersLoading = useSelector((state: RootState) => state.users?.listLoading || false);

    // ✅ fetch users properly
    useEffect(() => {
        dispatch(getUsers({ page: 1, limit: 200 }));
    }, [dispatch]);

    // ✅ proper label handling (same as EditTask)
    const userOptions = useMemo(
        () =>
            (usersList || []).map((user: any) => ({
                label:
                    user?.name ||
                    user?.full_name ||
                    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
                    user?.email ||
                    "Unnamed User",
                value: user?.id,
            })),
        [usersList]
    );

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                subject: values?.subject?.trim(),
                status: values?.status || null,

                start_date: values?.start_date
                    ? dayjs(values.start_date).toISOString()
                    : null,
                end_date: values?.end_date
                    ? dayjs(values.end_date).toISOString()
                    : null,

                related_to_type: values?.related_to_type || null,
                related_to_id: values?.related_to_id || null,

                // ✅ master based
                priority_id: values?.priority_id || null,

                description: values?.description?.trim() || null,
                assigned_to: values?.assigned_to || null,

                repeat_task: values?.repeat_task || "none",
                repeat_task_end:
                    values?.repeat_task && values?.repeat_task !== "none" && values?.repeat_task_end
                        ? dayjs(values.repeat_task_end).format("YYYY-MM-DD")
                        : null,

                task_duration: values?.task_duration || null,
                task_duration_minutes: values?.task_duration_minutes ?? null,
            };

            const res = await dispatch(createTask(payload)).unwrap();

            if (res?.statusCode === 201) {
                message.success("Task created successfully");
                navigate(`/${slug}/tasks`);
            }
        } catch (error: any) {
            message.error(error?.message || "Failed to create task");
        }
    };

    return (
        <div>
            <Title level={3} style={{ marginBottom: 16 }}>
                Create Task
            </Title>

            <TaskForm
                form={form}
                mode="create"
                loading={usersLoading}
                onSubmit={handleSubmit}
                userOptions={userOptions}
            />
        </div>
    );
}