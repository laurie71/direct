// {path}

module.exports = {
    index: function(ctx) {//req, res, next) {
        ctx.response.end('Welcome to {DIRECT}');
    }
}
