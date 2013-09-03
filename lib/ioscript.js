var fs = require('fs');
var path = require('path');

var program = require('commander');
var funkit = require('funkit');
var merge = funkit.common.merge;
var rtrim = funkit.string.rtrim;


function ioscript(o) {
    if(!o.transform) quit('Your IO script is missing transform function');

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

function main(o, input, output) {
    fs.exists(output, function(exists) {
        if(exists) process(o, input, output);
        else fs.mkdir(output, process.bind(null, o, input, output));
    });
}

function process(o, input, output) {
    fs.stat(input, function(err, stats) {
        if(stats.isDirectory()) processDirectory(o, input, output);
        if(stats.isFile()) processFile(o, input, output);
    });
}

function processDirectory(o, input, output) {
    fs.readdir(input, function(err, files) {
        files.forEach(function(file) {
            var p = path.join(input, file);

            fs.stat(p, function(err, stats) {
                if(stats.isDirectory()) {
                    var outDir = path.join(output, file);

                    fs.exists(outDir, function(exists) {
                        if(exists) processDirectory(o, p, outDir);
                        else fs.mkdir(outDir, processDirectory.bind(null, o, p, outDir));
                    });
                }
                if(stats.isFile()) processFile(o, p, output);
            });
        });
    });
}

function processFile(o, input, output) {
    var file = path.basename(input);

    if(o.expression) {
        var matches = file.match(new RegExp(o.expression));

        if(o.invert && matches && matches.length > 0) return;
        else if(!o.invert && !matches) return;
    }

    if(o.reader) o.reader(input, function(err, d) {
        if(err) return console.error('Failed to read', input);

        write(o, input, output, o.transform(d));
    });
    else o.transform(input, output, file);
}

function write(o, input, output, data) {
    if(!o.writer) return;

    var target = path.join(rtrim('/', output),
        path.basename(rtrim('/', input), '.' +
                      o.inputExtension)) + '.' +
                      o.outputExtension;

    o.writer(target, data, function(err, d) {
        if(err) return console.error('Failed to write', target);

        if(!o.silent) console.log('Wrote ' + target);
    });
}

function quit(msg) {
    console.log(msg);
    process.exit();
}

module.exports = ioscript;

