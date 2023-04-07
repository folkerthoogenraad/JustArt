# Quality rendering library
This is a nice quality rendering library

## Images
The images part of this library:
### Loading
```JS
let image = await ImageLoader.getImageFromURL(url);
```

### Modifying pixels
```JS
let grid = ImageLoader.getImageGridFromImage(image);

grid.getPixel(...);
grid.setPixel(...);
grid.map(...);
grid.mapSelf(...);

let image = ImageLoader.getImageFromGrid(grid);
```

## Drawing
Simple setup, creates a document of the size of the canvas and a viewport with that same size.

```JS
let graphics = new Graphics2D(canvas);
```

```JS
// 300 dpi, 30x20cm document
let document = new DocumentSettings(30, 20, 300, DocumentUnits.cm);

let graphics = new Graphics2D(canvas, document);
```

```JS
// 300 dpi, 30x20cm document
let document = new DocumentSettings(30, 20, 300, DocumentUnits.cm);

// from -1 to 1 on both axis
// ViewportFit = object-fit css, 
//  - Fill = fill everything, don't keep aspect ratio
//  - Contain = Find biggest rectangle fitting inside the canvas
//  - cover = Find biggest rectangle covering the whole canvas
let viewport = new ViewportSettings(-1, -1, 1, 1, ViewportFit.Contain);

let graphics = new Graphics2D(canvas, document, viewport);

// You can also set it later
graphics.setViewportSettings(viewport);
```