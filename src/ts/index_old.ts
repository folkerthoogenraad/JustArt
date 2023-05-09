import { Polygon2 } from "lib/math/Polygon2";
import { Vector2 } from "lib/math/Vector2";
import { Color } from "lib/graphics/Color";
import { Graphics2D } from "lib/graphics/Graphics2D";
import { DocumentSettings, DocumentUnits } from "lib/settings/DocumentSettings";
import { ViewportFit, ViewportSettings } from "lib/settings/ViewportSettings";

function createPatternStuff(size: number, color: string): OffscreenCanvas{
   console.log(size);
   let doc = new DocumentSettings(size * 2, size * 2, 72, DocumentUnits.px);
   let viewport = new ViewportSettings(0, 0, 1, 1, ViewportFit.Fill);

   let canvas = new OffscreenCanvas(doc.widthInPixels, doc.heightInPixels);

   let graphics = new Graphics2D(canvas, doc, viewport);

   graphics.setup();

   graphics.setFillColor(color);
   graphics.drawRectangle(0, 0, 1, 1, true);
   graphics.drawRectangle(0, 0, 0.5, 1, true);

   return canvas;
}

let graphics: Graphics2D;
let pointSize = 2;
let arrowSize = 2;
let vertexSize = 2;
let arrowSharpness = 1;

let backgroundColor = "white";

function drawLine(x: number, y: number, x2: number, y2: number, color: string){
   graphics.setLineWidthInPoints(pointSize * 2);
   graphics.setStrokeColor(backgroundColor);

   graphics.drawLine(x,y,x2,y2);

   graphics.setLineWidthInPoints(pointSize);
   graphics.setStrokeColor(color);
   graphics.drawLine(x,y,x2,y2);
}

function drawVector(x: number, y: number, x2: number, y2: number, color: string){
   let dx = x2 - x;
   let dy = y2 - y;

   let l = Math.sqrt(dx * dx + dy * dy);

   if(l === 0){
      l = 1;
      dx = 1;
      dy = 0;
   }

   dx /= l;
   dy /= l;

   dx *= graphics.pointSize * pointSize * arrowSize;
   dy *= graphics.pointSize * pointSize * arrowSize;

   let nx = -dy;
   let ny = dx;
   
   graphics.context.beginPath();
   
   graphics.context.moveTo(x, y);
   graphics.context.lineTo(x2, y2);
   
   graphics.context.moveTo(x2 - nx - dx * arrowSharpness, y2 - ny - dy * arrowSharpness);
   graphics.context.lineTo(x2, y2);
   graphics.context.lineTo(x2 + nx - dx * arrowSharpness, y2 + ny - dy * arrowSharpness);
   
   graphics.setLineWidthInPoints(pointSize * 2);
   graphics.context.strokeStyle = backgroundColor;
   graphics.context.stroke();
   
   graphics.context.strokeStyle = color;
   graphics.setLineWidthInPoints(pointSize);
   graphics.context.stroke();
}

function drawVertex(x: number, y: number, color: string){
   graphics.setFillColor(backgroundColor);
   graphics.drawCircle(x, y, graphics.pointSize * pointSize * vertexSize, true);

   graphics.setStrokeColor(backgroundColor);
   graphics.setLineWidthInPoints(pointSize * 2);
   graphics.drawCircle(x, y, graphics.pointSize * pointSize * vertexSize, false);

   graphics.setStrokeColor(color);
   graphics.setLineWidthInPoints(pointSize);
   graphics.drawCircle(x, y, graphics.pointSize * pointSize * vertexSize, false);

}

function drawPolygon(positions: number[], stroke: string, fill: string){
   graphics.setFillColor(fill);
   // graphics.drawPath(positions, true, true); // TODO readd this

   graphics.setStrokeColor(backgroundColor);
   graphics.setLineWidthInPoints(pointSize * 2);
   // graphics.drawPath(positions, false, true); // TODO readd this
   
   graphics.setStrokeColor(stroke);
   graphics.setLineWidthInPoints(pointSize);
   // graphics.drawPath(positions, false, true); // TODO readd this
   
   for(let i = 0; i < positions.length / 2; i++){
      let x = positions[i * 2];
      let y = positions[i * 2 + 1];

      drawVertex(x, y, stroke);
   }
}

function drawPolygonFull(polygon: Polygon2, stroke?: string, fill?: string, edgenormals?: string, pointnormals?: string){
   let t = polygon.vertices.flatMap(p => [p.x, p.y]);
   
   if(fill){
      graphics.setFillColor(fill);
      // graphics.drawPath(t, true, true); // TODO readd this
   }

   if(stroke){
      graphics.setStrokeColor(backgroundColor);
      graphics.setLineWidthInPoints(pointSize * 2);
      // graphics.drawPath(t, false, true); // TODO readd this
   
      graphics.setStrokeColor(stroke);
      graphics.setLineWidthInPoints(pointSize);
      // graphics.drawPath(t, false, true); // TODO readd this
   }

   // Draw edge normals
   if(edgenormals){
      for(let i = 0; i < polygon.vertices.length; i++){
         let e = polygon.getEdgeNormal(i).scale(0.2);
   
         let o = polygon.getEdgeCenter(i);
   
         drawVector(o.x, o.y, o.x + e.x, o.y + e.y, edgenormals);
      }
   }

   // Draw vertex normals
   if(pointnormals){
      for(let i = 0; i < polygon.vertices.length; i++){
         let e = polygon.getPointNormal(i).scale(1);
   
         let o = polygon.getPoint(i);
   
         drawVector(o.x, o.y, o.x + e.x, o.y + e.y, pointnormals);
      }
   }
   
   if(stroke){
      for(let i = 0; i < polygon.vertices.length; i++){
         let p = polygon.getPoint(i);
   
         drawVertex(p.x, p.y, stroke);
      }
   }
}

function drawGrid(x: number, y: number, w: number, h: number, xdiv: number, ydiv: number, subgridx: number, subgridy: number, color: string, colorsubgrid: string){
   graphics.setStrokeColor(colorsubgrid);
   graphics.setLineWidthInPoints(pointSize * 0.5);

   for(let i = 0; i <= xdiv * subgridx; i++){
      let f = x + i / (xdiv * subgridx) * w;
      
      graphics.drawLine(f, y, f, y + h);
   }
   for(let i = 0; i <= ydiv * subgridy; i++){
      let f = y + i / (ydiv * subgridy) * h;
      
      graphics.drawLine(x, f, x + w, f);
   }

   graphics.setStrokeColor(color);
   graphics.setLineWidthInPoints(pointSize);

   for(let i = 0; i <= xdiv; i++){
      let f = x + i / xdiv * w;
      
      graphics.drawLine(f, y, f, y + h);
   }
   for(let i = 0; i <= ydiv; i++){
      let f = y + i / ydiv * h;
      
      graphics.drawLine(x, f, x + w, f);
   }
}

document.addEventListener("DOMContentLoaded", ()=>{
   let canvas = document.getElementById("canvas") as HTMLCanvasElement;
   
   // let doc = new DocumentSettings(40, 30, 300, DocumentUnits.cm);
   let doc = new DocumentSettings(1280, 720, 72, DocumentUnits.px);
   // let viewport = new ViewportSettings(-5, -5, 5, 5, ViewportFit.Cover);
   let viewport = new ViewportSettings(-10, -10, 10, 10, ViewportFit.Cover);
   // let viewport = new ViewportSettings(-20, -20, 20, 20, ViewportFit.Cover);

   canvas.width = doc.widthInPixels;
   canvas.height = doc.heightInPixels;

   graphics = new Graphics2D(canvas, doc, viewport);

   graphics.setup();
   
   const s = 3;

   let imagePattern1 = createPatternStuff(doc.pixelsPerPoint * s,  "rgba(255, 64, 0, 0.2)");
   let imagePattern2 = createPatternStuff(doc.pixelsPerPoint * s,  "rgba(0, 128, 255, 0.2)");
   let pattern1 = graphics.createPattern(imagePattern1);
   let pattern2 = graphics.createPattern(imagePattern2);
   
   if(pattern1 == null) return;
   if(pattern2 == null) return;
   
   graphics.transformPattern(imagePattern1, pattern1, s * 2, s * 2, Math.PI / 4);
   graphics.transformPattern(imagePattern2, pattern2, s * 2, s * 2, Math.PI / 4);


   // drawVector(-2, 0, -2, -0.25, "rgba(0, 128, 255, 0.5)");

   /*drawPolygon([
      -1,-1,
      0,-0.5,
      1,-0.5,
      2,-1,
      2,1,
      0,1.5,
      -1,0,
   ], "red", "rgba(255, 0, 0, 0.2)");

   drawPolygon([
      -2, 1,
      -1.5, 0,
      -2.5, 0
   ], "rgba(0, 128, 255)", "rgba(0, 128, 255, 0.2)");

   drawVector(-2, 0.333, -1.5, -1, "rgba(0, 128, 255, 0.5)");
   drawVector(0.5, 0.25, -1.5, 2, "rgba(255, 0, 0, 0.5)");
   
   drawVertex(0.5, 0.25, "rgb(128, 0, 0)");
   drawVertex(-2, 0.333, "rgb(0, 64, 128)");*/

   let polygon = new Polygon2();
   
   let expandedPolygons: Polygon2[] = [
   ];

   // polygon.vertices.push(new Vector2(1.2499999813735494, 0.46874999301508113));
   // polygon.vertices.push(new Vector2(0.9296874861465767, -1.3046874805586413));
   // polygon.vertices.push(new Vector2(0.10156249848660082, -0.40624999394640326));
   // polygon.vertices.push(new Vector2(-0.9531249857973307, -1.2499999813735485));
   // polygon.vertices.push(new Vector2(-1.1484374828869477, 0.09374999860301658));
   // polygon.vertices.push(new Vector2(0.19531249708961695, 0.8203124877763917));
   
   // polygon2 = polygon.expanded(1);

   let expandAmount = 0.2;
   let expandCount = expandedPolygons.length;

   canvas.addEventListener("click", (e) => {
      let x = e.offsetX / canvas.offsetWidth * canvas.width;
      let y = e.offsetY / canvas.offsetHeight * canvas.height;

      var m = graphics.context.getTransform().invertSelf();

      var p = m.transformPoint({x, y});

      console.log(`${p.x}, ${p.y}`);

      let vx = p.x;
      let vy = p.y;

      polygon.vertices.push(new Vector2(vx, vy));

      updateExpansion();

      draw();
   });
   window.addEventListener("keydown", (e) => {
      console.log(e);

      if(e.key === "ArrowUp"){
         expandAmount /= 2;
      }
      else if(e.key === "ArrowDown"){
         expandAmount *= 2;
      }

      if(e.key === "ArrowLeft"){
         expandCount -= 1;
      }
      else if(e.key === "ArrowRight"){
         expandCount += 1;
      }

      updateExpansion();

      draw();
   });
   
   let t = 0;

   const updateExpansion = () => {
      expandedPolygons = [];
      
      expandedPolygons.push(polygon.expanded(expandAmount));

      for(let i = 1; i < expandCount; i++){
         expandedPolygons.push(expandedPolygons[i - 1].expanded(expandAmount));
      }
   };

   const draw = () => {
      graphics.setup();
      graphics.setFillColor(backgroundColor);
      graphics.drawRectangle(-10, -10, 20, 20, true);
      
      drawGrid(
         viewport.x, 
         viewport.y, 
         viewport.width, 
         viewport.height, 
         viewport.width, 
         viewport.height,
         4,
         4, 
         "rgba(230,230,230,1)",
         "rgba(240,240,240,1)");
         
      graphics.rotate(t);

      drawPolygonFull(polygon, "red", "rgba(255, 0, 0, 0.2)", "rgba(255, 0, 0, 0.5)", "rgba(255, 0, 0, 0.2)");

      console.log(expandedPolygons.length);
      for(let i = 0; i < expandedPolygons.length; i++){
         drawPolygonFull(expandedPolygons[i], `rgba(0, 128, 255, ${1 / (i + 1)}`);
      }
   };

   const update = () => {
      draw();

      // t += 1/60;

      // requestAnimationFrame(update);
   }

   update();
   
   // drawVertex(0, 0, "rgb(255, 0, 0)");


   // graphics.setLineWidthInPoints(s);
   // graphics.setStrokeColor("green");
   // graphics.drawLine(graphics.pointSize * s * 0.5, 0, graphics.pointSize * s * 0.5, -1);
   // graphics.setStrokeColor("rgba(0,0,255,0.2)");
   // graphics.drawLine(graphics.pointSize * s * 2.5, 0, graphics.pointSize * s * 2.5, 10);

   // graphics.setFillColor("blue");
   // graphics.drawRectangle(0, 0, s * graphics.pointSize, s * graphics.pointSize, true);
   
   // graphics.drawImageSized(imagePattern, 0, 0, imagePattern.width * graphics.pixelSize, imagePattern.height * graphics.pixelSize);
   

   // graphics.setFillPattern(pattern);
   // graphics.drawRectangle(0, 1, s * graphics.pointSize * 10, s * graphics.pointSize * 10, true);

   /*
   let path = [];
   const divisions = 200;

   const vr = s * 2;
   let vx = 0.2;
   let vy = -Math.sin(vx * Math.PI * 2) / (vx * Math.PI * 2);

   for(let i = 0; i <= divisions; i++){
      let f = i / divisions;
      let a = f * 4 - 2;
      let x = a * Math.PI * 2;

      path.push(a);
      // path.push(Math.sin(x));

      if(x === 0) path.push(-1);
      else path.push(-Math.sin(x) / x);
   }

   let fillPath = [-2, 0, ...path, 2,0];

   graphics.push();
   graphics.clipRectangle(-2, -2, 4, 2);

   graphics.setFillPattern(pattern1);
   graphics.drawPath(fillPath, true, false);

   graphics.setStrokeColor("white");
   graphics.setLineWidthInPoints(s * 2);
   graphics.drawPath(path, false, false);

   graphics.setStrokeColor("rgba(255, 64, 0, 1)");
   graphics.setLineWidthInPoints(s);
   graphics.drawPath(path, false, false);

   graphics.pop();
   
   graphics.push();

   graphics.clipRectangle(-2, 0, 4, 2);

   graphics.setFillPattern(pattern2);
   graphics.drawPath(fillPath, true, false);

   graphics.setStrokeColor("white");
   graphics.setLineWidthInPoints(s * 2);
   graphics.drawPath(path, false, false);

   graphics.setStrokeColor("rgba(0, 128, 255, 1)");
   graphics.setLineWidthInPoints(s);
   graphics.drawPath(path, false, false);

   graphics.pop();
*/
});
