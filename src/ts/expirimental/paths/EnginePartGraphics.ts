export class EnginePartGraphics {
    lineWidth: number = 1;

    createPiston(width: number, height: number): Path2D{
        let path = new Path2D();

        let w = width / 2;
        let h = height / 2;

        let holeRadius = this.lineWidth * 2;//Math.min(w, h) / 4;
        let lowerIndentRadius = this.lineWidth * 2;

        let topStartOffset = -h;
        let topEndOffset = -h + h / 4;
        
        let sealStartOffset = topEndOffset + this.lineWidth;
        let sealEndOffset = sealStartOffset + this.lineWidth;

        let bottomStartOffset = sealEndOffset + this.lineWidth;
        let bottomEndOffset = h;

        let holeOffset = (bottomStartOffset + bottomEndOffset) / 2;

        holeOffset = 0;

        // Top
        path.moveTo(-w, topStartOffset);
        path.bezierCurveTo(
            -w / 2, topStartOffset * 1.2,
            w / 2, topStartOffset * 1.2,
            w, topStartOffset);
        
        path.lineTo(w, topEndOffset);
        path.lineTo(-w, topEndOffset);
        path.lineTo(-w, topStartOffset);
        path.closePath();

        // Seal
        path.moveTo(-w, sealStartOffset);
        path.lineTo(w, sealStartOffset);
        path.lineTo(w, sealEndOffset);
        path.lineTo(-w, sealEndOffset);
        path.lineTo(-w, sealStartOffset);
        path.closePath();

        // Bottom
        path.moveTo(-w, bottomStartOffset);
        path.lineTo(w, bottomStartOffset);
        
        path.lineTo(w, bottomEndOffset);
        path.lineTo(w, bottomEndOffset);
        
        path.lineTo(w - lowerIndentRadius, bottomEndOffset);
        path.arc(w - lowerIndentRadius * 2, bottomEndOffset, lowerIndentRadius, 0, -Math.PI * 0.5, true);
        path.arc(-w + lowerIndentRadius * 2, bottomEndOffset, lowerIndentRadius, -Math.PI * 0.5, -Math.PI, true);
        path.lineTo(-w + lowerIndentRadius, bottomEndOffset);
        
        path.lineTo(-w, bottomEndOffset);
        path.lineTo(-w, bottomStartOffset);
        path.closePath();

        // Hole
        path.moveTo(holeRadius, holeOffset);
        path.arc(0,  holeOffset, holeRadius, 0, Math.PI * 2, true);
        path.closePath();

        return path;
    }

    createArm(length: number): Path2D{
        let path = new Path2D();

        let topHoleRadius = this.lineWidth * 2;
        let bottomHoleRadius = this.lineWidth * 3;

        let bottomRadius = bottomHoleRadius + this.lineWidth;
        let topRadius = topHoleRadius + this.lineWidth;

        let bezierOffset = length / 4;

        let bottomOffsetX = 0;
        let topOffsetX = length;

        path.moveTo(bottomOffsetX, -bottomRadius);
        path.bezierCurveTo(
            bottomOffsetX + bezierOffset, -topRadius,
            topOffsetX - bezierOffset, -topRadius / 2,
            topOffsetX, -topRadius);
        path.arc(topOffsetX, 0, topRadius, -Math.PI / 2, Math.PI / 2, false);
        path.bezierCurveTo(
            topOffsetX - bezierOffset, topRadius / 2,
            bottomOffsetX + bezierOffset, topRadius,
            bottomOffsetX, bottomRadius);
        path.arc(bottomOffsetX, 0, bottomRadius, Math.PI / 2, -Math.PI / 2, false);
        path.closePath();

        // Top hole
        path.moveTo(bottomOffsetX + bottomHoleRadius, 0);
        path.arc(bottomOffsetX, 0, bottomHoleRadius, 0, Math.PI * 2, true);
        path.closePath();

        // Bottom hole
        path.moveTo(topOffsetX + topHoleRadius, 0);
        path.arc(topOffsetX, 0, topHoleRadius, 0, Math.PI * 2, true);
        path.closePath();

        return path;
    }
    createWeight(radius: number): Path2D{
        let path = new Path2D();

        let innerRadius = radius * 0.5;

        let attachmentRadius = this.lineWidth * 2;

        // Main shape
        path.moveTo(radius, -innerRadius);
        path.arc(radius, 0, innerRadius, -Math.PI * 0.5, Math.PI * 0.5);
        path.arc(radius, radius, innerRadius, -Math.PI * 0.5, -Math.PI, true);
        path.arc(innerRadius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
        path.arc(radius, -radius, innerRadius, -Math.PI, -Math.PI * 1.5, true);

        path.closePath();

        // Left hole
        path.moveTo(attachmentRadius, 0);
        path.arc(0, 0, attachmentRadius, 0, Math.PI * 2, true);
        path.closePath();

        // Right hole
        path.moveTo(radius + attachmentRadius, 0);
        path.arc(radius, 0, attachmentRadius, 0, Math.PI * 2, true);
        path.closePath();

        return path;
    }
}