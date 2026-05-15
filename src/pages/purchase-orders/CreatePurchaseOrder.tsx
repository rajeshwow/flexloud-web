import { Card, message, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { getOrganization } from "../../redux/reducers/organization.slice";
import { getProducts } from "../../redux/reducers/products.slice";
import {
    createPurchaseOrder,
    getPurchaseOrderById,
    resetSelectedPurchaseOrder,
    updatePurchaseOrder,
} from "../../redux/reducers/purchaseOrders.slice";
import { getUsers } from "../../redux/reducers/user.slice";
import type { AppDispatch, RootState } from "../../redux/store";
import { toTitleCase } from "../../shared/Utils/utils";
import PurchaseOrderForm from "./components/PurchaseOrderForm";

const { Title } = Typography;

type Props = {
    isEdit?: boolean;
};

export default function CreatePurchaseOrder({ isEdit = false }: Props) {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { slug = "", id = "" } = useParams();

    const users = useSelector((state: RootState) => state.users?.userList || []);
    const organization = useSelector(
        (state: RootState) => state.organization?.orgList || [],
    );
    const products = useSelector(
        (state: RootState) => state.products?.productList || [],
    );

    const { selected, detailLoading, createLoading, updateLoading } = useSelector(
        (state: RootState) => state.purchaseOrders,
    );

    const userOptions = useMemo(() => {
        return (users || []).map((user: any) => ({
            label:
                toTitleCase(user?.name) ||
                `${toTitleCase(user?.first_name || "")} ${toTitleCase(user?.last_name || "")}`.trim() ||
                user?.email ||
                user?.id,
            value: user?.id,
        }));
    }, [users]);

    useEffect(() => {
        dispatch(getUsers());
        dispatch(getOrganization());
        dispatch(getProducts({ limit: 10000 }));

        if (isEdit && id) {
            dispatch(getPurchaseOrderById(id));
        }

        return () => {
            dispatch(resetSelectedPurchaseOrder());
        };
    }, [dispatch, isEdit, id]);

    const initialValues = useMemo(() => {
        if (!isEdit || !selected) return undefined;

        const raw = selected.raw_tally_data || {};

        return {
            po_number: selected.po_number || selected.voucher_number || raw.po_number,
            po_date: selected.voucher_date
                ? dayjs(selected.voucher_date)
                : raw.po_date
                    ? dayjs(raw.po_date)
                    : null,

            expected_delivery_date:
                selected.expected_delivery_date || raw.expected_delivery_date
                    ? dayjs(selected.expected_delivery_date || raw.expected_delivery_date)
                    : null,

            assigned_to: selected.assigned_to || raw.assigned_to,
            vendor_id: raw.vendor_id,

            currency: raw.currency || "₹",

            subtotal: raw.subtotal || 0,
            discount: raw.discount || 0,
            shipping: raw.shipping || 0,
            tax: raw.tax || 0,
            total: raw.total || selected.total_amount || 0,
            grand_total: raw.grand_total || selected.total_amount || 0,

            items:
                selected.items?.map((item: any) => ({
                    product_id: item.raw_tally_data?.product_id || item.item_code,
                    quantity: Number(item.quantity || 1),
                    price: Number(item.rate || item.raw_tally_data?.price || 0),
                    discount: Number(item.raw_tally_data?.discount || 0),
                })) ||
                raw.items ||
                [],
        };
    }, [isEdit, selected]);

    const handleSubmit = async (values: any) => {
        const payload = {
            ...values,
            po_date: values.po_date ? dayjs(values.po_date).format("YYYY-MM-DD") : null,
            expected_delivery_date: values.expected_delivery_date
                ? dayjs(values.expected_delivery_date).format("YYYY-MM-DD")
                : null,
        };

        try {
            if (isEdit && id) {
                const res = await dispatch(updatePurchaseOrder({ id, ...payload })).unwrap();
                message.success(res?.message || "Purchase order updated successfully");
            } else {
                const res = await dispatch(createPurchaseOrder(payload)).unwrap();
                message.success(res?.message || "Purchase order created successfully");
            }

            navigate(`/${slug}/purchase-orders`);
        } catch (err: any) {
            message.error(err || "Failed to save purchase order");
        }
    };

    if (isEdit && detailLoading) {
        return (
            <Card style={{ borderRadius: 16 }}>
                <div style={{ minHeight: 260, display: "grid", placeItems: "center" }}>
                    <Spin />
                </div>
            </Card>
        );
    }

    return (
        <div>
            <Title level={3}>
                {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
            </Title>

            <Card style={{ borderRadius: 16 }}>
                <PurchaseOrderForm
                    vendorOptions={organization || []}
                    userOptions={userOptions}
                    productOptions={products}
                    initialValues={initialValues}
                    submitText={isEdit ? "Update Purchase Order" : "Create Purchase Order"}
                    loading={isEdit ? updateLoading : createLoading}
                    onSubmit={handleSubmit}
                />
            </Card>

        </div>
    );
}