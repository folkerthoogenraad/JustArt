import { Rect2 } from "lib/math/Rect2";
import { DocumentSettings, DocumentUnits } from "./DocumentSettings";

export enum ViewportFit {
    Fill,
    Contain,
    Cover,
}

export class ViewportSettings{
    readonly minX: number;
    readonly minY: number;

    readonly maxX: number;
    readonly maxY: number;

    readonly fit: ViewportFit;

    constructor(minX: number, minY: number, maxX: number, maxY: number, fit: ViewportFit){
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;

        this.fit = fit;
    }

    get x () {return this.minX;}
    get y () {return this.minY;}
    get centerX () {return this.x + this.width / 2;}
    get centerY () {return this.y + this.height / 2;}

    get width() {return this.maxX - this.minX;}
    get height() {return this.maxY - this.minY;}

    get aspectRatio() {return this.width / this.height;}

    translated(x: number, y: number){
        return new ViewportSettings(
            this.minX - x, 
            this.minY - y, 
            this.maxX - x, 
            this.maxY - y, 
            this.fit);
    }

    getViewportBounds(){
        return Rect2.create(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    getDocumentBounds(documentSettings: DocumentSettings){
        let width = this.width;
        let height = this.height;

        let documentAspectRatio = documentSettings.widthInPixels / documentSettings.heightInPixels; 
        let viewportAspectRatio = this.width / this.height; 

        let aspectRatio = documentAspectRatio / viewportAspectRatio;

        if(this.fit === ViewportFit.Contain){
            if(aspectRatio > 1) width *= aspectRatio;
            else height /= aspectRatio;
        }
        else if(this.fit === ViewportFit.Cover){
            if(aspectRatio > 1) height /= aspectRatio;
            else width *= aspectRatio;
        }

        let centerX = this.centerX;
        let centerY = this.centerY;

        return Rect2.create(
            centerX - width / 2,
            centerY - height / 2,
            width,
            height
        );
    }

    getViewportSize(value: number, unit: DocumentUnits, documentSettings: DocumentSettings) {
        // TODO
    }

    getPointSize(documentSettings: DocumentSettings){
        let nx = 1 / documentSettings.widthInPixels;

        let bounds = this.getDocumentBounds(documentSettings);

        return bounds.width * nx;
    }

    getViewportPositionFromDocumentPosition(documentPixelX: number, documentPixelY: number, documentSettings: DocumentSettings){
        let nx = documentPixelX / documentSettings.widthInPixels;
        let ny = documentPixelY / documentSettings.heightInPixels;

        let bounds = this.getDocumentBounds(documentSettings);

        return {
            x: bounds.x + bounds.width * nx,
            y: bounds.y + bounds.height * ny,
        }
    }
    getDocumentPositionFromViewportPosition(viewportX: number, viewportY: number, documentSettings: DocumentSettings){
        let bounds = this.getDocumentBounds(documentSettings);

        let nx = (viewportX - bounds.x) / bounds.width;
        let ny = (viewportY - bounds.y) / bounds.height;

        return {
            x: documentSettings.widthInPixels * nx,
            y: documentSettings.heightInPixels * ny,
        }
    }

    static create(x: number, y: number, width: number, height: number, fit: ViewportFit){
        return new ViewportSettings(x, y, x + width, y + height, fit);
    }
    static centered(x: number, y: number, width: number, height: number, fit: ViewportFit){
        return new ViewportSettings(x - width / 2, y - height / 2, x + width / 2, y + height / 2, fit);
    }
}