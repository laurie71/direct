var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    jqtpl = require('jqtpl');
    
var CMD = path.basename(__filename, '.js');

module.exports = {
    name: 'new',
    plugin: 'app',
    docs: 'docs/cli/'+CMD+'.md',
    syntax: CMD+' path',
    summary: 'create a new Direct application in <path>.',
    action: function(args) {
        if (! args.length) throw new Error('no project directory specified');
        var from = path.join(__dirname, '../../../../framework/template');
        var to = args[0];
        
        console.log('Creating new project in:\n  '+to);
        copyDirTree({}, from, to, function(e) {
if (e) throw e;            
            console.log('\nProject created! To get started:');
            console.log('  direct app:run '+to+'\n');
        });
    }
}

function debug(msg) {
    util.debug(msg);
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
    // fs.readdir(src, function(err, files) {
var err=null, files = fs.readdirSync(src);
debug('copying...'+files);
        if (err) return error(cb, err);
        for (var i = 0, ilen = files.length; i < ilen; i++) {
            var file = files[i];
            // debug(' - src/'+file+' ('+path.join(src,file)+')');
            copyFile(data, path.join(src, file), path.join(dst, file), cb);
        }
    // });
}

function copyFile(data, src, dst, cb) {
    // debug(' * copyFile: '+JSON.stringify(arguments));
    // fs.stat(src+'x', function(err, stats) {
var err=null,stats=fs.statSync(src);
        if (err) return error(cb, err);
        if (stats.isDirectory()) {
            return copyDirTree(data, src, dst, cb);
        }
        // debug('copy file '+src+' -> '+dst);
        loadSource();
    // });
    
    function loadSource() {
// debug('load source');
        // fs.readFile(src, 'utf-8', function(err, data) {
// debug('async read');
var err=null,data=fs.readFileSync(src, 'utf-8');
            if (err) return error(cb, err);
            writeDest(data);
        // });
    }
    
    function writeDest(source) {
try {
        var output = jqtpl.tmpl(source, data);
} catch (e) { 
    debug(e.stack);
    throw(e);
}
fs.writeFileSync(dst, output, 'utf-8');
//         fs.writeFile(dst, output, 'utf-8', function(err) {
// debug('async write');
            // if (err) return error(cb, err);
//         })
    }
}
