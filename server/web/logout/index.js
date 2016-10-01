'use strict';
const Joi = require('joi');
const internals = {};

internals.applyRoutes = function (server, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: 'GET',
        path: '/logout',
        config: {
            auth: 'session',
            handler: function (request, reply) {

                //console.log("Logout Request");

                var options ={
                    method: 'DELETE',
                    url: '/api/logout',
                    payload: {
                    }
                };

                server.inject(options, function(response){
                    console.log("response: ", response.result);
                    if(response.result.statusCode){
                        if(response.result.statusCode == 400){
                            return reply.view('../login/index',{
                                message:   response.result.message
                            });
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        console.log("Logout Result: ", response.result);

                        // clear the session data
                        request.cookieAuth.clear();

                        reply.redirect('/');
                    }
                });



            }
        }
    });


    next();
};

exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};

exports.register.attributes = {
    name: 'web/logout'
};
