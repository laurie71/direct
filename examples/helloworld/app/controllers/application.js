module.exports = {
    index: function(req, res, next) {
        // var e = require('../../../../lib/error');
        // // var err = new e.DirectiveError('test');
        // var err = new e.SourceError('some/file', 99, 9, 'error msg');
        // next(err);
        // 
        // // next(new Error('test error'));
        
        // res.send('BOOYA!')
        
        res.render('index')
    },
    test: function(req, res, next) {
        res.send('test');
    }
};
