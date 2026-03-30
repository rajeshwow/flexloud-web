import { useNavigate, useParams } from "react-router-dom";
import UserCreateModal from "./UserCreate";

export default function UserCreatePage() {
    const navigate = useNavigate();
    const { slug = "" } = useParams();

    const goToUsersList = () => {
        navigate(`/${slug}/users`, { replace: true });
    };

    return (
        <UserCreateModal
            open
            onClose={goToUsersList}
            onSuccess={goToUsersList}
        />
    );
}
