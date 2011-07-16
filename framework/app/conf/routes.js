module.exports = [
    [ 'get',    '/',                                'Application.index' ],
    [ '*',      '/:controller/:action',             '${controller}.${action}' ]
];
