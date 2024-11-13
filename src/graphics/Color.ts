export interface HSL {
    hue: number,
    saturation: number,
    lightness: number,
    alpha?: number
}
export interface HSV {
    hue: number,
    saturation: number,
    value: number,
    alpha?: number
}

export interface OkLab {
    L: number; // lightness
    a: number; // green/red
    b: number; // blue/yellow
}
export interface OkLabPolar {
    lightness: number;
    chroma: number;
    hue: number;
}

export class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    constructor(r: number, g: number, b: number, a: number) {
        if(r < 0) r = 0;
        if(g < 0) g = 0;
        if(b < 0) b = 0;
        if(a < 0) a = 0;

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
    sub(other: Color) {
        return new Color(this.r - other.r, this.g - other.g, this.b - other.b, this.a);
    }
    mul(other: Color) {
        return new Color(this.r * other.r, this.g * other.g, this.b * other.b, this.a);
    }
    div(other: Color) {
        return new Color(this.r / other.r, this.g / other.g, this.b / other.b, this.a);
    }

    clamped(){
        let r = this.r;
        let g = this.g;
        let b = this.b;
        let a = this.a;

        if(r < 0) r = 0;
        if(g < 0) g = 0;
        if(b < 0) b = 0;
        if(a < 0) a = 0;
        if(r > 1) r = 1;
        if(g > 1) g = 1;
        if(b > 1) b = 1;
        if(a > 1) a = 1;
        
        return new Color(r,g,b,a);
    }

    setGrayscale(v: number) {
        return new Color(v, v, v, this.a);
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
        const ilerp = (a: number, b: number, f: number) => a + (b - a) * f;
        return new Color(
            ilerp(a.r, b.r, f),
            ilerp(a.g, b.g, f),
            ilerp(a.b, b.b, f),
            ilerp(a.a, b.a, f)
        );
    }
    static grayscale(v: number) {
        return new Color(v, v, v, 1);
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
    toHSV(): HSV {
        let hsl = this.toHSL();

        // https://stackoverflow.com/questions/3423214/convert-hsb-hsv-color-to-hsl
        
        // let hsl2hsv = (h,s,l,v=s*Math.min(l,1-l)+l) => [h, v?2-2*l/v:0, v];
        const hsl2hsv = (h: number,s: number,l: number,v=s*Math.min(l,1-l)+l) => {
            return { 
                hue: h,
                saturation: v > 0 ? (2 - 2 * l / v) : 0, 
                value: v
            };
        }

        return hsl2hsv(hsl.hue, hsl.saturation, hsl.lightness);
    }
    toOkLab(): OkLab {
        let l = 0.4122214708 * this.r + 0.5363325363 * this.g + 0.0514459929 * this.b;
        let m = 0.2119034982 * this.r + 0.6806995451 * this.g + 0.1073969566 * this.b;
        let s = 0.0883024619 * this.r + 0.2817188376 * this.g + 0.6299787005 * this.b;

        let l_ = Math.pow(l, 1 / 3);
        let m_ = Math.pow(m, 1 / 3);
        let s_ = Math.pow(s, 1 / 3);

        return {
            L: 0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
            a: 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
            b: 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_,
        };
    }
    toOkLabPolar(): OkLabPolar {
        const lab = this.toOkLab();

        const chroma = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
        const hue = Math.atan2(lab.b, lab.a);

        return {
            lightness: lab.L,
            chroma,
            hue
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
    toLinearColor(): Color {
        return new Color(
            Math.pow(this.r, 2.2),
            Math.pow(this.g, 2.2),
            Math.pow(this.b, 2.2),
            this.a
        );
    }
    toGammaColor(): Color {
        return new Color(
            Math.pow(this.r, 1 / 2.2),
            Math.pow(this.g, 1 / 2.2),
            Math.pow(this.b, 1 / 2.2),
            this.a
        );
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
    static fromHSV(hsv: HSV){
        // https://stackoverflow.com/questions/3423214/convert-hsb-hsv-color-to-hsl
        // let hsv2hsl = (h: number,s: number,v: number,l=v-v*s/2, m=Math.min(l,1-l)) => [h,m?(v-l)/m:0,l];
        const hsv2hsl = (h: number,s: number,v: number,l=v-v*s/2, m=Math.min(l,1-l)) => {
            return {
                hue: h,
                saturation: m > 0 ? ((v - l) / m) : 0,
                lightness: l 
            }
        };
        
        return Color.fromHSL(hsv2hsl(hsv.hue, hsv.saturation, hsv.value));
    }
    static fromOkLab(lab: OkLab): Color {
        let l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
        let m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
        let s_ = lab.L - 0.0894841775 * lab.a - 1.2914855480 * lab.b;

        let l = l_ * l_ * l_;
        let m = m_ * m_ * m_;
        let s = s_ * s_ * s_;

        return new Color(
            +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
            1
        );
    }
    static fromOkLabPolar(lab: OkLabPolar): Color {
        let a = lab.chroma * Math.cos(lab.hue);
        let b = lab.chroma * Math.sin(lab.hue);

        return Color.fromOkLab({
            L: lab.lightness,
            a,
            b
        });
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
        if(this.namedColors.hasOwnProperty(color)) return this.namedColors[color];

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
    static readonly red = new Color(1, 0, 0, 1);
    static readonly green = new Color(0, 1, 0, 1);
    static readonly blue = new Color(0, 0, 1, 1);

    // Mix colors
    static readonly yellow = new Color(1, 1, 0, 1);
    static readonly cyan = new Color(0, 1, 1, 1);
    static readonly magenta = new Color(1, 0, 1, 1);

    static readonly black = new Color(0, 0, 0, 1);
    static readonly white = new Color(1, 1, 1, 1);

    static readonly transparent = new Color(0, 0, 0, 0);

    static readonly namedColors: { [key: string]: Color } = {
        "red": this.red,
        "green": this.green,
        "blue": this.blue,

        "yellow": this.yellow,
        "cyan": this.cyan,
        "magenta": this.magenta,

        "black": this.black,
        "white": this.white,

        "transparent": this.transparent,
    };
}