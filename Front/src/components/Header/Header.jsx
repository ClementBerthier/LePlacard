import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
    const navigate = useNavigate();

    const handleClick = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };
    return (
        <div className="Header">
            <div className="header_links">
                <a className="link" href="/home">
                    Accueil
                </a>
                <a className="link" href="/search">
                    Recherche
                </a>
                <a className="link" href="/management">
                    Gestion
                </a>
                <button className="logout" href="/logout" onClick={handleClick}>
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
