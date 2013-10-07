var fs = require('fs');
var path = require('path');

var async = require('async');
var program = require('commander');
var funkit = require('funkit');
var merge = funkit.common.merge;


function ioscript(o) {
    if(!o.transform) quit('Your IO script is missing transform function');

    if(!o.limit) o.limit = 10000;

    program.
        version(o.version).
        option('-i --input <input>', 'input (file/directory)').
        option('-o --output <output>', 'output (file/directory)').
        option('-s --silent', 'silent').
        option('-E --expression <expression>', 'regex based on which to filter input').
        option('-v --invert', 'invert regex result').
        parse(o.args);

    if(!program.input) quit('Missing input');
    if(!program.output) quit('Missing output');

    main(merge(program, o), program.input, program.output);
}

var fileQueue;

function main(o, input, output) {
    fileQueue = async.queue(function(task, cb) {
        processFile(o, task.input, task.output, cb);
    }, o.limit);

    processFn(o, input, output, function(err) {
        if(err) console.error(err);
    });
}

function processDirectory(o, input, output, cb) {
    var dir = path.basename(input);

    if(isHidden(dir)) return cb();

    mkdir(output, function() {
        fs.readdir(input, function(err, files) {
            files.forEach(function(file) {
                processFn(o, path.join(input, file), path.join(output, file), cb);
            });
        }, cb);
    });
}

function processFn(o, input, output, cb) {
    fs.stat(input, function(err, stats) {
        if(!stats) return cb('Missing input!');
        if(stats.isDirectory()) processDirectory(o, input, output, cb);
        if(stats.isFile()) fileQueue.push({input: input, output: output});
    });
}

function mkdir(out, cb) {
    fs.exists(out, function(exists) {
        if(exists) cb();
        else fs.mkdir(out, cb);
    });
}

function processFile(o, input, output, cb) {
    cb = cb || noop;

    var file = path.basename(input);

    if(isHidden(file)) return cb();

    if(o.expression) {
        var matches = file.match(new RegExp(o.expression));

        if(o.invert && matches && matches.length > 0) return cb();
        else if(!o.invert && !matches) return cb();
    }

    if(o.reader) o.reader(input, function(err, d) {
        if(err) return cb('Failed to read ' + input);

        write(o, input, output, o.transform(d), cb);
    });
    else o.transform(o, input, output, file, cb);
}

function isHidden(p) {
    return (/^\./).test(p);
}

function write(o, input, output, data, cb) {
    if(!o.writer) return cb();

    var target = output.split('.').slice(0, -1).join('.') + '.' + o.outputExtension;

    o.writer(target, data, function(err, d) {
        if(err) return cb('Failed to write at ' + target);
        if(!o.silent) console.log('Wrote ' + target);

        cb();
    });
}

function quit(msg) {
    console.log(msg);

    process.exit();
}

function noop() {}

module.exports = ioscript;
