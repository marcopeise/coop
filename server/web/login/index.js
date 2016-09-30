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
        path: '/login',
        handler: function (request, reply) {

            return reply.view('index',{
                message: ''
            });

        }
    });


    next();
};
/*internals.applyRoutes = function (server, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.',
        allowAbsolutePaths: true,
        allowInsecureAccess: true
    });

    server.route({
        method: 'POST',
        path: '/profil',
        config: {
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        },

        handler: function (request, reply) {

            console.log("Login Request");
            //console.log(request.payload);

            var options ={
                method: 'POST',
                url: '/api/login',
                payload: {
                    username: request.payload.username,
                    password: request.payload.password
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
                    console.log("User: ", response.result.user.email);
                    //request.session = response.result.session;
                    //request.authHeader = response.result.authHeader;
                    if (request.params.glob !== 'logout' &&
                        request.auth.isAuthenticated) {

                        if (request.auth.credentials.user.roles.admin) {
                            return reply.redirect('/admin');
                        }

                        return reply.redirect('/coop3000');
                    }

                    const response = reply.view('index',{
                        username:   response.result.user.username,
                        email:      response.result.user.email,
                        mobile:     response.result.user.mobile,
                        town:       response.result.user.town
                    });

                    response.header('x-auth-required', true);
                }
            });
        }
    });


    next();
};*/

exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};

exports.register.attributes = {
    name: 'web/login'
};
