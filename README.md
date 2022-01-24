# cute-viewer
Cute Viewer - Jquery SinglePage Application


## link pages
```
<a href="#views/page1.html">Page 1</a>
<a href="#views/page2.html">Page 2</a>
```

## wrapper
```
<div id="viewer"></div>
```

## to init viewer
```
var viewer = new CuteViewer("#viewer");

viewer.init({
        indexUrl: "views/index.html",
        cacheable: false
});
```

or 

```
var viewer = new CuteViewer("#viewer", {
        indexUrl: "views/index.html",
        cacheable: false
});
```
