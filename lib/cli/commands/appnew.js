var fs = require('fs')
  , fspath = require('path')
  , dust = require('dust');
  
// ------------------------------------------------------------------------

var BASE = fspath.join(__dirname, '../../framework/app');

// ------------------------------------------------------------------------

// Disable whitespace compression.
dust.optimizers.format = function(context, node) {
    return node;
};

// Enable template loading from disk
dust.onLoad = function(name, cb) {
    fs.readFile(name, 'utf-8', function(err, data) {
        cb(err, data);
    });
};

// ------------------------------------------------------------------------

module.exports = {
    // name: 'new',
    // plugin: 'app',
    // docs: 'docs/cli/'+CMD+'.md',
    // syntax: CMD+' path',
    
    summary: 'create a new Direct application in <path>.',
    
    execute: function(args) {
        if (! args.length) throw new Error('no project directory specified');
        var from = fspath.join(__dirname, '../../../framework/app');
        var to = args[0];

        if (fspath.existsSync(to)) throw new Error('target already exists: '+to);
        console.log('Creating new project in:\n  '+to);
        
// // XXX
// require('child_process').exec(['cp -rv', from, to].join(' '), function(err, sout, serr) {
//     // sout.pipe(require('sys').stdout);
//     // serr.pipe(require('sys').stderr);
//     console.log('stdout', sout);
//     console.log('stderr', serr);
//     if (err) {
//         throw err;
//     }
// })
// // XXX

        rcopy(from, to, function(err) {
            
        })
    }
};

// ------------------------------------------------------------------------

// ------------------------------------------------------------------------

function ensureDir(path, cb) {
    fs.mkdir(path, '0755', function(err) {
        cb(err);
    })
}

function copy(from, to, cb) {
    var ctx = {
        path: to,
        dir : fspath.dirname(to),
        file: fspath.basename(to)
    };
    
    dust.render(from, ctx, function(err, out) {
        fs.writeFile(to, out, function(err) {
            cb(err);
        })
    });
}

function rcopy(from, to, cb) {
    var dir = fspath.dirname(from)
      , file = fspath.basename(from)
    
    fs.stat(from, function(err, stats) {
        if (err) return cb(err);
    
        if (stats.isDirectory()) {
            ensureDir(to, function(err) {
                if (err) return cb(err);

                fs.readdir(from, function(err, files) {
                    if (err) return cb(err);
            
                    files.forEach(function(file) {
                        rcopy(fspath.join(from, file), fspath.join(to, file), cb);
                    });
                });
            });
        } else {
            copy(from, to, function(err) {
                return cb(err);
            });
        }
    });
}

// ------------------------------------------------------------------------
