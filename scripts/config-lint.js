module.exports = {
    root: __dirname + '/../',
    pathIgnore: ['*node_modules*']
};

var options = {
    adsafe: false,
    bitwise: false,
    browser: true,
    cap: false,
    css: false,
    debug: false,
    devel: true,
    eqeqeq: true,
    evil: true,
    forin: false,
    fragment: false,
    immed: false,
    indent: 4,
    laxbreak: true,
    maxerr: 300,
    maxlen: 600,
    nomen: false,
    newcap: true,
    node: true, // jslint.com has an option for node, but the node module is not up to date yet
    on: true,
    onevar: true,
    passfail: false,
    plusplus: false,
    predef: ['util', 'require', 'process', 'exports', 'escape', '__dirname', 'setTimeout'],
    regexp: false,
    rhino: false,
    safe: false,
    strict: true,
    sub: false,
    undef: true,
    white: true,
    widget: false,
    windows: false
};

