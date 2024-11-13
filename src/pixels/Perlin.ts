import { Vector2 } from "../math/Vector2";
import { EdgeBehaviour, ImageGrid } from "./ImageGrid";
import { Sampler } from "./Sampler";

export class Perlin {
    static generatePerlinTextureWithOctaves(width: number, height: number, perlinWidth: number, perlinHeight: number, octaves: number[]){
        let sum = 0;
        
        octaves.forEach(octave => {sum += octave;});

        octaves = octaves.map(octave => octave / sum);

        let maps = octaves.map((value, index) => {
            return this.generatePerlinTexture(width, height, perlinWidth * (index + 1), perlinHeight * (index + 1)).mapSelf(x => x * value);
        });

        return Sampler.create(width, height, (x, y) => {
            let sum = 0;

            maps.forEach((map, index) => {
                sum += map.getPixel(x, y);
            });

            return sum;
        })
    }

    static generatePerlinTexture(width: number, height: number, perlinWidth: number, perlinHeight: number, vectorGenerator?: (x: number, y: number) => Vector2): ImageGrid<number> {
        if (vectorGenerator === undefined) {
            vectorGenerator = () => Vector2.angled(Math.random() * Math.PI * 2);
            // vectorGenerator = (x, y) => Vector2.angled(x * y * 151354);
        }

        // Generate the gradient vector field
        let gradientVectors = new ImageGrid<Vector2>(perlinWidth, perlinHeight);
        gradientVectors.mapSelf((v, x, y) => {
            return vectorGenerator!(x / perlinWidth, y / perlinHeight);
        });
        gradientVectors.edgeBehaviour = EdgeBehaviour.Wrap;

        let dotGradient = (x: number, y: number, ix: number, iy: number) => {
            let gv = gradientVectors.getPixel(ix, iy);

            let dx = x - ix;
            let dy = y - iy;

            return Vector2.fDot(gv.x, gv.y, dx, dy);
        };

        let interpolate = (a: number, b: number, f: number) => {
            // return a + (b - a) * f;
            return (b - a) * (3.0 - f * 2.0) * f * f + a;
        }

        let output = new ImageGrid<number>(1024, 1024);
  
        output.mapSelf((v, x, y) => {
          let gx = Sampler.remap(0, output.width, 0, gradientVectors.width, x);
          let gy = Sampler.remap(0, output.height, 0, gradientVectors.height, y);
      
          // fmod
          let ix = Math.floor(gx);
          let iy = Math.floor(gy);
          let rx = gx - ix;
          let ry = gy - iy;
          
          let gv = interpolate(
            interpolate(dotGradient(gx, gy, ix, iy), dotGradient(gx, gy, ix + 1, iy), rx),
            interpolate(dotGradient(gx, gy, ix, iy + 1), dotGradient(gx, gy, ix + 1, iy + 1), rx),
            ry
          );
      
          return Sampler.remap(-1, 1, 0, 1, gv);
        });

        output.edgeBehaviour = EdgeBehaviour.Wrap;

        return output;
    }
}