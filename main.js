require.config({
    shim: {
        $: {
            exports: '$'
        }
    },
    paths: {
        '$': 'libs/jquery.min',
        'b': 'common/core',
        'app': 'controller/app'
    }
});

require(['app'], function(APP) {
    new APP();
});