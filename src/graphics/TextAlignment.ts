export enum TextHorizontalAlignment {
    Left, Center, Right
}
export enum TextVerticalAlignment {
    Top, Center, Baseline, Bottom
}

export interface TextMeasurement {
    /**
     * The width of the full text bounding box, measured from top left.
     */
    width: number;

    /**
     * The baseline of the full text bounding box, measured from top left.
     */
    baseline: number;
    
    /**
     * The height of the full text bounding box, measured from top left.
     */
    height: number;
}