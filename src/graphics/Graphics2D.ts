// TODO add an interface as well

import { DocumentSettings, DocumentUnits } from "../settings/DocumentSettings";
import { ViewportFit, ViewportSettings } from "../settings/ViewportSettings";
import { Color } from "./Color";
import { NineSideSprite } from "./NineSideSprite";
import { Sprite } from "./Sprite";
import { TextHorizontalAlignment, TextMeasurement, TextVerticalAlignment } from "./TextAlignment";

function generateDocumentSettingsFromCanvas(canvas: UseableCanvas){
    let width = canvas.width;
    let height = canvas.height;

    if (canvas instanceof HTMLCanvasElement){
        width = canvas.offsetWidth * window.devicePixelRatio;
        height = canvas.offsetHeight * window.devicePixelRatio;
    }

    return new DocumentSettings(width, height, DocumentSettings.DefaultDPI * window.devicePixelRatio, DocumentUnits.px);
}

function generateViewportSettingsFromCanvas(canvas: UseableCanvas){
    let width = canvas.width;
    let height = canvas.height;

    if (canvas instanceof HTMLCanvasElement){
        width = canvas.offsetWidth * window.devicePixelRatio;
        height = canvas.offsetHeight * window.devicePixelRatio;
    }

    return new ViewportSettings(0, 0, width, height, ViewportFit.Contain);
}

type UseableCanvas = HTMLCanvasElement|OffscreenCanvas;
type UseableContext = CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
type UseableImage = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas;

export interface Graphics2DSettings {
    canvas: UseableCanvas;
    
    canvasAsDocument?: boolean;
    documentSettings?: DocumentSettings;
    viewportSettings?: ViewportSettings;

    imageSmoothingEnabled?: boolean;
}

export class Graphics2D {
    readonly canvas: UseableCanvas;
    readonly context: UseableContext;

    private canvasAsDocument: boolean;
    private imageSmoothingEnabled: boolean;
    private _documentSettings: DocumentSettings;
    private _viewportSettings: ViewportSettings;

    private _font: string = "arial";
    private _fontSize: number = 10;
    private _textHorizontalAlignment: TextHorizontalAlignment = TextHorizontalAlignment.Left;
    private _textVerticalAlignment: TextVerticalAlignment = TextVerticalAlignment.Top;

    constructor(settings: Graphics2DSettings){
        this.canvas = settings.canvas;
        let context = this.canvas.getContext("2d");

        if(context === null){
            throw new Error("Failed to initialize context");
        }

        this.imageSmoothingEnabled = settings.imageSmoothingEnabled ?? false;
        this.canvasAsDocument = settings.canvasAsDocument ?? (settings.documentSettings === undefined);

        this.context = context as CanvasRenderingContext2D;

        this._documentSettings =  settings.documentSettings ?? generateDocumentSettingsFromCanvas(this.canvas);
        this._viewportSettings =  settings.viewportSettings ?? generateViewportSettingsFromCanvas(this.canvas);

        this.canvas.width = this.documentSettings.widthInPixels;
        this.canvas.height = this.documentSettings.heightInPixels;
        this.context.imageSmoothingEnabled = this.imageSmoothingEnabled;

        window.addEventListener("resize", () => {
            if(this.canvasAsDocument){
                this.setDocumentSettings(generateDocumentSettingsFromCanvas(this.canvas));
                this.setViewportSettings(generateViewportSettingsFromCanvas(this.canvas));
            }

            this.context.imageSmoothingEnabled = this.imageSmoothingEnabled;
            this.setFont(this._font);
        });

        this.context.lineCap = "round";
        this.context.miterLimit = 0.1;

        this.setFont("Tahoma");
        this.setFontSize(10);

        this.setup();
    }

    // ======================================================= //
    // Setup
    // ======================================================= //
    setup(){
        this.context.resetTransform();

        this.context.clearRect(0, 0, this.width, this.height);
        this.context.scale(this.width, this.height);

        let bounds = this._viewportSettings.getViewportBoundsForDocument(this._documentSettings);

        this.context.scale(1 / bounds.width, 1 / bounds.height);
        this.context.translate(-bounds.x, -bounds.y);
    }

    clear(color?: string): void;
    clear(color: Color): void;
    clear(color?: Color|string|CanvasGradient) {
        let documentRect = this.getDocumentRectangle();

        this.context.clearRect(documentRect.x, documentRect.y, documentRect.width, documentRect.height);

        if(color === undefined){
            return;
        }

        let storedFill = this.context.fillStyle;

        if(color instanceof Color) {
            this.context.fillStyle = color.toRGBAString();
        }
        else{
            this.context.fillStyle = color;
        }

        this.drawRectangle(documentRect.x, documentRect.y, documentRect.width, documentRect.height, true);

        this.context.fillStyle = storedFill;
    }

    // ======================================================= //
    // Settings
    // ======================================================= //
    setFillColor(color: string): void;
    setFillColor(color: Color): void;
    setFillColor(color: Color|string): void;
    setFillColor(color: CanvasGradient): void;
    setFillColor(color: CanvasPattern): void;
    setFillColor(color: Color|string|CanvasGradient|CanvasPattern): void{
        if(color instanceof Color){
            this.context.fillStyle = color.toRGBAString();
        }
        else{
            this.context.fillStyle = color;
        }
    }

    setStrokeColor(color: string): void;
    setStrokeColor(color: Color): void;
    setStrokeColor(color: Color|string): void;
    setStrokeColor(color: CanvasGradient): void;
    setStrokeColor(color: Color|string|CanvasGradient){
        if(color instanceof Color){
            this.context.strokeStyle = color.toRGBAString();
        }
        else{
            this.context.strokeStyle = color;
        }
    }
    setLineWidthInPoints(width: number){
        this.context.lineWidth = this.pointSize * width;
    }
    setLineWidth(width: number){
        this.context.lineWidth = width;
    }
    setFont(font: string){
        this._font = font;
        this.context.font = `1px ${this._font}`;
        this.context.textAlign = "left";
        this.context.textBaseline = "top";
    }
    setFontSize(size: number){
        this._fontSize = size;
    }
    setFontSizeInPoints(size: number){
        this._fontSize = this.pointSize * size;
    }
    setTextHorizontalAlignment(align: TextHorizontalAlignment){
        this._textHorizontalAlignment = align;
    }
    setTextVerticalAlignment(align: TextVerticalAlignment){
        this._textVerticalAlignment = align;
    }
    measureText(text: string): TextMeasurement{ 
        let metrics = this.context.measureText(text);

        return {
            width: metrics.width * this._fontSize,
            baseline: -metrics.alphabeticBaseline *  this._fontSize,
            height: (metrics.fontBoundingBoxDescent) *  this._fontSize,
        }
    }

    // Returns the size of a pixel in viewport units
    get pixelSize(){
        let t = this.context.getTransform();
        
        let sr = Math.sqrt(t.a * t.a + t.b * t.b);
        let st = Math.sqrt(t.c * t.c + t.d * t.d);

        return 1 / ((sr + st) / 2);
    }
    // Returns the size of a point in viewport units
    get pointSize(){
        return this.pixelSize * this._documentSettings.pixelsPerPoint;
    }
    
    // ======================================================= //
    // Helpers
    // ======================================================= //
    // TODO this should be wrappnig the pattern in some way to still receive the image....
    createPattern(image: UseableImage): CanvasPattern|null{
        return this.context.createPattern(image, "repeat");
    }
    transformPattern(image: UseableImage, pattern: CanvasPattern, widthInPoints: number, heightInPoints: number, angle: number){
        let s = Math.sin(angle);
        let c = Math.cos(angle);

        let w = 1 / image.width * this.pointSize * widthInPoints;
        let h = 1 / image.height * this.pointSize * heightInPoints;

        let matrix = [
            c * w, s * w, 0,
            -s * h, c * w, 0,
        ];

        // [a c e]
        // [b d f]
        // [0 0 1]

        pattern.setTransform(new DOMMatrix([
            matrix[0], matrix[3], 
            matrix[1], matrix[4],
            matrix[2], matrix[5]
        ]));
    }

    // ======================================================= //
    // Translations
    // ======================================================= //
    push(){
        this.context.save();
    }
    pop(){
        this.context.restore();
    }
    scale(x: number, y: number){
        this.context.scale(x, y);
    }
    rotate(angle: number){
        this.context.rotate(angle);
    }
    rotateDeg(angle: number){
        this.context.rotate(angle / 180 * Math.PI);
    }
    translate(x: number, y: number){
        this.context.translate(x, y);
    }

    // ======================================================= //
    // Drawing
    // ======================================================= //
    drawRectangle(x: number, y: number, width: number, height: number, fill: boolean){
        this.context.beginPath();

        this.context.moveTo(x, y);
        this.context.lineTo(x + width, y);
        this.context.lineTo(x + width, y + height);
        this.context.lineTo(x, y + height);
        
        this.context.closePath();

        if(fill){
            this.context.fill();
        }
        else{
            this.context.stroke();
        }
    }
    drawCircle(x: number, y: number, radius: number, fill: boolean){
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, Math.PI * 2, false);
        
        if(fill){
            this.context.fill();
        }
        else{
            this.context.stroke();
        }
    }
    drawLine(x: number, y: number, x2: number, y2: number){
        this.context.beginPath();

        this.context.moveTo(x, y);
        this.context.lineTo(x2, y2);

        this.context.stroke();
    }
    drawVector(ox: number, oy: number, vx: number, vy: number) {
        this.drawLine(ox, oy, ox + vx, oy + vy);
    }

    drawPath(path: Path2D, fill: boolean): Path2D;
    drawPath(createPath: (path: Path2D) => void, fill: boolean): Path2D;
    drawPath(pathOrCreatePath: Path2D|((path: Path2D) => void), fill: boolean): Path2D{
        if(typeof(pathOrCreatePath) === "object"){
            let path = pathOrCreatePath as Path2D;

            if(fill) this.context.fill(path);
            else this.context.stroke(path);

            return path;
        }
        else{
            let path = new Path2D();

            pathOrCreatePath(path);

            if(fill) this.context.fill(path);
            else this.context.stroke(path);

            return path;
        }
    }

    drawImage(image: UseableImage, x: number, y: number): void;
    drawImage(image: UseableImage, x: number, y: number, w: number, h: number): void;
    drawImage(image: UseableImage, x: number, y: number, w?: number, h?: number): void{
        this.context.drawImage(image, x, y, w ?? image.width, h ?? image.height);
    }

    drawText(text: string, x: number, y: number) {
        this.context.save();

        this.context.translate(x, y);

        let result = this.measureText(text);
        
        if(this._textHorizontalAlignment == TextHorizontalAlignment.Center){
            this.context.translate(-result.width / 2, 0);
        }
        else if(this._textHorizontalAlignment == TextHorizontalAlignment.Right){
            this.context.translate(-result.width, 0);
        }
        
        if(this._textVerticalAlignment == TextVerticalAlignment.Center){
            this.context.translate(0, -result.height / 2);
        }
        else if(this._textVerticalAlignment == TextVerticalAlignment.Baseline){
            this.context.translate(0, -result.baseline);
        }
        else if(this._textVerticalAlignment == TextVerticalAlignment.Bottom){
            this.context.translate(0, -result.height);
        }

        this.context.scale(this._fontSize, this._fontSize);

        this.context.fillText(text, 0, 0);

        this.context.restore();
    }

    drawSprite(sprite: Sprite, x: number, y: number, angle: number) {
        if(!sprite.isLoaded) {
            return;
        }

        this.context.save();
        this.context.translate(x, y);
        this.context.rotate(angle);

        this.context.drawImage(sprite.image, sprite.sourceX, sprite.sourceY, sprite.sourceWidth, sprite.sourceHeight, -sprite.originX, -sprite.originY, sprite.width, sprite.height);

        this.context.restore();
    }

    drawNineSideSprite(sprite: NineSideSprite, x: number, y: number, width: number, height: number) {
        if(!sprite.isLoaded) {
            return;
        }

        // x = Math.round(x);
        // y = Math.round(y);
        // width = Math.round(width);
        // height = Math.round(height);

        // Corner top left
        this.context.drawImage(sprite.image, 
            sprite.sourceX, sprite.sourceY, sprite.leftEdge, sprite.topEdge, 
            x, y, sprite.leftEdge, sprite.topEdge);

        // Corner top right
        this.context.drawImage(sprite.image, 
            sprite.sourceX + sprite.sourceWidth - sprite.rightEdge, sprite.sourceY, sprite.rightEdge, sprite.topEdge, 
            x + width - sprite.rightEdge, y, sprite.leftEdge, sprite.topEdge);

        // Corner bottom left
        this.context.drawImage(sprite.image, 
            sprite.sourceX, sprite.sourceY + sprite.sourceWidth - sprite.bottomEdge, sprite.leftEdge, sprite.bottomEdge,
            x, y + height - sprite.bottomEdge, sprite.leftEdge, sprite.bottomEdge);

        // Corner bottom right
        this.context.drawImage(sprite.image, 
            sprite.sourceX + sprite.sourceWidth - sprite.rightEdge, sprite.sourceY + sprite.sourceWidth - sprite.bottomEdge, sprite.rightEdge, sprite.bottomEdge,
            x + width - sprite.rightEdge, y + height - sprite.bottomEdge, sprite.leftEdge, sprite.bottomEdge);

        // Edge left
        this.context.drawImage(sprite.image, 
            sprite.sourceX, sprite.sourceY + sprite.topEdge, sprite.leftEdge, sprite.height - sprite.bottomEdge - sprite.topEdge, 
            x, y + sprite.topEdge, sprite.leftEdge, height - sprite.bottomEdge - sprite.topEdge);
            
        // Edge right
        this.context.drawImage(sprite.image, 
            sprite.sourceX + sprite.sourceWidth - sprite.rightEdge, sprite.sourceY + sprite.topEdge, sprite.rightEdge, sprite.height - sprite.bottomEdge - sprite.topEdge, 
            x + width - sprite.rightEdge, y + sprite.topEdge, sprite.leftEdge, height - sprite.bottomEdge - sprite.topEdge);

        // Edge top
        this.context.drawImage(sprite.image, 
            sprite.sourceX + sprite.leftEdge, sprite.sourceY, sprite.sourceWidth - sprite.leftEdge - sprite.rightEdge, sprite.topEdge, 
            x + sprite.leftEdge, y, width - sprite.leftEdge - sprite.rightEdge, sprite.topEdge);
            
        // Edge bottom
        this.context.drawImage(sprite.image, 
            sprite.sourceX + sprite.leftEdge, sprite.sourceY + sprite.sourceHeight - sprite.bottomEdge, sprite.sourceWidth - sprite.leftEdge - sprite.rightEdge, sprite.bottomEdge, 
            x + sprite.leftEdge, y + height - sprite.bottomEdge, width - sprite.leftEdge - sprite.rightEdge, sprite.topEdge);

        // Center
        this.context.drawImage(sprite.image, 
            sprite.sourceX + sprite.leftEdge, sprite.sourceY + sprite.topEdge, sprite.sourceWidth - sprite.rightEdge - sprite.leftEdge, sprite.sourceHeight - sprite.bottomEdge - sprite.topEdge, 
            x + sprite.leftEdge, y + sprite.topEdge, width - sprite.rightEdge - sprite.leftEdge, height - sprite.bottomEdge - sprite.topEdge);
    }

    // ======================================================= //
    // Clipping
    // ======================================================= //
    clipRectangle(x: number, y: number, w: number, h: number): Path2D {
        return this.clip((path) => {
            path.rect(x, y, w, h);
            path.closePath();
        });
    }
    clip(path: Path2D): Path2D;
    clip(createPath: (path: Path2D) => void): Path2D;
    clip(pathOrCreatePath: Path2D|((path: Path2D) => void)): Path2D{
        if(typeof(pathOrCreatePath) === "object"){
            let path = pathOrCreatePath as Path2D;

            this.context.clip(path);

            return path;
        }
        else{
            let path = new Path2D();

            pathOrCreatePath(path);

            this.context.clip(path);

            return path;
        }
    }

    // ======================================================= //
    // Settings and conversions
    // ======================================================= //
    setViewportSettings(settings: ViewportSettings){
        this._viewportSettings = settings;
        this.setup();
    }
    setDocumentSettings(settings: DocumentSettings){
        this._documentSettings = settings;

        this.canvas.width = this.documentSettings.widthInPixels;
        this.canvas.height = this.documentSettings.heightInPixels;
        this.context.imageSmoothingEnabled = this.imageSmoothingEnabled;

        this.setup();
    }
    canvasToViewport(x: number, y: number): {x: number, y: number} {
        if(this.canvas instanceof HTMLCanvasElement){
            x /= this.canvas.offsetWidth;
            y /= this.canvas.offsetHeight;
            x *= this.canvas.width;
            y *= this.canvas.height;
        }

        let transform = this.context.getTransform();

        transform.invertSelf();
   
        return transform.transformPoint({x, y});
    }

    // ======================================================= //
    // Getters
    // ======================================================= //
    get width(){
        return this.canvas.width;
    }
    get height(){
        return this.canvas.height;
    }
    get viewportSettings(){
        return this._viewportSettings;
    }
    get documentSettings(){
        return this._documentSettings;
    }
    getViewportRectangle(){
        return this.viewportSettings.getViewportBounds();
    }
    getDocumentRectangle(){
        return this.viewportSettings.getViewportBoundsForDocument(this.documentSettings);
    }
}