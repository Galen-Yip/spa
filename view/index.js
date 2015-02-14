define(['$', 'b'], function($, b) {

    var pageView = b.Class(b.AbstractView, {
        _propertys_: function() {
            this.template = 'Galen'
        },
        init: function(superInit) {
            console.log(superInit);
            console.log('Init');
        },
        createHtml: function() {
            var htm = [
                '<header>标签</header>',
                '<div class="main">',
                    '<input type="text" id="txt" />',
                    '<input type="button" id="btn" value="点击我" />',
                    this.template,
                '</div>',
                '<footer>尾巴</footer>'
            ].join('');
            return htm;
        },
        attrs: {
            'data-id': 'test',
            className: 'rootEl'
        },
        events: {
            '#btn,click': function(el) {
                var txt = this.find('#txt');
                alert(txt.val())
            }
        },
        onCreate: function() {
            console.log('onCreate')
        },
        onLoad: function() {
            console.log('onLoad')
        },
        onShow: function() {
            console.log('onShow')
        },
        onHide: function() {
            console.log('onHide')
        }
    });
    return pageView
})
