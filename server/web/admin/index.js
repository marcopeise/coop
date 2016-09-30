'use strict';

const internals = {};

internals.applyRoutes = function (server, next) {

    server.views({
        engines: {ejs: require('ejs')},
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: 'GET',
        path: '/admin',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
        },
        handler: function (request, reply) {

            console.log('Admin GET, ', request.auth.credentials.user);
            //console.log('hello, ' + request.auth.credentials.user.User.username);
            return reply.view('index');

        },
    });

    server.route({
        method: 'POST',
        path: '/admin',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
        },
        handler: function (request, reply) {

            console.log('Admin POST, ', request.auth.credentials.user);
            console.log('search: ', request.payload.coopid);

            var options ={
                method: 'GET',
                url: '/api/coopid/' + request.payload.coopid,
                payload: {
                }
            };

            server.inject(options, function(response){
                //console.log("response GET /coopid/id: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("User found: ", response.result);
                    if(!response.result.verknExtended){
                        response.result.verknExtended = false
                    }
                    return reply.view('adminprofil',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.username,
                        email:      response.result.email,
                        mobile:     response.result.mobile,
                        town:       response.result.town,
                        coopid:     response.result.coopid,
                        id:         response.result._id,
                        verknExtendedValue: response.result.verknExtended
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/updateProfile',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
        },
        handler: function (request, reply) {

            console.log('Update Profile POST, ', request.auth.credentials.user);
            console.log('ID: ', request.payload.id);
            console.log('idhelper: ', request.payload.idhelper);
            console.log('verknExtended: ', request.payload.verknExtended);

            var options ={
                method: 'PUT',
                url: '/api/users/' + request.payload.id,
                payload: {
                    username:   request.payload.username,
                    email:      request.payload.email,
                    mobile:     request.payload.mobile,
                    town:       request.payload.town,
                    coopid:     request.payload.idhelper,
                    isActive:   true,
                    verknExtended: request.payload.verknExtended
                }
            };

            server.inject(options, function(response){
                //console.log("response GET /coopid/id: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("User updated: ", response.result);

                    return reply.view('index',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.username,
                        email:      response.result.email,
                        mobile:     response.result.mobile,
                        town:       response.result.town,
                        coopid:     response.result.coopid,
                        verknExtended: response.result.verknExtended
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
    name: 'admin'
};
