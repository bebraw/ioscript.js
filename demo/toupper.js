#!/usr/bin/env node
var ioscript = require('../lib/ioscript');

ioscript({
    version: '0.1.0',
    args: process.argv,
    inputExtension: 'txt',
    outputExtension: 'txt',
    transform: function(data) {
        return data.split('/n').map(function(line) {
            return line.toUpperCase();
        }).join('/n');
    }
});

