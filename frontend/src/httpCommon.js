import axios from "axios";

export const httpCommon = axios.create({
    baseURL: "http://localhost:5000/api"
});

export const setAuthToken = (token) => {
    httpCommon.defaults.headers.common["Authorization"] = `Bearer ${token}`
};   