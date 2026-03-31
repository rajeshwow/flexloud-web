import { Form, message, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskById, updateTask } from "../../redux/reducers/tasks.slice";
import TaskForm from "./TaskForm";
// import { ROUTE_TASKS } from "../../shared/routes/routes";

const { Title } = Typography;

export default function EditTask() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { slug = "" } = useParams();

    const userOptions = [
        { label: "ArtiJain", value: "user-1" },
        { label: "Rahul Sharma", value: "user-2" },
    ];

    const relatedItemOptions = [
        { label: "Org - ABC Pvt Ltd", value: "org-1" },
        { label: "Org - XYZ Industries", value: "org-2" },
    ];

    useEffect(() => {
        const loadTask = async () => {
            try {
                const res = await dispatch(getTaskById(id as string)).unwrap();

                form.setFieldsValue({
                    ...res,
                    start_date: res?.start_date ? dayjs(res.start_date) : null,
                    end_date: res?.end_date ? dayjs(res.end_date) : null,
                    repeat_task_end: res?.repeat_task_end
                        ? dayjs(res.repeat_task_end)
                        : null,
                    created_at: res?.created_at
                        ? dayjs(res.created_at).format("DD/MM/YYYY hh:mm a")
                        : "",
                    updated_at: res?.updated_at
                        ? dayjs(res.updated_at).format("DD/MM/YYYY hh:mm a")
                        : "",
                });
            } catch (error: any) {
                message.error(error?.message || "Failed to load task", 3);
            }
        };

        if (id) loadTask();
    }, [dispatch, form, id]);

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                ...values,
                start_date: values.start_date
                    ? dayjs(values.start_date).toISOString()
                    : null,
                end_date: values.end_date ? dayjs(values.end_date).toISOString() : null,
                repeat_task_end: values.repeat_task_end
                    ? dayjs(values.repeat_task_end).format("YYYY-MM-DD")
                    : null,
            };

            await dispatch(updateTask({ id: id as string, body: payload })).unwrap();
            message.success("Task updated successfully", 2);
            navigate(`/${slug}/tasks`);
        } catch (error: any) {
            message.error(error?.message || "Failed to update task", 3);
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
                onSubmit={handleSubmit}
                userOptions={userOptions}
                relatedItemOptions={relatedItemOptions}
                onRelatedTypeChange={(type: any) => {
                    console.log("related type changed:", type);
                }}
            />
        </div>
    );
}