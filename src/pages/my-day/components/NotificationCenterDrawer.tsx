import { BellOutlined } from "@ant-design/icons";
import { Badge, Button, Drawer, Empty, Space, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setNotificationDrawerOpen } from "../../../redux/reducers/myDay.slice";
import type { AppDispatch, RootState } from "../../../redux/store";
import WorkQueueItemCard from "./WorkQueueItemCard";

const { Title, Text } = Typography;

export default function NotificationCenterDrawer() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const { notificationDrawerOpen, data, counts } = useSelector(
        (state: RootState) => state.myDay,
    );

    const importantItems = [
        ...(data?.sections?.overdue || []),
        ...(data?.sections?.today || []),
    ].slice(0, 8);

    return (
        <Drawer
            title={
                <Space>
                    <BellOutlined />
                    <span>Notifications</span>
                    <Badge count={counts.total} />
                </Space>
            }
            width={460}
            open={notificationDrawerOpen}
            onClose={() => dispatch(setNotificationDrawerOpen(false))}
        >
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
                <div>
                    <Title level={5} style={{ marginBottom: 4 }}>
                        Priority Queue
                    </Title>
                    <Text type="secondary">Overdue and due-today items for quick action</Text>
                </div>

                {importantItems.length ? (
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        {importantItems.map((item) => (
                            <WorkQueueItemCard key={item.id} item={item} />
                        ))}
                    </Space>
                ) : (
                    <Empty description="No new notifications" />
                )}

                <Button
                    type="primary"
                    block
                    onClick={() => {
                        dispatch(setNotificationDrawerOpen(false));
                        navigate(`/${slug}/my-day`);
                    }}
                >
                    View My Day
                </Button>
            </Space>
        </Drawer>
    );
}