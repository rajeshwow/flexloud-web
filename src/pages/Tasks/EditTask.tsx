import { Form, message, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskById, updateTask } from "../../redux/reducers/tasks.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { RootState } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";
import TaskForm from "./TaskForm";

const { Title } = Typography;

export default function EditTask() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { id, slug = "" } = useParams<{ id: string; slug: string }>();

    const usersList = useSelector((state: RootState) => state.users?.userList || []);
    const usersLoading = useSelector((state: RootState) => state.users?.listLoading || false);
    const taskLoading = useSelector((state: RootState) => state.tasks?.taskListLoading || false);

    const userOptions = useMemo(
        () =>
            (usersList || []).map((item: any) => ({
                label:
                    toTitleCase(item?.name) ||
                    toTitleCase(item?.full_name) ||
                    [toTitleCase(item?.first_name), toTitleCase(item?.last_name)].filter(Boolean).join(" ") ||
                    item?.email ||
                    "Unnamed User",
                value: item?.id,
            })),
        [usersList]
    );

    useEffect(() => {
        dispatch(getUsers({ page: 1, limit: 200 }));
    }, [dispatch]);

    useEffect(() => {
        const loadTask = async () => {
            if (!id) return;

            try {
                const res = await dispatch(getTaskById(id)).unwrap();

                form.setFieldsValue({
                    subject: res?.subject || "",
                    status: res?.status || "not_started",
                    start_date: res?.start_date ? dayjs(res.start_date) : null,
                    end_date: res?.end_date ? dayjs(res.end_date) : null,

                    related_to_type: res?.related_to_type || undefined,
                    related_to_id: res?.related_to_id || undefined,

                    // backend agar priority_id deta hai to ye use hoga
                    priority_id: res?.priority_id || res?.priority || undefined,

                    description: res?.description || "",
                    assigned_to: res?.assigned_to || undefined,

                    repeat_task: res?.repeat_task || "none",
                    repeat_task_end: res?.repeat_task_end
                        ? dayjs(res.repeat_task_end)
                        : null,

                    task_duration: res?.task_duration || "",
                    task_duration_minutes: res?.task_duration_minutes || undefined,

                    created_at: res?.created_at
                        ? dayjs(res.created_at).format("DD/MM/YYYY hh:mm a")
                        : "",
                    updated_at: res?.updated_at
                        ? dayjs(res.updated_at).format("DD/MM/YYYY hh:mm a")
                        : "",
                });
            } catch (error: any) {
                message.error(error?.message || "Failed to load task");
            }
        };

        loadTask();
    }, [dispatch, form, id]);

    const handleSubmit = async (values: any) => {
        if (!id) return;

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

            await dispatch(
                updateTask({
                    id,
                    body: payload,
                })
            ).unwrap();

            message.success("Task updated successfully");
            navigate(`/${slug}/tasks`);
        } catch (error: any) {
            message.error(error?.message || "Failed to update task");
        }
    };

    return (
        <div>
            <Title level={3} style={{ marginBottom: 16 }}>
                Edit Task
            </Title>

            <TaskForm
                form={form}
                mode="edit"
                loading={taskLoading || usersLoading}
                onSubmit={handleSubmit}
                userOptions={userOptions}
            />
        </div>
    );
}