import "./App.css";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage/LoginPage.jsx";
import Home from "../Home/Home.jsx";

export default function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </>
    );
}
