this.basic = {
    variable: function (test) {
        var tpl = swig.fromString('{{ foobar }}', 'foo');
        test.strictEqual(tpl.render({ foobar: 'hi!' }), 'hi!');
        test.done();
    },

    'variable with filter': function (test) {
        var tpl = swig.fromString('{{ foobar|title }}');
        test.strictEqual(tpl.render({ foobar: 'oh hey tHere' }), 'Oh Hey There');
        test.done();
    }
};
