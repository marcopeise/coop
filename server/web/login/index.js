'use strict';
const Joi = require('joi');
const internals = {};

internals.applyRoutes = function (server, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.',
        allowAbsolutePaths: true,
        allowInsecureAccess: true
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

    server.route({
        method: 'GET',
        path: '/forgot',
        handler: function (request, reply) {

            return reply.view('forgot',{
                message: ''
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/forgot',
        handler: function (request, reply) {

            console.log('POST forgot: ', request.payload);

            var options ={
                method: 'POST',
                url: '/api/login/forgot',
                payload: {
                    email:    request.payload.email
                }
            };

            server.inject(options, function(forgotResponse) {
                //console.log("forgotResponse POST: ", forgotResponse.result);
                return reply.view('forgot',{
                    message: 'Eine E-Mail ist auf dem Weg zu Dir.'
                });
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/reset/{user*2}',
        handler: function (request, reply) {

            const userParts = request.params.user.split('/');
            //console.log('GET reset userParts[0]: ', userParts[0]);
            //console.log('GET reset userParts[1]: ', userParts[1]);

            return reply.view('reset',{
                message: '',
                email: userParts[0],
                key: userParts[1]
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/reset',
        handler: function (request, reply) {

            //console.log('POST reset: ', request.payload);

            var options ={
                method: 'POST',
                url: '/api/login/reset',
                payload: {
                    email:      request.payload.email,
                    key:        request.payload.key,
                    password:   request.payload.password
                }
            };

            server.inject(options, function(forgotResponse) {
                //console.log("forgotResponse POST: ", forgotResponse.result);

                var options ={
                    method: 'POST',
                    url: '/api/login',
                    payload: {
                        username: request.payload.email,
                        password: request.payload.password
                    }
                };

                server.inject(options, function(response){
                    //console.log("response: ", response.result);
                    if(response.result.statusCode){
                        if(response.result.statusCode == 400){
                            return reply.view('index',{
                                message:   response.result.message
                            });
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        //console.log("User: ", response.result.user.email);

                        request.cookieAuth.set(response.result);
                        //request.auth.credentials = response.result;

                        //console.log("request.cookieAuth: ", request.cookieAuth);
                        //console.log("request.auth: ", request.auth);
                        //console.log("request.auth.isAuthenticated: ", request.auth.isAuthenticated);
                        return reply.view('../profil/index',{
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated,
                            username:   response.result.user.username,
                            email:      response.result.user.email,
                            mobile:     response.result.user.mobile,
                            town:       response.result.user.town,
                            coopid:     response.result.user.coopid,
                            id:         response.result.user._id,
                            verknExtended: response.result.user.verknExtended,
                            altersvorsorge: response.result.user.altersvorsorge,
                            sozialakademie: response.result.user.sozialakademie,
                            knappenbar: response.result.user.knappenbar,
                            gemuesefond: response.result.user.gemuesefond,
                            gluecklichtage: response.result.user.gluecklichtage,
                            paybackpele: response.result.user.paybackpele,
                            walzer: response.result.user.walzer,
                            diskofox: response.result.user.diskofox,
                            chachacha: response.result.user.chachacha,
                            wienerwalzer: response.result.user.wienerwalzer,
                            swing: response.result.user.swing,
                            rumba: response.result.user.rumba,
                            foxtrott: response.result.user.foxtrott,
                            blues: response.result.user.blues
                        });
                    }
                });
            });

        }
    });

    next();
};

exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};

exports.register.attributes = {
    name: 'web/login'
};
