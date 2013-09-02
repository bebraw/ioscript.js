var program = require('commander');
var funkit = require('funkit');
var path = require('path');
var fs = require('fs');

function ioscript(o) {
    if(!o.inputExtension) quit('Your IO script is missing input extension');
    if(!o.outputExtension) quit('Your IO script is missing output extension');
    if(!o.transform) quit('Your IO script is missing transform function');

    program.
        version(o.version).
        option('-i --input <input>', 'input (file/directory)').
        option('-o --output <output>', 'output (file/directory)').
        option('-s --silent', 'silent').
        parse(o.args);

    if(!program.input) quit('Missing input');
    if(!program.output) quit('Missing output');

    main(funkit.merge(program, o), program.input, program.output);
}

function main(o, input, output) {
    if(!fs.existsSync(output)) fs.mkdirSync(output);

    var stats = fs.statSync(input);
    if(stats.isDirectory()) processDirectory(o, input, output);
    if(stats.isFile()) processFile(o, input, output);
}

function processDirectory(o, input, output) {
    fs.readdirSync(input).forEach(function(file) {
        var p = path.join(input, file);
        var stats = fs.statSync(p);

        if(stats.isDirectory()) {
            var outDir = path.join(output, file);
            if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);

            processDirectory(o, p, outDir);
        }
        if(stats.isFile()) processFile(o, p, output);
    });
}

function processFile(o, input, output) {
    if(o.reader) o.reader(input, function(err, d) {
        if(err) return console.error('Failed to read', err);

        write(o, input, output, o.transform(d));
    });
    else o.transform(input);
}

function write(o, input, output, data) {
    if(!o.writer) return;

    var target = path.join(funkit.rtrim(output, '/'),
        path.basename(funkit.rtrim(input, '/'), '.' +
                      o.inputExtension)) + '.' +
                      o.outputExtension;

    o.writer(target, data, function(err, d) {
        if(err) return console.error('Failed to write', err);

        if(!o.silent) console.log('Wrote ' + target);
    });
}

function quit(msg) {
    console.log(msg);
    process.exit();
}

module.exports = ioscript;

