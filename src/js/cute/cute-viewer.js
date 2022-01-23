class CuteViewer {
    DEFAULT_TITLE = "Evolution";
    $wrapper;
    VIEWLIST = [];
    ROOTLIST = [];
    linkClassName = "cute-viewer-link";
    appVersion = window.APP_VERSION || 2;
    menuDataSource;
    WrapperHtml = `<div class="ct-wrapper"></div>`
    ViewWrapperHtml = `<div class="ct-view-wrapper"></div>`
    settings = {
        // These are the defaults.
        replaceState: false,
        replaceHash: true,
        color: "#556b2f",
        backgroundColor: "white",
        cacheable: true
    }

    constructor($el, options) {
        this.$this = $($el);

        if (options) {
            this.settings = $.extend(true, this.settings, options);
        }
    }

    init(options) {
        this.settings = $.extend(true, this.settings, options);
        this.$wrapper = $(this.WrapperHtml).appendTo(this.$this);
        this.setHashChangeEvent();
    }


    checkHashUrl() {

        var url = this.getHashUrl();
        if (url) {
            setTimeout(() => {
                openUrlInView(url);
            }, 200);
        }
    }

    getHashUrl() {
        var url;

        var hash = window.location.hash;

        if (hash && hash.split("#").length > 1) {
            url = hash.split("#")[1];
        }

        if (!url && settings.indexUrl) {
            url = settings.indexUrl;
        }

        return url;
    }

    getHashParameter(key) {
        var url = this.getHashUrl();

        if (url) {
            var queryString = url.split("?")[1];
            if (queryString) {
                var urlParams = new URLSearchParams(queryString);

                return urlParams.get(key);
            }
        }
    }

    updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }

    changeHashParameter(key, value, reload) {
        var url = this.getHashUrl();
        var self = this;
        if ($.isPlainObject(key)) {
            $.each(key, function (k, v) {
                url = self.updateQueryStringParameter(url, k, v);
            });
            reload = key.reload;
        } else {
            url = self.updateQueryStringParameter(url, key, value);
        }

        if (reload !== true) {
            this.onlyChangeHash = true;
        }

        window.location.hash = '#' + url;
    }

    goToMainPage() {
        var self = this;
        setTimeout(function () {
            self.openUrlInView(self.settings.indexUrl);
        }, 200);
    }

    getRoots() {
        return this.ROOTLIST;
    }

    getViewList() {
        return this.VIEWLIST;
    }


    setTitleFromUrl(url, title) {
        if (!title) {
            var menuData;
            if (url && this.menuDataSource) {
                menuData = this.menuDataSource.data().filter(function (v) { return v.url == url })[0];
            }

            if (menuData && menuData.title) {
                title = menuData.title;
            }
        }

        if (!title) {
            title = this.DEFAULT_TITLE;
        }

        document.title = title + " - " + (window.config ? window.config.AppName : "Cute Dev")
    }

    onlyChangeHash = false;

    setHashChangeEvent() {
        var self = this;
        function onHashChange(e, v) {
            var url = self.getHashUrl();
            if (url && self.onlyChangeHash != true) {
                self.openUrlInView(url);
            }

            if (self.onlyChangeHash == true) {
                self.onlyChangeHash = false;
            }
        }

        window.addEventListener('hashchange', onHashChange, false);
    }

    getWrapper() {
        return this.$wrapper;
    }

    refresh() {
        console.log(this.$this);
    }

    getCurrentView() {
        return this.VIEWLIST.filter(function (v) { return v.visible })[0];
    }

    removeCurrent() {
        this.VIEWLIST.filter(function (v) { return v.visible }).forEach(function (v) {
            if (v.element && v.element.remove) {
                v.element.remove();
            }
        });
        this.VIEWLIST = this.VIEWLIST.filter(function (v) { return !v.visible })
    }

    openUrl(url, title, removeCurrent) {
        if (removeCurrent == true) {
            this.$this.removeCurrent();
        }

        var hash = '#' + url;
        window.location.hash = hash;

        this.setTitleFromUrl(url, title);
    }

    openUrlInView(url) {

        if (!url)
            throw DOMException("url boş olamaz.");

        if (this.settings.cacheable === false) {
            this.$this.removeCurrent();
        }

        this.VIEWLIST.filter(function (v) { return v.visible }).forEach(function (v) {
            if (v.element) {
                v.element.hide();
                v.visible = false;
            }
        });

        var currentView = this.VIEWLIST.filter(function (v) { return v.url == url; })[0];

        if (currentView) {
            currentView.visible = true;
            currentView.element.show();
            currentView.element.trigger("show", [url]);
        } else {
            var $element = $(this.ViewWrapperHtml).appendTo(this.$wrapper);

            $element.data("view-url", url);

            currentView = {
                visible: true,
                element: $element,
                url: url
            };

            this.VIEWLIST.push(currentView);

            if (url) {
                var urlArray = url.split("?");
                var query = urlArray[1] || "";
                var search = new URLSearchParams(query)
                search.set("version", this.appVersion);

                url = urlArray[0] + "?" + search.toString();
            }

            $element.load(url, function () {
                $element.trigger("show", [url]);
            });
        }

        this.setTitleFromUrl(url);

        this.$this.trigger("open", [{ url: url }]);

        this.$this.trigger("url-changed", [{ url: url }])

        return currentView;
    }

    setUrlHrefClicks($body) {
        var self = this;
        if (!$body) {
            $body = $("body");
        }

        $body.find("a." + this.linkClassName).on("click", function (e) {
            var url = $(this).attr("href");
            if (url !== undefined && url != "" && url != "#") {
                e.preventDefault();
                self.openUrl(url);

            }
        });
    }

    setRoots(list) {
        var self = this;
        if ($.isArray(list)) {
            list.forEach(function (v) {
                self.ROOTLIST.push(v);
            })
        }
    }
}