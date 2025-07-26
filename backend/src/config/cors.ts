const allowedOriginsDev = "*"; // libera tudo em dev

const allowedOriginsProd = [
    "http://nwokg48csogs8kk8gckc84ww.31.97.92.35.sslip.io",
    "http://fme.bongdigital.com.br",
    "https://fme.bongdigital.com.br",
];

export const getAllowedOrigins = () => {
    if (process.env.NODE_ENV === "development") {
        return allowedOriginsDev;
    }
    return allowedOriginsProd;
};
