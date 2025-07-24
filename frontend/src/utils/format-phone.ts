export default function formatPhone (value:string) {
    const cleaned = value.replace(/\D/g, '');

    // Limita no máximo 11 dígitos (2 DDD + 9 número)
    const limited = cleaned.slice(0, 11);

    const ddd = limited.slice(0, 2);
    const firstPart = limited.length > 10 ? limited.slice(2, 7) : limited.slice(2, 6);
    const secondPart = limited.length > 10 ? limited.slice(7, 11) : limited.slice(6, 10);

    let formatted = '';
    if (ddd) formatted += `(${ddd})`;
    if (firstPart) formatted += ` ${firstPart}`;
    if (secondPart) formatted += `-${secondPart}`;

    return formatted.trim();
};