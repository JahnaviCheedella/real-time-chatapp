import axios from "axios";

export const httpCommon = axios.create({
    baseURL: process.env.BACKEND_URL + "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const setAuthToken = (token) => {
    httpCommon.defaults.headers.common["Authorization"] = `Bearer ${token}`
};   