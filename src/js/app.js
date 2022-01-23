$(function () {

    var viewer = new CuteViewer("#viewer");

    viewer.init({
        indexUrl: "views/index.html",
        cacheable: false
    });
})