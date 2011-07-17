// {path}

module.exports = {
    index: function(req, res, next) {
        this.response.end('Welcome to {DIRECT}');
    }
}
