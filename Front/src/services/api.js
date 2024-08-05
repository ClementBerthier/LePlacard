import axios from "axios";

const api = axios.create({
    // baseURL: 'http://178.18.253.7:3000/'
    // baseURL: 'https://178.18.253.7:3000/'
    baseURL: "http://localhost:3000/",
});

export default api;
