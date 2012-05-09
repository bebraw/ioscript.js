var program = require('commander');

function ioscript(o) {
    program.
        version(o.version).
        option('-i --input <input>', 'input (file/directory)').
        option('-o --output <output>', 'output (file/directory)').
        option('-s --silent', 'silent').
        parse(o.args);

    if(!program.input) quit('Missing input');
    if(!program.output) quit('Missing output');
}

function quit(msg) {
    console.log(msg);
    process.exit();
}

module.exports = ioscript;

