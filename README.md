# metalsmith-browser-sync
A [Metalsmith](https://github.com/segmentio/metalsmith) plugin to make your workflow easier (using [BrowserSync](https://github.com/BrowserSync/browser-sync)).

[![Build Status][travis-image]][travis-url]

## Installation

    $ npm install metalsmith-browser-sync

## Example

  Pass `options` to the BrowserSync plugin and pass it to Metalsmith with the `use` method:

```js
var browserSync = require('metalsmith-browser-sync');

metalsmith.use(browserSync({
                    server : "myBuildDirectory",
                    files  : ["src/**/*.md", "templates/**/*.hbs"]
              }));
```

The default options are:

```js
var defaultOpts = {
    server     : "build",
    files      : ["src/**/*.md", "templates/**/*.hbs"]
}
```

Note: you can pass any options you could normally pass to [BrowserSync](https://github.com/BrowserSync/browser-sync)

## License
MIT - [view the full license here] (LICENSE)

[travis-url]: https://travis-ci.org/mdvorscak/metalsmith-browser-sync
[travis-image]: https://travis-ci.org/mdvorscak/metalsmith-browser-sync.svg?branch=master