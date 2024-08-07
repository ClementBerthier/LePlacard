import "./Header.css";

export default function Header() {
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
                <button className="logout" href="/logout">
                    Déconnexion
                </button>
            </div>
        </div>
    );
}
