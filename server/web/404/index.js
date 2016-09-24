'use strict';


exports.register = function (server, options, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: '*',
        path: '/{p*}',
        handler: function (request, reply) {

            return reply.view('index').code(404);
            return reply.view('index').code(400);
        }
    });


    next();
};


exports.register.attributes = {
    name: '404'
};
