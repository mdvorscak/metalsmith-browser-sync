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

## Options

You can pass any options you could normally pass to [BrowserSync](https://github.com/BrowserSync/browser-sync)

### Files

The files option represents the pattern option of [BrowserSync.watch()](https://browsersync.io/docs/api#api-watch).

### Callback 

You can also pass a callback function, which is called when BrowserSync has completed all setup tasks and is ready to use.
This is useful when you need to wait for information (for example: urls, port etc) or perform other tasks synchronously.

```js
var browserSync = require('metalsmith-browser-sync');

metalsmith.use(browserSync({
                    server : "myBuildDirectory",
                    files  : ["src/**/*.md", "templates/**/*.hbs"]
              }, function (err, bs) {
                  // do some stuff here
              }));
```

## License
MIT - [view the full license here](LICENSE)

[travis-url]: https://travis-ci.org/mdvorscak/metalsmith-browser-sync
[travis-image]: https://travis-ci.org/mdvorscak/metalsmith-browser-sync.svg?branch=master
