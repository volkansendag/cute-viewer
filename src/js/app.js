$(document).ready(function () {

    var viewer = new CuteViewer("#viewer");

    viewer.init({
        indexUrl: "views/index.html"
    });
    viewer.goToMainPage();
    console.log(this);
})