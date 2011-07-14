var path = require('path');

module.exports = {
    // name: 'new',
    // plugin: 'app',
    // docs: 'docs/cli/'+CMD+'.md',
    // syntax: CMD+' path',
    
    summary: 'create a new Direct application in <path>.',
    
    execute: function(args) {
        if (! args.length) throw new Error('no project directory specified');
        var from = path.join(__dirname, '../../../framework/app');
        var to = args[0];

        console.log('Creating new project in:\n  '+to);
        
// XXX
//         copyDirTree({}, from, to, function(e) {
// if (e) throw e;            
//             console.log('\nProject created! To get started:');
//             console.log('  direct app:run '+to+'\n');
//         });
require('child_process').exec(['cp -rv', from, to].join(' '), function(err, sout, serr) {
    // sout.pipe(require('sys').stdout);
    // serr.pipe(require('sys').stderr);
    console.log('stdout', sout);
    console.log('stderr', serr);
    if (err) {
        throw err;
    }
})
// XXX

    }
}
