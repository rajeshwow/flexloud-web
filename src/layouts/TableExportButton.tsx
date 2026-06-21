import { DownloadOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    exportTableToExcel,
    type ExportModuleKey,
} from "../redux/reducers/tableExport.slice";
import type { AppDispatch, RootState } from "../redux/store";

type Props = {
    moduleKey: ExportModuleKey;
    params?: Record<string, any>;
    permissionCode?: string;
};

const permissionMap: Record<ExportModuleKey, string> = {
    leads: "leads.export",
    contacts: "contacts.export",
    organizations: "org.export",
    quotes: "quotes.export",
    visits: "visits.export",
};

export default function TableExportButton({
    moduleKey,
    params,
    permissionCode,
}: Props) {
    const dispatch = useDispatch<AppDispatch>();

    const permissions = useSelector(
        (state: RootState) => state.auth.permissions || [],
    );

    const loading = useSelector(
        (state: RootState) => state.tableExport.loadingByModule[moduleKey],
    );

    const requiredPermission = permissionCode || permissionMap[moduleKey];

    const canExport = useMemo(() => {
        return permissions.includes(requiredPermission);
    }, [permissions, requiredPermission]);

    const handleExport = async () => {
        try {
            await dispatch(
                exportTableToExcel({
                    moduleKey,
                    params,
                }),
            ).unwrap();

            message.success("Excel downloaded successfully");
        } catch (error: any) {
            message.error(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to export Excel",
            );
        }
    };

    if (!canExport) return null;

    return (
        <Button
            icon={<DownloadOutlined />}
            loading={loading}
            onClick={handleExport}
        >
            Export
        </Button>
    );
}