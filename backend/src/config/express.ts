import "../bootstrap";

export default({
    port: process.env.PORT || 4000,
    urlBackend: process.env.URL_BACKEND || "http://localhost:4000"
});