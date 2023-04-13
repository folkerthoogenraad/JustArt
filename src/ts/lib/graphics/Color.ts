import { MathHelper } from "expirimental/math/MathHelper";

interface HSL {
    hue: number,
    saturation: number,
    lightness: number,
    alpha?: number
}

export class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    constructor(r: number, g: number, b: number, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    setRed(r: number): Color {
        return new Color(r, this.g, this.b, this.a);
    }
    setGreen(g: number): Color {
        return new Color(this.r, g, this.b, this.a);
    }
    setBlue(b: number): Color {
        return new Color(this.r, this.g, b, this.a);
    }
    setAlpha(a: number): Color {
        return new Color(this.r, this.g, this.b, a);
    }
    setColor(r: number, g: number, b: number): Color {
        return new Color(r, g, b, this.a);
    }
    getValue() {
        return Math.max(this.r, this.g, this.b);
    }
    setValue(newValue: number) {
        let currentValue = this.getValue();

        return new Color(this.r / currentValue * newValue, this.g / currentValue * newValue, this.b / currentValue * newValue, this.a);
    }

    scale(n: number) {
        return new Color(this.r * n, this.g * n, this.b * n, this.a);
    }
    add(other: Color) {
        return new Color(this.r + other.r, this.g + other.g, this.b + other.b, this.a);
    }
    mul(other: Color) {
        return new Color(this.r * other.r, this.g * other.g, this.b * other.b, this.a);
    }
    
    map(f: (v: number) => number){
        return new Color(f(this.r),f(this.g),f(this.b),this.a);
    }

    toGrayscale(factor: number = 1) {
        let v = this.getAvarage();

        return Color.lerpNumbers(this, v, v, v, factor);
    }
    toColor(v: Color, factor: number){
        let nr = this.r * v.r;
        let ng = this.g * v.g;
        let nb = this.b * v.b;
        
        return new Color(
            MathHelper.lerp(this.r, nr, factor), 
            MathHelper.lerp(this.g, ng, factor), 
            MathHelper.lerp(this.b, nb, factor), 
            this.a);
    }
    getAvarage() {
        return this.getWeightedAvarage(1, 1, 1);
    }
    getWeightedAvarage(rWeight: number = 1, gWeight: number = 1, bWeight: number = 1) {
        return (this.r * rWeight + this.g * gWeight + this.b * bWeight) / (rWeight + gWeight + bWeight);
    }

    maxDifference(other: Color) {
        let dr = this.r - other.r;
        let dg = this.g - other.g;
        let db = this.b - other.b;

        return Math.max(dr * dr, dg * dg, db * db);
    }

    static lerp(a: Color, b: Color, f: number) {
        return new Color(
            MathHelper.lerp(a.r, b.r, f),
            MathHelper.lerp(a.g, b.g, f),
            MathHelper.lerp(a.b, b.b, f),
            MathHelper.lerp(a.a, b.a, f)
        );
    }
    static lerpNumbers(a: Color, r: number, g: number, b: number, f: number) {
        return new Color(
            MathHelper.lerp(a.r, r, f),
            MathHelper.lerp(a.g, g, f),
            MathHelper.lerp(a.b, b, f),
            a.a
        );
    }
    static grayscale(v: number, white: Color = Color.white) {
        return new Color(v * white.r, v * white.g, v * white.b, 1);
    }

    // ======================================================= //
    // Conversions and formats
    // ======================================================= //
    toHSL(): HSL {
        let r = this.r;
        let g = this.g;
        let b = this.b;

        let a = Math.max(r, g, b);
        let n = a - Math.min(r, g, b);
        let f = (1 - Math.abs(a + a - n - 1));
        let h = n && ((a == r) ? (g - b) / n : ((a == g) ? 2 + (b - r) / n : 4 + (r - g) / n));

        return {
            hue: 60 * (h < 0 ? h + 6 : h),
            saturation: f ? n / f : 0,
            lightness: (a + a - n) / 2,
            alpha: this.a
        };
    }
    toHexString(): string{
        let c = (n: number) => Math.round(n * 255).toString(16);

        return `#${c(this.r)}${c(this.g)}${c(this.b)}`;
    }
    toRGBString(): string{
        let n = (v: number) => Math.round(v * 255);

        return `rgb(${n(this.r)},${n(this.g)},${n(this.b)})`;
    }
    toRGBAString(): string{
        let n = (v: number) => Math.round(v * 255);

        return `rgba(${n(this.r)},${n(this.g)},${n(this.b)},${this.a})`;
    }
    toHSLString(): string{
        let n = Math.round;
        let hsl = this.toHSL();

        return `hsl(${n(hsl.hue)},${n(hsl.saturation * 100)}%,${n(hsl.lightness * 100)}%)`;
    }
    toHSLAString(): string{
        let n = Math.round;
        let hsl = this.toHSL();

        return `hsl(${n(hsl.hue)},${n(hsl.saturation * 100)}%,${n(hsl.lightness * 100)}%, ${this.a})`;
    }
    static fromRGB255(r: number, g: number, b: number) {
        return new Color(r / 255, g / 255, b / 255, 1);
    }
    static fromRGBA255(r: number, g: number, b: number, a: number) {
        return new Color(r / 255, g / 255, b / 255, a / 255);
    }
    static fromHSL(hsl: HSL): Color;
    static fromHSL(hue: number, saturation: number, lightness: number, alpha?: number): Color;

    static fromHSL(h: number | HSL, s?: number, l?: number, alpha?: number): Color {
        // HSL Object
        if (typeof (h) === "object") {
            let hsl = h as HSL;

            return this.fromHSL(hsl.hue, hsl.saturation, hsl.lightness, hsl.alpha);
        }

        // Regular case
        if (h === undefined || typeof (h) !== "number") throw Error("Argument h cannot be null and must be number");
        if (s === undefined || typeof (s) !== "number") throw Error("Argument s cannot be null and must be number");
        if (l === undefined || typeof (l) !== "number") throw Error("Argument l cannot be null and must be number");

        let a = s * Math.min(l, 1 - l);
        let f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

        return new Color(f(0), f(8), f(4), alpha ?? 1);
    }

    static fromHexString(hex: string): Color{
        if(hex.startsWith("#")) hex = hex.substring(1);
        
        let i = parseInt(hex, 16);
        
        // 8 bit per channel+alpha
        if(hex.length === 8){
            return this.fromRGBA255((i >> 24) & 0xFF, (i >> 16) & 0xFF, (i >> 8) & 0xFF, i & 0xFF);
        }

        // 8 bit per channel
        if(hex.length === 6){
            return this.fromRGB255((i >> 16) & 0xFF, (i >> 8) & 0xFF, i & 0xFF);
        }

        // 4 bit per channel
        if(hex.length === 3){
            return this.fromRGB255(((i >> 8) & 0xF) << 4, ((i >> 4) & 0xF) << 4, (i & 0xF) << 4);
        }

        throw new Error("Cannot parse hex color");
    }

    static parse(color: string): Color{
        if(color in this.namedColors) return this.namedColors[color];

        // rgb/rgba
        if(color.startsWith("rgb")){
            // Looks way more complicated than it is because of the whitespace and the 0.5 alphas :)
            let m = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d*)?))?\s*\)$/);
            
            if(m === null || m.groups === null) throw new Error(`Cannot parse color '${color}' as rgb or rgba`);

            let r = parseInt(m[1]) / 255;
            let g = parseInt(m[2]) / 255;
            let b = parseInt(m[3]) / 255;

            let a = m[4] ? parseFloat(m[4]) : 1;

            return new Color(r, g, b, a);
        }
        // hsl/hsla
        if(color.startsWith("hsl")){
            let m = color.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)\s*%,\s*(\d+)%\s*(?:,\s*(\d+(?:\.\d*)?))?\s*\)$/);

            if(m === null || m.groups === null) throw new Error(`Cannot parse color '${color}' as hsl or hsla`);

            let h = parseInt(m[1]);
            let s = parseInt(m[2]) / 100;
            let l = parseInt(m[3]) / 100;

            let a = m[4] ? parseFloat(m[4]) : 1;

            return this.fromHSL(h, s, l, a);
        }
        if(color.startsWith("#")){
            return this.fromHexString(color);
        }

        throw new Error(`Cannot parse color '${color}'`);
    }

    // Base colors
    static readonly white = new Color(1, 1, 1, 1);
    static readonly black = new Color(0, 0, 0, 1);
    static readonly transparent = new Color(0, 0, 0, 0);

    static readonly red = new Color(1, 0, 0, 1);
    static readonly green = new Color(0, 1, 0, 1);
    static readonly blue = new Color(0, 0, 1, 1);

    // Mix colors
    static readonly yellow = new Color(1, 1, 0, 1);
    static readonly cyan = new Color(0, 1, 1, 1);
    static readonly magenta = new Color(1, 0, 1, 1);

    static readonly namedColors: { [key: string]: Color } = {
        "white": this.white,
        "black": this.black,
        "transparent": this.transparent,

        "red": this.red,
        "green": this.green,
        "blue": this.blue,

        "yellow": this.yellow,
        "cyan": this.cyan,
        "magenta": this.magenta,
    };
}