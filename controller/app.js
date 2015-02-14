/*
 *  controlloer
 */
define(['$', 'b'], function($, b) {

    var Application = new b.Class({
        _propertys_: function() {
            var scope = this;
            this.webRoot = ''; //应用根目录
            this.head = $('head');
            this.body = $('body');
            this.viewRoot = './view/'; //视图所在根目录
            this.defaultView = 'index'; //默认加载视图

            this.request; //请求对象
            this.viewPath; //当前请求视图路径，解析request得出
            this.mainFrame; //主框架
            this.viewPort; //视图框架
            this.stateDom; //状态栏

            this.views = new b.Hash(); //views保存浏览器存储的hash
            this.curView; //当前视图
            this.interface = {}; //提供给视图访问的接口,先不管
            this.history = []; //历史记录

            // this.stopListening = false; //是否开启监听

            this.onHashChange = function() {
                scope.history.push(window.location.href);
                var url = decodeURIComponent(window.location.hash.replace(/^#+/i, '')).toLowerCase();
                scope._onHashChange(url);
            };

            this.lastHash = '';
            this.lastFullHash = '';
            this.isChangeHash = false; //hash是否发生变化
        },
        init: function(opts) {
            console.log('app init');
            //为属性赋值
            opts = opts || {};
            for(var k in opts) {
                this[k] = opts[k];
            }
            this.createViewPort();
            this.bindEvent(); //事件绑定
        },

        //创建app页面基本框架，此处不能使用id
        createViewPort: function() {
            var htm = [
                '<div class="main-frame">',
                    '<div class="main-viewport"></div>',
                    '<div class="main-state"></div>',
                '</div>'
            ].join('');
            this.mainFrame = $(htm);

            this.viewPort = this.mainFrame.find('.main-viewport');
            this.stateDom = this.mainFrame.find('.main-state');
            var body = $('body');
            body.html('');
            body.append(this.mainFrame);
        },

        //important
        bindEvent: function() {
            var scope = this;
            requirejs.onError = function(e) {
                if(e && e.requireModules) {
                    for(var i = 0; i < e.requireModules.length; i++) {
                        console.error((e.requireModules[i] || '').replace(self.viewRootPath, '') + '页面不存在！');
                    }
                }
            }
            $(window).bind('hashchange', this.onHashChange)
        },
        _onHashChange: function(url) {
            url = url.replace('/^#+/i', '');
            var req = this.parseHash(url);

            this.request = req;
            this.viewPath = this.viewPath || this.defaultView;
            this.loadView(this.viewPath); //加载视图
        },
        parseHash: function(hash) {
            var fullhash = hash,
                hash = hash.replace(/([^\|]*)(?:\|.*)?$/img, '$1'),
                h = /^([^?&|]*)(.*)?$/i.exec(hash),
                vp = h[1] ? h[1].split('!') : [],
                viewpath = (vp.shift() || '').replace(/(^\/+|\/+$)/i, ''),
                path = vp.length ? vp.join('!').replace(/(^\/+|\/+$)/i, '').split('/') : [],
                q = (h[2] || '').replace(/^\?*/i, '').split('&'),
                query = {}, y;
            this.isChangeHash = !!(!this.lashHash && fullhash === this.lastFullHash) || !!(this.lastHash && this.lastHash !== hash);
            if(q) {
                for(var i = 0;i < q.length; i++) {
                    if(q[i]) {
                        y = q[i].split('=');
                        y[1] ? (query[y[0]] = y[1]) : (query[y[0]] = true);
                    }
                }
            }

            this.lastHash = hash;
            this.lastFullHash = fullhash;
            return {
                viewpath: viewpath,
                path: path,
                query: query,
                root: location.pathname + location.search
            };
        },
        loadView: function(viewPath) {
            var id = viewPath;
            var scope = this;
            var path = this.buildUrl(viewPath);

            requirejs([path], function (pageView) {
                var view = new pageView();
                view.show();
                scope.viewPort.append(view.root);
            });
        },
        buildUrl: function(path) {
            return this.viewRoot + path;
        }
    });
    return Application;
});