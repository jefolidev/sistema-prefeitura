export function formatCnpj(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0,14); // remove tudo que não for número
    const match = cleaned.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);

    if (!match) return value;

    let formatted = '';
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += '.' + match[2];
    if (match[3]) formatted += '.' + match[3];
    if (match[4]) formatted += '/' + match[4];
    if (match[5]) formatted += '-' + match[5];

    return formatted;
}