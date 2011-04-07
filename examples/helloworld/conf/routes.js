// ------------------------------------------------------------------------
module.exports = [
    ['get', '/',                                'application.index'],
    ['get', '/test',                            'application.test'],
    
    ['get',  '/user',                           'users.index'],
    ['post', '/user',                           'users.create'],
    ['get',  '/user/:id',                       'users.show'],
    ['put',  '/user/:id',                       'users.update'],

    ['*',    '/:controller.:action',            '${controller}.${action}']
];
