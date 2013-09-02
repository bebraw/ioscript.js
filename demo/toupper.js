#!/usr/bin/env node
var fs = require('fs');
var ioscript = require('../lib/ioscript');

ioscript({
    version: '0.1.0',
    args: process.argv,
    inputExtension: 'txt',
    outputExtension: 'txt',
    reader: function(input, cb) {
        fs.readFile(input, {
            encoding: 'utf-8'
        }, cb);
    },
    writer: fs.writeFile,
    transform: function(data) {
        return data.split('/n').map(function(line) {
            return line.toUpperCase();
        }).join('/n');
    }
});

