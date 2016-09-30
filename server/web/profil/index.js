'use strict';
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

                    request.cookieAuth.set(response.result);
                    //request.auth.credentials = response.result;

                    //console.log("request.cookieAuth: ", request.cookieAuth);
                    console.log("request.auth: ", request.auth);
                    console.log("request.auth.isAuthenticated: ", request.auth.isAuthenticated);
                    return reply.view('index',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.user.username,
                        email:      response.result.user.email,
                        mobile:     response.result.user.mobile,
                        town:       response.result.user.town,
                        coopid:     response.result.user.coopid,
                        id:         response.result.user._id
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/updateMyProfile',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
        },
        handler: function (request, reply) {

            console.log('updateMyProfile POST, ', request.auth.credentials.user);
            console.log('ID: ', request.payload.id);
            console.log('idhelper: ', request.payload.idhelper);

            var options ={
                method: 'PUT',
                url: '/api/users/' + request.payload.id,
                payload: {
                    username:   request.payload.username,
                    email:      request.payload.email,
                    mobile:     request.payload.mobile,
                    town:       request.payload.town,
                    coopid:     request.payload.idhelper,
                    isActive:   true
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
                        id:         response.result._id
                    });
                }
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/verbinden',
        handler: function (request, reply) {

            return reply.view('coopid');
        }
    });

    server.route({
        method: 'POST',
        path: '/verbinden01',
        handler: function (request, reply) {

            console.log('/verbinden01 POST, ', request.auth.credentials);
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

                    return reply.view('verbinden',{
                        username:   response.result.username,
                        email:      response.result.email,
                        mobile:     response.result.mobile,
                        town:       response.result.town,
                        coopid:     response.result.coopid,
                        id:         response.result._id
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/verbinden02',
        handler: function (request, reply) {

            console.log('/verbinden02 POST, ', request.auth.credentials);
            console.log('useroneid: ', request.payload.useroneid);
            console.log('useronecoopid: ', request.payload.useronecoopid);
            console.log('usertwoid: ', request.payload.usertwoid);

            var options ={
                method: 'GET',
                url: '/api/coopid/' + request.payload.usertwoid,
                payload: {
                }
            };

            server.inject(options, function(usertworesponse) {
                //console.log("usertworesponse GET /coopid/id: ", usertworesponse.result);
                if (usertworesponse.result.statusCode) {
                    if (usertworesponse.result.statusCode == 400) {
                        return reply.view('../login/index', {
                            message: usertworesponse.result.message
                        });
                    } else {
                        return reply.redirect('/404');
                    }
                } else {
                    console.log("User Two found: ", usertworesponse.result);

                    console.log('useroneid: ', request.payload.useroneid);
                    console.log('useroneusername: ', request.payload.useroneusername);

                    var connectionoptions = {
                        method: 'PUT',
                        url: '/api/connect/' + usertworesponse.result._id,
                        payload: {
                            useroneid: request.payload.useroneid,
                            useroneusername: request.payload.useroneusername
                        }
                    };

                    server.inject(connectionoptions, function (connectionOneResponse) {
                        //console.log("connectionOneResponse GET /coopid/id: ", connectionOneResponse.result);
                        if (connectionOneResponse.result.statusCode) {
                            if (connectionOneResponse.result.statusCode == 400) {
                                return reply.view('../login/index', {
                                    message: connectionOneResponse.result.message
                                });
                            } else {
                                return reply.redirect('/404');
                            }
                        } else {
                            console.log("Connnection done: ", connectionOneResponse.result);

                            // zweite verbindung
                            var connectionTwoOptions = {
                                method: 'PUT',
                                url: '/api/connect/' + request.payload.useroneid,
                                payload: {
                                    useroneid: usertworesponse.result._id,
                                    useroneusername: usertworesponse.result.username
                                }
                            };

                            server.inject(connectionTwoOptions, function (connectionTwoResponse) {
                                //console.log("connectionTwoResponse GET /coopid/id: ", connectionTwoResponse.result);
                                if (connectionTwoResponse.result.statusCode) {
                                    if (connectionTwoResponse.result.statusCode == 400) {
                                        return reply.view('../login/index', {
                                            message: connectionTwoResponse.result.message
                                        });
                                    } else {
                                        return reply.redirect('/404');
                                    }
                                } else {
                                    console.log("Connnection Two done: ", connectionTwoResponse.result);
                                     return reply.view('verbunden',{
                                     usernameOne:   request.payload.useroneusername,
                                     userOneId:     request.payload.useronecoopid,
                                     usernameTwo:   usertworesponse.result.username,
                                     userTwoId:      usertworesponse.result.coopid

                                     });
                                }
                            });
                        }
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
    name: 'profil'
};