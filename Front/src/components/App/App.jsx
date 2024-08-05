import "./App.css";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage/LoginPage.jsx";

export default function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<LoginPage />} />
            </Routes>
        </>
    );
}
