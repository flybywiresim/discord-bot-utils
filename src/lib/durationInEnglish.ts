export function durationInEnglish(milliseconds: any) {
    const seconds = milliseconds / 1000;

    if (seconds < 60) {
        return `${Math.floor(seconds)} second${Math.floor(seconds) === 1 ? '' : 's'}`;
    }
    if (seconds < 3600) {
        const minutes = seconds / 60;
        return `${Math.floor(minutes)} minute${Math.floor(minutes) === 1 ? '' : 's'}`;
    }
    if (seconds < 86400) {
        const hours = seconds / 3600;
        return `${Math.floor(hours)} hour${Math.floor(hours) === 1 ? '' : 's'}`;
    }
    const days = seconds / 86400;
    return `${Math.floor(days)} day${Math.floor(days) === 1 ? '' : 's'}`;
}
