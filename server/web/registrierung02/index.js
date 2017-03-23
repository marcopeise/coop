'use strict';

const internals = {};

internals.applyRoutes = function (server, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: 'GET',
        path: '/registrierung02',
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

            //console.log("request.auth registrierung02: ", request.auth);
            return reply.view('index', {
                auth:       JSON.stringify(request.auth),
                session:    JSON.stringify(request.session),
                isLoggedIn: request.auth.isAuthenticated,
                message:    ''
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/register',
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

            console.log("Register Request");
            console.log(request.payload);

            var options ={
                method: 'POST',
                url: '/api/signup',
                payload: {
                    username: request.payload.username,
                    email: request.payload.email,
                    mobile: request.payload.mobile,
                    town: request.payload.town,
                    name: request.payload.name,
                    avatar: request.payload.avatar
                }
            };

            server.inject(options, function(registerResponse){
                console.log("registerResponse: ", registerResponse.result);
                if(registerResponse.result.statusCode){
                    if(registerResponse.result.statusCode){
                        return reply.view('index',{
                            message:   registerResponse.result.message,
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("Registered: ", registerResponse.result.user.email);

                    request.cookieAuth.set(registerResponse.result);
                    //request.auth.credentials = response.result;

                    //console.log("request.cookieAuth: ", request.cookieAuth);
                    //console.log("request.auth: ", request.auth);
                    //console.log("request.auth.isAuthenticated: ", request.auth.isAuthenticated);
                    return reply.view('success',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   registerResponse.result.user.username,
                        email:      registerResponse.result.user.email,
                        mobile:     registerResponse.result.user.mobile,
                        town:       registerResponse.result.user.town,
                        coopid:     registerResponse.result.user.coopid,
                        id:         registerResponse.result.user._id,
                        coopid:     registerResponse.result.user.coopid,
                        avatar:     registerResponse.result.user.avatar
                    });
                }
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
    name: 'registrierung02'
};
