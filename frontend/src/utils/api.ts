import axios from "axios";
import globalSettings from "./globalSettings";

const api = axios.create({
    baseURL: globalSettings.url_backend,
    // headers: {
    //     'x-access-token': `Bearer ${localStorage.getItem('token')}`
    // }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-access-token'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response.status === 401 && location.pathname != '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('autenticado');
        window.location.href = '/';
    }

    return Promise.reject(error);
});

export default api;