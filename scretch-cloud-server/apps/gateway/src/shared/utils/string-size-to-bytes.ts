export function stringSizeToBytes(stringSize: string): number {
    if (stringSize.includes(`mb`)) {
        const numberSize = Number(stringSize.replace(`mb`, ``))

        return numberSize * 1024 * 1024
    }
    else if (stringSize.includes(`gb`)) {
        const numberSize = Number(stringSize.replace(`gb`, ``))

        return numberSize * 1024 * 1024 * 1024
    }
}