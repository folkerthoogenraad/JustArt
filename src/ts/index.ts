import { HandDrawnBrush } from "expirimental/brushes/HandDrawnBrush";
import { PressurePath } from "expirimental/brushes/PressurePath";
import { InterpolationCurves } from "expirimental/math/InterpolationCurve";
import { MathHelper } from "expirimental/math/MathHelper";
import { Vector2 } from "expirimental/math/Vector2";
import { Color } from "lib/graphics/Color";
import { Graphics2D } from "lib/graphics/Graphics2D";
import { ImageLoader } from "lib/loader/ImageLoader";
import { ViewportFit, ViewportSettings } from "lib/settings/ViewportSettings";

async function imageSomething(){
   let canvas = document.getElementById("canvas") as HTMLCanvasElement;

   let image = await ImageLoader.getImageFromURL("https://images.unsplash.com/photo-1680466357571-e2a63c884093?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80");
   
   let graphics = new Graphics2D(canvas);
   graphics.setViewportSettings(new ViewportSettings(0, 0, image.width, image.height, ViewportFit.Cover));

   graphics.translate(image.width / 2, image.height / 2);
   graphics.rotateDeg(45);
   graphics.translate(-image.width / 2, -image.height / 2);

   graphics.push();

   graphics.clip((path) => {
      path.arc(graphics.viewportSettings.width / 2, graphics.viewportSettings.height / 2, 256, 0, Math.PI * 2, false);
   });

   graphics.drawImage(image, 0, 0);

   graphics.pop();

   canvas.addEventListener("click", ev => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

      graphics.drawCircle(p.x!, p.y!, graphics.pointSize * 4, true);

      console.log(p);
   });
}

function signatureStuff(){
   let canvas = document.getElementById("canvas") as HTMLCanvasElement;
   
   let graphics = new Graphics2D(canvas);

   let paths: PressurePath[] = [];
   let currentPath: PressurePath = new PressurePath();

   let brush = new HandDrawnBrush();
   brush.width = 100;
   brush.subdivisionLength = 32;
   brush.pressureCurve = n => n * n;
   
   let _requestedDraw: number|undefined = undefined;
   let draw = () => {
      _requestedDraw = undefined;

      graphics.setup();
   
      graphics.setFillColor("#fff5dd");
      graphics.drawRectangle(0, 0, canvas.width, canvas.height, true);
      
      graphics.setFillColor("#423627");

      paths.forEach(path => {
         brush.drawPressurePath(graphics, path);
      });
      
      brush.drawPressurePath(graphics, currentPath);
   };
   let requestDraw = () => {
      if(_requestedDraw){
         cancelAnimationFrame(_requestedDraw);
      }

      _requestedDraw = requestAnimationFrame(draw);
   };
   requestDraw();

   let addPoint = (ev: MouseEvent) => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);
      currentPath.addPoint(new Vector2(p.x, p.y), runningPressure);
      
      requestDraw();
   };

   

   // Convolution bby
   let makeSmoothVersion = (path: PressurePath): PressurePath => {
      if(path.points.length <= 0) return path;

      let outpath = new PressurePath();
      
      let weights: number[] = [];

      for(let i = 0; i < 10; i++){
         let z = (i / 10) * 4 - 2;

         weights.push(Math.exp(-z * z));
      }

      // Content doesn't matter, just length
      let x = [...weights];
      let y = [...weights];
      let p = [...weights];

      for(let i = 0; i < path.points.length - weights.length; i++){
         for(let j = 0; j < weights.length; j++){
            x[j] = path.points[i + j].position.x;
            y[j] = path.points[i + j].position.y;
            p[j] = path.points[i + j].pressure;
         }

         outpath.addPoint(
            new Vector2(
               MathHelper.weightedAvarage(weights, x),
               MathHelper.weightedAvarage(weights, y)
            ),
            MathHelper.weightedAvarage(weights, p),
         );
      }

      return outpath;
   };

   let drawing = false;
   let runningPressure = 1;
   let runningVelocity = 0;

   let previousTime = 0;
   let previousX = 0;
   let previousY = 0;

   canvas.addEventListener("mousemove", ev => {
      let now = window.performance.now();
      
      let dt = now - previousTime;
      let dx = ev.offsetX - previousX;
      let dy = ev.offsetY - previousY;
      
      // Rule of thumb
      if(Vector2.fSquareLength(dx, dy) < brush.width / 2) return;
      
      let vx = dx / dt;
      let vy = dy / dt;
      
      if(dt === 0){
         vx = 0;
         vy = 0;
      }
      
      let velocity = Vector2.fLength(vx, vy);
      
      runningVelocity = MathHelper.lerp(runningVelocity, velocity, 1);
      
      let wantedPressure = 1 / (runningVelocity * 0.4 + 1);
      // let wantedPressure = 1;
      
      runningPressure = MathHelper.lerp(runningPressure, wantedPressure, 1);
      
      previousTime = now;
      previousX = ev.offsetX;
      previousY = ev.offsetY;
         
      if(drawing){
         addPoint(ev);
      }
   });
   canvas.addEventListener("mousedown", ev => {
      previousTime = window.performance.now();
      previousX = ev.offsetX;
      previousY = ev.offsetY;
      addPoint(ev);

      drawing = true;
   });
   canvas.addEventListener("mouseup", ev => {
      previousTime = window.performance.now();
      previousX = ev.offsetX;
      previousY = ev.offsetY;

      addPoint(ev);
      drawing = false;

      paths.push(makeSmoothVersion(currentPath));
      // paths.push(currentPath);

      currentPath = new PressurePath();
   });
   
   window.addEventListener("keydown", ev => {
      if(ev.key === "Enter"){
         paths.push(currentPath);
         currentPath = new PressurePath();
      }
   });

   canvas.addEventListener("click", ev => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

      // currentPath.addPoint(new Vector2(p.x, p.y), Math.random() * 0.5 + 0.5);
      
      requestDraw();
   });
}


function signatureStuff2(){
   let canvas = document.getElementById("canvas") as HTMLCanvasElement;
   
   let graphics = new Graphics2D(canvas);

   let backgroundColor = Color.parse("#fff5dd");
   let foregroundColor = Color.parse("#423627");

   let coolPath0: PressurePath = new PressurePath();
   let coolPath1: PressurePath = new PressurePath();
   let coolPath2: PressurePath = new PressurePath();
   let coolPath3: PressurePath = new PressurePath();
   let coolPath4: PressurePath = new PressurePath();

   let currentPath: PressurePath = new PressurePath();

   let brush = new HandDrawnBrush();
   brush.width = 100;
   brush.subdivisionLength = 32;
   brush.pressureCurve = n => n * n;
   
   let _requestedDraw: number|undefined = undefined;
   let draw = () => {
      _requestedDraw = undefined;

      graphics.setup();
   
      graphics.setFillColor(backgroundColor.toHexString());
      graphics.drawRectangle(0, 0, canvas.width, canvas.height, true);
      
      graphics.setFillColor(Color.lerp(foregroundColor, backgroundColor, 1 - 0.125 * 0.25).toHexString());
      brush.drawPressurePath(graphics, coolPath4);
      graphics.setFillColor(Color.lerp(foregroundColor, backgroundColor, 1 - 0.125).toHexString());
      brush.drawPressurePath(graphics, coolPath3);
      graphics.setFillColor(Color.lerp(foregroundColor, backgroundColor, 1 - 0.25).toHexString());
      brush.drawPressurePath(graphics, coolPath2);
      graphics.setFillColor(Color.lerp(foregroundColor, backgroundColor, 1 - 0.5).toHexString());
      brush.drawPressurePath(graphics, coolPath1);
      graphics.setFillColor(Color.lerp(foregroundColor, backgroundColor, 0).toHexString());
      brush.drawPressurePath(graphics, coolPath0);
      
      brush.drawPressurePath(graphics, currentPath);
   };
   let requestDraw = () => {
      if(_requestedDraw){
         cancelAnimationFrame(_requestedDraw);
      }

      _requestedDraw = requestAnimationFrame(draw);
   };
   requestDraw();

   let addPoint = (ev: MouseEvent) => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);
      currentPath.addPoint(new Vector2(p.x, p.y), runningPressure);
      
      requestDraw();
   };

   

   // Convolution bby
   let makeSmoothVersion = (path: PressurePath): PressurePath => {
      if(path.points.length <= 0) return path;

      let outpath = new PressurePath();
      
      let weights: number[] = [];

      for(let i = 0; i < 100; i++){
         let z = (i / 10) * 4 - 2;

         weights.push(Math.exp(-z * z));
      }

      // Content doesn't matter, just length
      let x = [...weights];
      let y = [...weights];
      let p = [...weights];

      for(let i = 0; i < path.points.length - weights.length; i++){
         for(let j = 0; j < weights.length; j++){
            x[j] = path.points[i + j].position.x;
            y[j] = path.points[i + j].position.y;
            p[j] = path.points[i + j].pressure;
         }

         outpath.addPoint(
            new Vector2(
               MathHelper.weightedAvarage(weights, x),
               MathHelper.weightedAvarage(weights, y)
            ),
            MathHelper.weightedAvarage(weights, p),
         );
      }

      return outpath;
   };

   let drawing = false;
   let runningPressure = 1;
   let runningVelocity = 0;

   let previousTime = 0;
   let previousX = 0;
   let previousY = 0;

   canvas.addEventListener("mousemove", ev => {
      let now = window.performance.now();
      
      let dt = now - previousTime;
      let dx = ev.offsetX - previousX;
      let dy = ev.offsetY - previousY;
      
      // Rule of thumb
      if(Vector2.fSquareLength(dx, dy) < brush.width / 2) return;
      
      let vx = dx / dt;
      let vy = dy / dt;
      
      if(dt === 0){
         vx = 0;
         vy = 0;
      }
      
      let velocity = Vector2.fLength(vx, vy);
      
      runningVelocity = MathHelper.lerp(runningVelocity, velocity, 1);
      
      let wantedPressure = 1 / (runningVelocity * 0.4 + 1);
      // let wantedPressure = 1;
      
      runningPressure = MathHelper.lerp(runningPressure, wantedPressure, 1);
      
      previousTime = now;
      previousX = ev.offsetX;
      previousY = ev.offsetY;
         
      if(drawing){
         addPoint(ev);
      }
   });
   canvas.addEventListener("mousedown", ev => {
      previousTime = window.performance.now();
      previousX = ev.offsetX;
      previousY = ev.offsetY;
      addPoint(ev);

      drawing = true;
   });
   canvas.addEventListener("mouseup", ev => {
      previousTime = window.performance.now();
      previousX = ev.offsetX;
      previousY = ev.offsetY;

      addPoint(ev);
      drawing = false;


      let makeSmoothWithOffset = (offset: number, path: PressurePath) => {
         let newPath = new PressurePath();

         newPath.points = path.points.map(point => {
            return {position: point.position.clone().add(new Vector2(offset, offset)), pressure: point.pressure}
         });

         return makeSmoothVersion(newPath);
      }

      let smooth = makeSmoothVersion(currentPath);

      coolPath0 = smooth;
      coolPath1 = makeSmoothWithOffset(10, coolPath0);
      coolPath2 = makeSmoothWithOffset(20, coolPath1);
      coolPath3 = makeSmoothWithOffset(30, coolPath2);
      coolPath4 = makeSmoothWithOffset(40, coolPath3);

      currentPath = new PressurePath();
   });
}

document.addEventListener("DOMContentLoaded", async ()=>{
   signatureStuff2();
});
