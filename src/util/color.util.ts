export enum EColor {
    Red    = 31,
    Green  = 32,
    Yellow = 33,
    Blue   = 34,
    Purple = 35,
    Cyan   = 36,
    Gray   = 37,

    BgRed    = 41,
    BgGreen  = 42,
    BgYellow = 43,
    BgBlue   = 44,
    BgPurple = 45,
    BgCyan   = 46,
    BgGray   = 47,
}

export class Color {
    public static Colorize(msg: any, color: EColor) { return `\u001b[1;${color}m${msg}\u001b[0m`; }

    public static Red   (msg: any) { return `\u001b[1;31m${msg}\u001b[0m`; }
    public static Green (msg: any) { return `\u001b[1;32m${msg}\u001b[0m`; }
    public static Yellow(msg: any) { return `\u001b[1;33m${msg}\u001b[0m`; }
    public static Blue  (msg: any) { return `\u001b[1;34m${msg}\u001b[0m`; }
    public static Purple(msg: any) { return `\u001b[1;35m${msg}\u001b[0m`; }
    public static Cyan  (msg: any) { return `\u001b[1;36m${msg}\u001b[0m`; }
    public static Gray  (msg: any) { return `\u001b[1;37m${msg}\u001b[0m`; }

    public static BgRed   (msg: any) { return `\u001b[1;41m${msg}\u001b[0m`; }
    public static BgGreen (msg: any) { return `\u001b[1;42m${msg}\u001b[0m`; }
    public static BgYellow(msg: any) { return `\u001b[1;43m${msg}\u001b[0m`; }
    public static BgBlue  (msg: any) { return `\u001b[1;44m${msg}\u001b[0m`; }
    public static BgPurple(msg: any) { return `\u001b[1;45m${msg}\u001b[0m`; }
    public static BgCyan  (msg: any) { return `\u001b[1;46m${msg}\u001b[0m`; }
    public static BgGray  (msg: any) { return `\u001b[1;47m${msg}\u001b[0m`; }
}