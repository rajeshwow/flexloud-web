import { notification } from "antd";
import { useEffect } from "react";

export default function AuthFlashMessage() {
    useEffect(() => {
        const msg = sessionStorage.getItem("auth_flash_error");

        if (!msg) return;

        sessionStorage.removeItem("auth_flash_error");

        notification.error({
            message: msg,
        });
    }, []);

    return null;
}