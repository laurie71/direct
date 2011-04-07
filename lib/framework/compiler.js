// XXX

/*!
 * Connect - compiler
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
 
var error = require('../errors');
var utils = require('../util');

// var ParseError = utils.inherit(error.SourceError, {
//     // constructor: function(file, line, col, msg, err) {
//     //     error.SourceError.call(this, file, line, col, msg, err);
//     // }
// });

// var LessParseError = utils.inherit(ParseError, {
//     constructor: function(source) {
//         ParseError.call(this, source.filename, source.line, source.column, source);
//         this._captureStack(arguments.callee);
//     }
// });


/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , parse = require('url').parse;

/**
 * Require cache.
 */

var cache = {};

/**
 * Setup compiler.
 *
 * Options:
 *
 *   - `src`     Source directory, defaults to **CWD**.
 *   - `dest`    Destination directory, defaults `src`.
 *   - `enable`  Array of enabled compilers.
 *
 * Compilers:
 *
 *   - `sass`   Compiles cass to css
 *   - `less`   Compiles less to css
 *   - `coffeescript`   Compiles coffee to js
 *
 * @param {Object} options
 * @api public
 */

exports = module.exports = function compiler(options){
  options = options || {};

  var srcDir = options.src || process.cwd()
    , destDir = options.dest || srcDir
    , enable = options.enable;

  if (!enable || enable.length === 0) {
    throw new Error('compiler\'s "enable" option is not set, nothing will be compiled.');
  }

  return function compiler(req, res, next){
    if ('GET' != req.method) return next();
    var pathname = parse(req.url).pathname;
    for (var i = 0, len = enable.length; i < len; ++i) {
      var name = enable[i]
        , compiler = compilers[name];
      if (compiler.match.test(pathname)) {
        var src = (srcDir + pathname).replace(compiler.match, compiler.ext)
          , dest = destDir + pathname;

        // Compare mtimes
        fs.stat(src, function(err, srcStats){
          if (err) {
            if ('ENOENT' == err.code) {
              next();
            } else {
              next(err);
            }
          } else {
            fs.stat(dest, function(err, destStats){
              if (err) {
                // Oh snap! it does not exist, compile it
                if ('ENOENT' == err.code) {
                  compile();
                } else {
                  next(err);
                }
              } else {
                // Source has changed, compile it
                if (srcStats.mtime > destStats.mtime) {
                  compile();
                } else {
                  // Defer file serving
                  next();
                }
              }
            });
          }
        });

        // Compile to the destination
        function compile() {
          fs.readFile(src, 'utf8', function(err, str){
            if (err) {
console.log('COMPILE ERR on readFile',err);
              next(err);
            } else {
              compiler.compile(str, { filename: src }, function(err, str){
                if (err) {
console.log('COMPILE ERR on compile',err);
                  next(err);
                } else {
                  fs.writeFile(dest, str, 'utf8', function(err){
if (err) console.log('COMPILE ERR on write file',err);
                    next(err);
                  });
                }
              });
            }
          });
        }
        return;
      }
    }
    next();
  };
};

/**
 * Bundled compilers:
 *
 *  - [sass](http://github.com/visionmedia/sass.js) to _css_
 *  - [less](http://github.com/cloudhead/less.js) to _css_
 *  - [coffee](http://github.com/jashkenas/coffee-script) to _js_
 */

var compilers = exports.compilers = {
  sass: {
    match: /\.css$/,
    ext: '.sass',
    compile: function(str, opts, fn){
      var sass = cache.sass || (cache.sass = require('sass'));
      try {
        fn(null, sass.render(str));
      } catch (err) {
        fn(err);
      }
    }
  },
  less: {
    match: /\.css$/,
    ext: '.less',
    compile: function(str, opts, fn){
      var less = cache.less || (cache.less = require('less'));
      try {
        less.render(str, opts, function(err, str) {
            if (err) {
// console.log('less error',err.stack);
//                err = new LessParseError(err);
// console.log('wrapped error',err.stack);
                fn(err);
            } else {
                fn(null, str);
            }
        });
      } catch (err) {
        fn(err);
      }
    }
  },
  coffeescript: {
    match: /\.js$/,
    ext: '.coffee',
    compile: function(str, fn){
      var coffee = cache.coffee || (cache.coffee = require('coffee-script'));
      try {
        fn(null, coffee.compile(str));
      } catch (err) {
        fn(err);
      }
    }
  }
};