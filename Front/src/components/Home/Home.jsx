import Header from "../Header/Header.jsx";
import "./Home.css";

export default function Home() {
    return (
        <>
            <Header />
            <div className="Home">
                <h1 className="home_title">Le Placard</h1>
                <div className="game_selector">
                    <h2 className="list_game_title">Liste de vos jeux</h2>
                    <select name="" id="">
                        <option value="Total">Total</option>
                    </select>
                    <h2 className="list_army_title">
                        Selection de l{"'"}armée
                    </h2>
                    <select name="" id="">
                        <option value=""></option>
                    </select>
                </div>
                <h2 className="detail_title">Détails</h2>
                <div className="total_section_container">
                    <h2 className="total_title">Total toutes figurines</h2>
                    <div className="total_section">
                        <ul>
                            <li>Achat: </li>
                            <li>Nettoyage/Montage:</li>
                            <li>Sous-couche:</li>
                            <li>Peinture:</li>
                            <li>Soclage:</li>
                            <li>Vernis:</li>
                        </ul>
                    </div>
                </div>
                <div className="section">
                    <div className="total_jeu_section_container">
                        <h2 className="total_jeu_title">Total de: JEU</h2>
                        <div className="total_jeu_section">
                            <ul>
                                <li>Achat: </li>
                                <li>Nettoyage/Montage:</li>
                                <li>Sous-couche:</li>
                                <li>Peinture:</li>
                                <li>Soclage:</li>
                                <li>Vernis:</li>
                            </ul>
                        </div>
                    </div>
                    <div className="army_section_container">
                        <h2 className="army_title">Armées de: JEU </h2>
                        <div className="army_section">
                            <ul>
                                <li>Achat: </li>
                                <li>Nettoyage/Montage:</li>
                                <li>Sous-couche:</li>
                                <li>Peinture:</li>
                                <li>Soclage:</li>
                                <li>Vernis:</li>
                            </ul>
                        </div>
                    </div>
                    <div className="object_section_container">
                        <h2 className="object_title">
                            Objets contenu dans: JEU{" "}
                        </h2>

                        <div className="object_section">
                            <ul>
                                <li>Achat: </li>
                                <li>Nettoyage/Montage:</li>
                                <li>Sous-couche:</li>
                                <li>Peinture:</li>
                                <li>Soclage:</li>
                                <li>Vernis:</li>
                            </ul>
                        </div>
                    </div>
                    <div className="figurine_section_container">
                        <h2 className="figurine_title">
                            Figurines contenu dans: JEU{" "}
                        </h2>

                        <div className="figurine_section">
                            <ul>
                                <li>Achat: </li>
                                <li>Nettoyage/Montage:</li>
                                <li>Sous-couche:</li>
                                <li>Peinture:</li>
                                <li>Soclage:</li>
                                <li>Vernis:</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
