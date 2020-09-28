import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export default axios.create({
    baseURL: process.env["CORE_SERVER_URL"],
    headers: {
        common: {
            "Content-Type": "application/json",
        },
    },
});
