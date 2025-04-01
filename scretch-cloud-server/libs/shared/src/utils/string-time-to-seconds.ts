export function stringTimeToSeconds(stringTime: string): number {
    if (stringTime.endsWith("d")) return Number(stringTime.replace("d", "")) * 24 * 60 * 60 
    if (stringTime.endsWith("min")) return Number(stringTime.replace("min", "")) * 60 
}