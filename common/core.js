/* MVC框架，依赖requirejs、jq、underscore
 ***************************
 */


/*
 *  继承的基础实现
 */

// process
// 1、先初始化一个新的类，最后实例化它的时候，会调用两个方法
// 2、让newClass继承自supClass
// 3、初始化4个变量，显然一开始都是空函数
// 4、将子属性childAttr的值赋给newClass。若没传childAttr则忽略
// 5、由于newClass继承自supClass，如果childAttr中没有传入init方法，这里满足条件.这里会创建类的init函数，在实例化newClass时执行。
//    新增了init方法，不过this指向子类
// 6、_propertys_函数是用于我们为自身的属性赋值
// 7、由于私有属性不会被继承，最后是将父类的成员对象赋值子类
// 8、返回newClass
// end

define(['$'], function($) {

    var b = {}; //base基础
    var slice = [].slice;   //同Array.slice


    //两个参数：需要继承的类；新建类的一些参数
    b.Class = function(supClass, childAttr) {
        //若传了第一个类 就继承 否则实现新类
        if(typeof supClass === 'object') {
            childAttr = supClass;
            supClass = function() {}
        }

        //定义创建的新类
        var newClass = function() {
            this._propertys_();
            this.init.apply(this, arguments)
        };
        newClass.prototype = new supClass();

        var supInit = newClass.prototype.init || function() {};
        var childInit = childAttr.init || function() {};
        var _supAttr = newClass.prototype._propertys_ || function() {};
        var _childAttr = childAttr._propertys_ || function() {};

        for(var k in childAttr) {
            //_propertys中的作为私有属性
            childAttr.hasOwnProperty(k) && (newClass.prototype[k] = childAttr[k]);
        }

        //对于继承而来的属性，第一次要重写init方法
        if(arguments.length && arguments[0].prototype && arguments[0].prototype.init === supInit) {
            //重写新建类的init方法，传入supClass的init方法
            newClass.prototype.init = function() {
                var scope = this;
                var args = [function() {
                    supInit.apply(scope, arguments);
                }];
                childInit.apply(scope, args.concat(slice.call(arguments)));
            }
        }

        //内部属性赋值
        newClass.prototype._propertys_ = function() {
            _supAttr.call(this);
            _childAttr.call(this);
        }

        //成员属性
        for(var k in supClass) {
            supClass.hasOwnProperty(k) && (newClass[k] = supClass[k]);
        }

        return newClass;

    }


    /*
     *  视图的基础实现
     *  视图的父类，用于继承
     */

    b.AbstractView = b.Class({
        //基本view具有的属性
        _propertys_: function() {
            this.id = (new Date()).getTime(); //唯一pageID
            this.rootBox = $('body'); //视图容器
            this.root = $('<div/>');  //视图根元素，可设置
            this.header = null;
            this.footer = null;
            this.template = '';  //模板
            this.isCreated = false;  //是否创建完毕
            this.status = b.AbstractView.STATE_NOTCREATE  //当前视图状态
        },

        init: function() {

        },

        //定义事件，元素选取以root为标准
        events: {
            'selector,eventType': 'func'
        },

        //root的默认属性，会在initRoot中进行初始化
        attrs: {

        },

        //获取视图元素
        find: function(selector) {
            return this.root.find(selector)
        },

        //创建dom
        create: function(opts) {
            if(!this.isCreated && this.status != b.AbstractView.STATE_ONCREATE) {
                var attr = opts && opts.attr;
                var html = this.createHtml();
                this.initRoot(attr);  //初始化root
                this.hide();
                this.rootBox.append(this.root);
                this.root.html(html);
                this.trigger('onCreate'); //触发正在创建事件
                this.status = b.AbstractView.STATE_ONCREATE;
                this.isCreated = true;
                this.bindEvent();
            }
        },

        //呈现、渲染视图
        show: function(callback) {
            if(this.status == b.AbstractView.STATE_ONSHOW) {
                return;
            }
            this.create();
            this.root.show();
            this.trigger('onShow');
            this.status = b.AbstractView.STATE_ONSHOW;
            callback && (typeof callback == 'function') && callback.call(this);
            this.trigger('onLoad');
        },

        //隐藏dom
        hide: function(callback) {
            if(!this.root || this.status == b.AbstractView.STATE_ONHIDE) {
                return;
            }
            this.root.hide();
            this.trigger('onHide');
            this.status = b.AbstractView.STATE_ONHIDE;
            callback && (typeof callback == 'function') && callback();
        },

        //事件绑定
        bindEvent: function() {
            var events = this.events;
            for(var k in events) {
                var sec_type = k.replace(/\s/i, '').split(',');
                var func = events[k];
                if(sec_type && sec_type.length == 2 && typeof func == 'function') {
                    var selector = sec_type[0];
                    var type = sec_type[1];
                    var scope = this;
                    this.find(selector).on(type, function() {
                        func.call(scope, $(this))
                    })
                }
            }
        },

        //此处可以配合模板与相关参数组成html
        //解析模板也可以放在此处
        createHtml: function() {
            throw new Error('请重新定义createHtml方法')
        },

        //初始化根元素的属性等
        initRoot: function() {
            var attr = this.attrs;
            if(!attr) {
                return;
            }
            for(var k in attr) {
                if(k == 'className') {
                    this.root.attr('class', attr[k])
                }else{
                    this.root.attr(k, attr[k])
                }
            }
            this.root.attr('id', this.id)
        },

        //触发事件
        trigger: function(k, args) {
            var event = this[k];
            args = args || [];
            if(event && typeof event == 'function') {
                event.apply(this, args)
            }
        },

        setRootBox: function(dom) {
            this.rootBox = dom
        },

        setAttr: function(k, v) {
            this.root.attr(k, v)
        },

        getAttr: function(k) {
            return this.root.attr(k)
        },

        setCss: function(k, v) {
            this.root.css(k, v)
        },

        getCss: function(k) {
            return this.root.css(k)
        },

        //dom创建后执行
        onCreate: function() {

        },

        //dom创建后数据加载时执行，用于加载后执行我们的逻辑
        onLoad: function() {

        },

        //dom创建后，显示之前
        onShow: function() {

        },

        //dom隐藏前
        onHide: function() {

        }

    });

    //视图状态：未创建
    b.AbstractView.STATE_NOTCREATE = 'notCreate';

    //视图状态：已创建但未显示
    b.AbstractView.STATE_ONCREATE = 'onCreate';

    //视图状态：已显示
    b.AbstractView.STATE_ONSHOW = 'onShow';

    //视图状态：已隐藏
    b.AbstractView.STATE_ONHIDE = 'onHide';


    /*
     *  Hash的基础实现
     */

    //辅助函数
    var indexOf = function(k, arr) {
        if(!arr) {
            return -1;
        }
        if(arr.indexOf) {
            return arr.indexOf(k)
        }
        for(var i = 0, len = arr.length; i < len; i++) {
            if(arr[i] == k) {
                return i
            }
        }
        return -1;
    };


    b.Hash = b.Class({
        _propertys_: function() {
            this.keys = [];
            this.values = [];
        },
        init: function(obj) {
            (typeof obj == 'object') || (obj = {});
            for(var k in obj) {
                if(obj.hasOwnProperty(k)) {
                    this.keys.push(k);
                    this.values.push(obj[k]);
                }
            }
        },
        length: function() {
            return this.keys.length;
        },
        getItem: function(k) {
            var index = indexOf(k, this.keys);
            if(index < 0 ){
                return null
            }
            return this.keys[index];
        },
        getKey: function(i) {
            return this,keys[i]
        },
        getValue: function(i) {
            return this.values[i]
        },
        add: function(k,v) {
            return this.push(k, v)
        },
        del: function(k) {
            var index = indexOf(k, this.keys);
            return this.delByIndex(index)
        },
        delByIndex: function(index) {
            if(index < 0) return this;
            this.keys.splice(index, 1);
            this.values.splice(index, 1);
            return this;
        },
        //移除栈顶hash并返回
        pop: function() {
            if(!this.keys.length) return null;
            this.keys.pop();
            return this.values.pop();
        },
        push: function(k, v, order) {
            if(typeof k == 'object' && !v) {
                for(var i in k) {
                    if(k.hasOwnProperty(i)) {
                        this.push(i, k[i], order);
                    }
                }
            }else{
                var index = indexOf(k, this.keys);
                if(index < 0 || order) {
                    if(order) this.del(k);
                    this.keys.push[k];
                    this.values.push[v]
                }else{
                    this.values[index] = v;
                }
            }
        },

        //查找hash，返回key
        indexOf: function(v) {
            var index = indexOf(v, this.values);
            if(index >= 0) {
                return this.keys[index];
            }
            return -1;
        },
        each: function(handler) {
            if(typeof handler == 'function') {
                for(var i = 0, len = this.length(); i < len; i++) {
                    handler.call(this, this.keys[i], this.values[i])
                }
            }
        },
        getObj: function() {
            var obj = {};
            for(var i = 0,len = this.length(); i < len; i++) {
                obj[this.keys[i]] = this.values[i];
            }
            return obj;
        }
    });

    return b;

});

