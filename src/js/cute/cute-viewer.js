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
        this.checkHashUrl();
    }


    checkHashUrl() {
        var url = this.getHashUrl();
        if (url) {
            setTimeout(() => {
                this.openUrlInView(url);
            }, 200);
        } else {
            this.goToMainPage();
        }
    }

    getHashUrl() {
        var url;

        var hash = window.location.hash;

        if (hash && hash.split("#").length > 1) {
            url = hash.split("#")[1];
        }

        if (!url && this.settings.indexUrl) {
            url = this.settings.indexUrl;
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
        if ($.isPlainObject(key)) {
            $.each(key, (k, v) => {
                url = this.updateQueryStringParameter(url, k, v);
            });
            reload = key.reload;
        } else {
            url = this.updateQueryStringParameter(url, key, value);
        }

        if (reload !== true) {
            this.onlyChangeHash = true;
        }

        window.location.hash = '#' + url;
    }

    goToMainPage() {
        setTimeout(() => {
            this.openUrlInView(self.settings.indexUrl);
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
                menuData = this.menuDataSource.data().filter((v) => v.url == url)[0];
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
        window.addEventListener('hashchange', (e, v) => {
            var url = this.getHashUrl();
            if (url && this.onlyChangeHash != true) {
                this.openUrlInView(url);
            }

            if (this.onlyChangeHash == true) {
                this.onlyChangeHash = false;
            }
        });
    }

    getWrapper() {
        return this.$wrapper;
    }

    refresh() {
        console.log(this.$this);
    }

    getCurrentView() {
        return this.VIEWLIST.filter((v) => v.visible)[0];
    }

    removeCurrent() {
        this.VIEWLIST.filter((v) => v.visible).forEach(function (v) {
            if (v.element && v.element.remove) {
                v.element.remove();
            }
        });
        this.VIEWLIST = this.VIEWLIST.filter((v) => !v.visible)
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

        this.VIEWLIST.filter((v) => v.visible).forEach((v) => {
            if (v.element) {
                v.element.hide();
                v.visible = false;
            }
        });

        var currentView = this.VIEWLIST.filter((v) => v.url == url)[0];

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

            $element.load(url, () => {
                $element.trigger("show", [url]);
            });
        }

        this.setTitleFromUrl(url);

        this.$this.trigger("open", [{ url: url }]);

        this.$this.trigger("url-changed", [{ url: url }])

        return currentView;
    }

    setRoots(list) {
        if ($.isArray(list)) {
            list.forEach((v) => {
                this.ROOTLIST.push(v);
            })
        }
    }
}