import { Form, message, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createTask } from "../../redux/reducers/tasks.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import TaskForm from "./TaskForm";
// import { ROUTE_TASKS } from "../../shared/routes/routes";

const { Title } = Typography;

export default function CreateTask() {
    const [form] = Form.useForm();
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();

    const users = useSelector((state: any) => state.users?.userList);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);
    const { slug } = useParams();

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


            const res = await dispatch(createTask(payload)).unwrap();
            if (res.statusCode === 201) {
                message.success("Task created successfully", 2);
                navigate(`/${slug}/tasks`);
            }
        } catch (error: any) {
            message.error(error?.message || "Failed to create task", 3);
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
                onSubmit={handleSubmit}
                userOptions={users?.map((user: any) => ({ label: user.name, value: user.id }))}
            />
        </div>
    );
}