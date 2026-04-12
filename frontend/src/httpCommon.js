import axios from "axios";

export const httpCommon = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const setAuthToken = (token) => {
    httpCommon.defaults.headers.common["Authorization"] = `Bearer ${token}`
};   