function formattedCount(number) {
    if (number >= 1_000_000) {
        // Se for 1 milhão ou mais, usamos "M"
        return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' milhões';
    } else if (number >= 1_000) {
        // Se for 1 mil ou mais, usamos "mil"
        return (number / 1_000).toFixed(1).replace(/\.0$/, '') + ' mil';
    } else {
        // Se for menor que 1000, apenas retorna o número original
        return number;
    }
}

export default formattedCount