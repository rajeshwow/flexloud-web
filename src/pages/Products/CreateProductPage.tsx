import { message } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    createProduct,
    type CreateProductPayload,
} from "../../redux/reducers/products.slice";
import type { AppDispatch } from "../../redux/store";
import ProductForm, { type ProductFormValues } from "./components/ProductForm";

export default function CreateProductPage() {
    const navigate = useNavigate();
    const { slug = "" } = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = async (values: ProductFormValues) => {
        if (!slug) {
            message.error("Tenant slug missing in URL");
            return;
        }

        const payload: CreateProductPayload = {
            slug,
            name: values.name,
            part_number: values.part_number || null,
            hsn_code: values.hsn_code,
            unit_uqc: values.unit_uqc || null,
            category: values.category || null,
            manufacturer: values.manufacturer || null,
            description: values.description || null,
            assigned_to: values.assigned_to || null,
            status: (values.status as "active" | "inactive") || "active",

            cost_price_currency: values.cost_price_currency || "₹",
            cost_price: values.cost_price || 0,
            msp_currency: values.msp_currency || "₹",
            msp: values.msp || 0,
            selling_price_currency: values.selling_price_currency || "₹",
            selling_price: values.selling_price || 0,
            tax: values.tax || null,

            opening_stock: values.opening_stock || 0,
            opening_stock_value: values.opening_stock_value || 0,
            stock_on_hand: values.stock_on_hand || 0,
            committed_stock: values.committed_stock || 0,
            available_for_sale: values.available_for_sale || 0,
            qty_to_be_invoiced_shipped: values.qty_to_be_invoiced_shipped || 0,
            qty_to_be_received_billed: values.qty_to_be_received_billed || 0,
        };
        const res = await dispatch(createProduct(payload));

        if (res.payload.statusCode === 201) {
            message.success("Product created successfully");
            navigate(`/${slug}/products`);
        } else {
            message.error("Failed to create product");
        }
    };

    return (
        <ProductForm
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/${slug}/products`)}
        />
    );
}