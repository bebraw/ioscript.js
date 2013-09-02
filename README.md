# ioscript.js - Tiny utility for writing IO scripts

ioscript.js makes it easy to write IO scripts. Just define what to do with the provided input and how to output it.

By default it provides the script these parameters:

* -i, --input <input> - The input (either file or directory)
* -o, --output <output> - The output (either file or directory)
* -s, --silent - The script remains silent (no visual output)
* -h, --help - Shows help
* -V, --version - Shows version
* -E, --expression - Regex based on which to filter iput
* -v --invert - Inverts Regex result

It is possible to define your own parameters if you want to.

In order to use the library, check out the demo within the package. [png2ico](https://github.com/bebraw/png2ico) provides a real life example that uses ImageMagick to transform input.

## License

ioscript.js is available under MIT. See LICENSE for more details.
