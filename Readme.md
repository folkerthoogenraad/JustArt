# JustArt
A quality rendering library, running in your web browser.

## Features
 * Easy drawing on a web canvas
 * Adjusting viewports with automatic fitting
 * Easy document sizing for print and DPI settings

## Setup
_Note: to install and use this package, read the ["Building"](#building) section._

To setup, import the classes you need from the library:
```TS
import { Graphics2D } from "@justfolkert/just-art"
```

Drawing to a canvas, simply use:
```TS
// Setup the graphics from a canvas
let graphics = new Graphics2D({ canvas: document.getElementById("my-canvas") });

// Set the stroke color and line width
graphics.setStrokeColor("green");
graphics.setLineWidthInPoints(2);

// Draw a line
graphics.drawLine(10, 10, 128, 128);
```

## Document settings
If you don't specify any document, by default it will use the actual size of the canvas (by css rules basically) as the size of the document. But, you can also specify a specific size you want the document to be. This way, the canvas will keep the width and height.
```TS
// 30x20cm, 300 dpi document
let documentSettings = new DocumentSettings(30, 20, 300, DocumentUnits.cm);

let graphics = new Graphics2D({
    canvas,
    documentSettings
});
```

The `DocumentSettings` also provides a few presets, like `DocumentSettings.A4Portrait` and `DocumentSettings.Screen4K`.

## Viewport settings
The viewport is the drawable coordinate area. This can be used when drawing to have a fixed size area, regardless of the document size (and dpi). By default, the viewport is equal to the size of the canvas at the creation of the `Graphics2D` (meaning, the width the actual width and the height too).

```TS
// ViewportFit is similar to object-fit css, 
//  - Fill = fill everything, stretch and don't keep aspect ratio
//  - Contain = Find biggest rectangle fitting inside the canvas
//  - Cover = Find biggest rectangle covering the whole canvas
//  - MatchWidth = Set the width as fixed, and the height based on the aspect ratio
//  - MatchHeight = Set the height as fixed, and the width based on the aspect ratio

// Viewport from -1 to 1 on both axis
let viewportSettings = new ViewportSettings(-1, -1, 1, 1, ViewportFit.Contain);

let graphics = new Graphics2D({
    canvas,
    viewportSettings
});
```

The `ViewportSettings` also provides some nice convenience features, like `ViewportSettings.create` or `ViewportSettings.centered` to specify a position and width + height instead.

## Building
For now, this project isn't an npm package (yet?). So, the only way to use it is to build the project yourself. Luckily, that is really easy.

```bash
git clone https://github.com/folkerthoogenraad/JustArt.git`
cd JustArt
npm install
npm run build
```

Then, in your own project you can install this using `npm install --save ../JustArt` to install this local package. Ofcourse, the path to the `JustArt` root can be altered if you put it in a different folder.

## Credits
Created by Folkert Hoogenraad