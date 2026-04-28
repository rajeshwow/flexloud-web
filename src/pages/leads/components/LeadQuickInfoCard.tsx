import { Card, Col, Row, Statistic, Typography } from "antd";
import dayjs from "dayjs";
import { toTitleCase } from "../../../shared/Utils/utils";

const { Text } = Typography;

type Props = {
    details: any;
};

export default function LeadQuickInfoCard({ details }: Props) {
    return (
        <Card className="theme-card" title="Lead Summary">
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Statistic title="Status" value={details?.status || "-"} />
                </Col>
                <Col span={12}>
                    <Statistic title="Source" value={details?.source || "-"} />
                </Col>
                <Col span={12}>
                    <Statistic title="Priority" value={details?.priority || "-"} />
                </Col>
                <Col span={12}>
                    <Statistic title="Created" value={details?.created_at ? dayjs(details.created_at).format("DD/MM/YYYY") : "-"} />
                </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
                <Text type="secondary">Lead ID</Text>
                <div>{details?.lead_number || details?.id || "-"}</div>
            </div>

            <div style={{ marginTop: 12 }}>
                <Text type="secondary">Assigned To</Text>
                <div>{toTitleCase(details?.assigned_to_name as string) || details?.assigned_to || "-"}</div>
            </div>

            <div style={{ marginTop: 12 }}>
                <Text type="secondary">Next Followup</Text>
                <div>
                    {details?.next_followup_date
                        ? dayjs(details.next_followup_date).format("DD/MM/YYYY hh:mm A")
                        : "-"}
                </div>
            </div>
        </Card>
    );
}