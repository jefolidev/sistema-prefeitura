
const apiUrl = import.meta.env.VITE_URL_BACKEND || "http://localhost:4000";

export default ({
    url_backend: apiUrl,
    length_code_verification: 8
})