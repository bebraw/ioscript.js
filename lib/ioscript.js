var program = require('commander');
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

    // TODO: might be nicer to use proper merge here
    main({
        input: program.input,
        output: program.output,
        silent: program.silent,
        transform: o.transform,
        inputExtension: o.inputExtension,
        outputExtension: o.outputExtension
    });
}

function main(o) {
    if(!path.existsSync(o.output)) fs.mkdirSync(o.output);

    var stats = fs.statSync(o.input);
    if(stats.isDirectory()) processDirectory(o);
    if(stats.isFile()) processFile(o, o.input);
}

function processDirectory(o) {
    fs.readdirSync(o.input).forEach(function(file) {
        var p = path.join(o.input, file);
        var stats = fs.statSync(p);

        if(stats.isDirectory()) processDirectory(o);
        if(stats.isFile()) processFile(o, p);
    });
}

function processFile(o, input) {
    write(o, o.transform(fs.readFileSync(input, 'utf-8')));
}

function write(o, data) {
    // TODO: eliminate trailing slash from input and output
    // TODO: allow .ext too
    var target = path.join(o.output,
        path.basename(o.input, '.' + o.inputExtension)) + '.' + o.outputExtension;
    fs.writeFileSync(target, data);

    if(!o.silent) console.log('Wrote ' + target);
}

function quit(msg) {
    console.log(msg);
    process.exit();
}

module.exports = ioscript;

