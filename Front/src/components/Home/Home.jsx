import { useEffect, useState } from "react";
import Header from "../Header/Header.jsx";
import api from "../../services/api.js";
import "./Home.css";

//TODO: regler le probleme de decalage de donnée (donné décalé d'une requette )lors de la recupération des data armies

export default function Home() {
    const token = localStorage.getItem("token");
    const [allGames, setAllGames] = useState([]);
    const [armiesOfGame, setArmiesOfGame] = useState([]);

    async function getAllArmiesByGame(gameName) {
        try {
            const response = await api.get("/armies/armiesOfGame", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    nameofgame: gameName,
                },
            });
            const listOfArmy = response.data;
            console.log("armies of game", armiesOfGame);
            return setArmiesOfGame(listOfArmy);
        } catch (error) {
            console.error(error);
        }
    }
    async function getAllGames() {
        try {
            const response = await api.get("/games", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAllGames(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllGames();
    }, []);
    console.log(allGames);

    const handleChangeGames = (e) => {
        let gameSelectionned = e.target.value;
        getAllArmiesByGame(gameSelectionned);
    };

    const handleChangeArmies = (e) => {
        let armySelectionned = e.target.value;
        console.log(armySelectionned);
    };
    return (
        <>
            <Header />
            <div className="Home">
                <h1 className="home_title">Le Placard</h1>
                <div className="game_selector">
                    <h2 className="list_game_title">Liste de vos jeux</h2>
                    <select
                        name="allGames"
                        id="allGames"
                        onChange={handleChangeGames}
                    >
                        <option value="Total">Total</option>
                        {allGames.map((game) => (
                            <option key={game.id} value={game.game_name}>
                                {game.game_name}
                            </option>
                        ))}
                    </select>
                    <div className="secondary_selector">
                        <div>
                            <h2 className="list_army_title">
                                Selection de l{"'"}armée
                            </h2>
                            <select
                                name="allArmiesinGame"
                                id="allArmiesinGame"
                                onChange={handleChangeArmies}
                            >
                                <option value="Total">Total</option>
                                {armiesOfGame.map((army) => (
                                    <option
                                        key={army.id}
                                        value={army.army_name}
                                    >
                                        {army.army_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <h2 className="list_box_title">
                                Selection de la boite
                            </h2>
                            <select name="" id="">
                                <option value=""></option>
                            </select>
                        </div>
                    </div>
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
