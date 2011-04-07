var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    jqtpl = require('jqtpl');
    
var CMD = path.basename(__filename, '.js');

module.exports = {
    name: CMD,
    docs: 'docs/cli/'+CMD+'.md',
    syntax: CMD+' path',
    summary: 'create a new Direct application in directory "path".',
    action: function(args) {
        if (! args.length) throw new Error('no project directory specified');
        var from = path.join(__dirname, '../../../framework/template');
        var to = args[0];
        
        console.log('Creating new project in: '+to);
        copyDirTree({}, from, to);
    }
}

function debug(msg) {
    //util.debug(msg);
}

function error(cb, e) {
    if (typeof(e) === 'string') {
        e = new Error(e);
    }
    if (! cb) {
        console.error(e);
    }
    cb && cb(e);
}

function mkdir(dir) {
    if (! path.existsSync(dir)) {
        mkdir(path.dirname(dir));
        debug(' - mkdir '+dir);
        fs.mkdirSync(dir, 0775);
    }
}
    
function copyDirTree(data, src, dst, cb) {
    debug('copy dir '+src+' -> '+dst);
    mkdir(dst);
    fs.readdir(src, function(err, files) {
        if (err) return error(cb, err);
        for (var i = 0, ilen = files.length; i < ilen; i++) {
            var file = files[i];
            debug(' - src/'+file+' ('+path.join(src,file)+')');
            copyFile(data, path.join(src, file), path.join(dst, file), cb);
        }
    })
}

function copyFile(data, src, dst, cb) {
//    debug(' * copyFile: '+JSON.stringify(arguments));
    fs.stat(src, function(err, stats) {
        if (err) return error(cb, err);
        if (stats.isDirectory()) {
            return copyDirTree(data, src, dst, cb);
        }
        debug('copy file '+src+' -> '+dst);
        loadSource();
    });
    
    function loadSource() {
        fs.readFile(src, 'utf-8', function(err, data) {
            if (err) return error(cb, err);
            writeDest(data);
        });
    }
    
    function writeDest(source) {
        var output = jqtpl.tmpl(source, data);
        fs.writeFile(dst, output, 'utf-8', function(err) {
            if (err) return error(cb, err);
        })
    }
}
