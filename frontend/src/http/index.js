// TuneCasa API Config Pattern
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
});

const APIAuthenticated = axios.create({
    baseURL: "http://localhost:5000/",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
});

APIAuthenticated.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) config.headers["Authorization"] = `${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export { API, APIAuthenticated };
