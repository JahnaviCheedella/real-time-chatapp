import axios from "axios";

export const httpCommon = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const setAuthToken = (token) => {
    httpCommon.defaults.headers.common["Authorization"] = `Bearer ${token}`
};   