export enum DocumentUnits {
    in,
    mm,
    cm,
    px
}

function mmToInch(mm: number) {
    return mm * 0.0393700787;
}
function cmToInch(cm: number) {
    return mmToInch(cm * 10);
}
function inchToCM(inch: number) {
    return inchToMM(inch) / 10;
}
function inchToMM(inch: number) {
    return inch / 0.0393700787;
}

function calculatePixelSize(size: number, dpi: number, unit: DocumentUnits): number {
    switch (unit) {
        case DocumentUnits.px: return size;
        case DocumentUnits.in: return size * dpi;
        case DocumentUnits.mm: return mmToInch(size) * dpi;
        case DocumentUnits.cm: return cmToInch(size) * dpi;
        default: throw "Unknown unit";
    }
}
function calculateRealSize(pixelSize: number, dpi: number, unit: DocumentUnits): number {
    switch (unit) {
        case DocumentUnits.px: return pixelSize;
        case DocumentUnits.in: return pixelSize / dpi;
        case DocumentUnits.mm: return inchToMM(pixelSize / dpi);
        case DocumentUnits.cm: return inchToCM(pixelSize / dpi) ;
        default: throw "Unknown unit";
    }
}

export class DocumentSettings {
    readonly width: number;
    readonly height: number;

    readonly dpi: number;

    readonly unit: DocumentUnits;

    constructor(width: number, height: number, dpi: number, unit: DocumentUnits){
        this.width = width;
        this.height = height;
        this.dpi = dpi;
        this.unit = unit;
    }

    // All this can be cached because it just calculate the information :)
    get aspectRatio(){
        return this.width / this.height;
    }
    get widthInPixels(){
        return calculatePixelSize(this.width, this.dpi, this.unit);
    }
    get heightInPixels(){
        return calculatePixelSize(this.height, this.dpi, this.unit);
    }
    get pixelsPerPoint(){
        return this.dpi / 72;
    }
    get pointsPerPixel(){
        return 1 / this.pixelsPerPoint;
    }

    static readonly A4Portrait = new DocumentSettings(210, 297, 300, DocumentUnits.mm);
    static readonly A4Landscape = new DocumentSettings(297, 210, 300, DocumentUnits.mm);
    
    static readonly ScreenHD = new DocumentSettings(1280, 720, 72, DocumentUnits.px);
    static readonly ScreenFullHD = new DocumentSettings(1920, 1080, 72, DocumentUnits.px);
    static readonly Screen4K = new DocumentSettings(3840, 2160, 72, DocumentUnits.px);

    static readonly Square = new DocumentSettings(1024, 1024, 72, DocumentUnits.px);

    static readonly A3Portrait = new DocumentSettings(297, 420, 300, DocumentUnits.mm);
    static readonly A3Landscape = new DocumentSettings(420, 297, 300, DocumentUnits.mm);
    
    static readonly WhatsappLandscape = new DocumentSettings(1200, 800, 72, DocumentUnits.px);
    static readonly WhatsappPortrait = new DocumentSettings(800, 1200, 72, DocumentUnits.px);

    static readonly DefaultDPI = 72;
    
    static convert(size: number, dpi: number, valueUnit: DocumentUnits, targetUnit: DocumentUnits) {
        let pxSize = calculatePixelSize(size, dpi, valueUnit);

        return calculateRealSize(pxSize, dpi, targetUnit);
    }
}