import { useState } from "react";
import api from "../../services/api.js";
import "./LoginPage.css";

export default function LoginPage() {
    const [identifiant, setIdentifiant] = useState("");
    const [password, setPassword] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "identifiant") setIdentifiant(value);
        if (name === "password") setPassword(value);
    };
    const formData = {
        identifiant: identifiant,
        password_user: password,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await api.post("users/login", formData);

            console.log(result);
        } catch (error) {
            console.error("error", error);
        }
    };
    return (
        <div className="LoginPage">
            <div className="loginForm_container">
                <div>
                    <h1 className="title">Connexion</h1>
                    <form>
                        <div>
                            <label className="label" htmlFor="identifiant">
                                Identifiant
                            </label>
                            <input
                                className="identifiant"
                                type="text"
                                id="identifiant"
                                name="identifiant"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="label" htmlFor="password">
                                Mot de passe
                            </label>
                            <input
                                className="password"
                                type="password"
                                id="password"
                                name="password"
                                onChange={handleChange}
                            />
                        </div>
                        <button
                            className="submit"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            Se connecter
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
