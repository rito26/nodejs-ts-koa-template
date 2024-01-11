
export function isDevOnly() : boolean {
    return process.env.NODE_ENV === "development";
}