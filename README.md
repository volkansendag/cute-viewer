# cute-viewer
Cute Viewer - Jquery SinglePage Application



```
        <div id="viewer"></div>
```


```
$(document).ready(function () {

    var viewer = new CuteViewer("#viewer");

    viewer.init({
        indexUrl: "views/index.html",
        cacheable: false
    });
})

```
