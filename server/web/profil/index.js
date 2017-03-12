'use strict';
const internals = {};
const Moment = require('moment');
Moment.locale('de');

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

            //console.log("Login Request");
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
                //console.log("response: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
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
        method: 'GET',
        path: '/profil',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            },
        },
        handler: function (request, reply) {

            //console.log("XXX", request.auth.credentials);

            var options ={
                method: 'GET',
                url: '/api/users/my',
                payload: {
                },
                credentials: request.auth.credentials
            };

            server.inject(options, function(response){
                //console.log("response: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    //console.log("User: ", response.result);
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
        method: 'POST',
        path: '/updateMyProfile',
        config: {
            auth: {
                strategy: 'session',
                scope: 'account'
            },
        },
        handler: function (request, reply) {

            //console.log('updateMyProfile POST, ', request.auth.credentials.user);
            //console.log('ID: ', request.payload.id);
            //console.log('idhelper: ', request.payload.idhelper);

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

            return reply.view('coopid',{
                auth:       JSON.stringify(request.auth),
                session:    JSON.stringify(request.session),
                isLoggedIn: request.auth.isAuthenticated
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/verbinden01',
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
        },handler: function (request, reply) {

            //console.log('/verbinden01 POST, ', request.auth.credentials);
            //console.log('search: ', request.payload.coopid);

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
                    //console.log("User found: ", response.result);

                    return reply.view('verbinden',{
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
        method: 'POST',
        path: '/verbinden02',
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
        },handler: function (request, reply) {

            //console.log('/verbinden02 POST, ', request.auth.credentials);
            //console.log('useroneid: ', request.payload.useroneid);
            //console.log('useronecoopid: ', request.payload.useronecoopid);
            //console.log('usertwoid: ', request.payload.usertwoid);

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
                    //console.log("User Two found: ", usertworesponse.result);

                    //console.log('useroneid: ', request.payload.useroneid);
                    //console.log('useroneusername: ', request.payload.useroneusername);

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
                            //console.log("Connnection done: ", connectionOneResponse.result);

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
                                         auth:          JSON.stringify(request.auth),
                                         session:       JSON.stringify(request.session),
                                         isLoggedIn:    request.auth.isAuthenticated,
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

    server.route({
        method: 'GET',
        path: '/follow',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            },
        },
        handler: function (request, reply) {

            console.log("payload", request.query);
            var message = '';

            var options ={
                method: 'GET',
                url: '/api/users/my',
                payload: {
                },
                credentials: request.auth.credentials
            };

            server.inject(options, function(response){
                //console.log("response: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("User: ", response.result);

                    if(request.query != undefined && request.query.message !== undefined){
                        message =  request.query.message;
                    }

                    return reply.view('follow',{
                        message:    message,
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.username,
                        follows:    response.result.follows,
                        followedBy: response.result.followedBy,
                        moment:     Moment
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/follow',
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

            console.log('Profil POST follow, ', request.auth.credentials.user);
            console.log('search: ', request.payload);
            function confirmFollowing(request, response) {
                console.log("User found: ", response.result);
                return reply.view('confirmfollow', {
                    auth:           JSON.stringify(request.auth),
                    session:        JSON.stringify(request.session),
                    isLoggedIn:     request.auth.isAuthenticated,
                    followsUser:    response.result
                });
            }

            if(request.payload.coopid){
                var options ={
                    method: 'GET',
                    url: '/api/coopid/' + request.payload.coopid,
                    payload: {
                    }
                };

                server.inject(options, function(response){
                    console.log("response GET /coopid/id: ", response.result);
                    if(response.result.statusCode){
                        if(response.result.statusCode){
                            return reply.redirect('/follow?message='+ response.result.message);
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        return confirmFollowing(request, response);
                    }
                });
            }else if(request.payload.email){
                var options ={
                    method: 'GET',
                    url: '/api/email/' + request.payload.email,
                    payload: {
                    }
                };

                server.inject(options, function(response){
                    console.log("response GET /email/email: ", response.result);
                    //console.log("response.result.message: ", response.result.message);
                    if(response.result.statusCode){
                        if(response.result.statusCode){
                            request.session.message = response.result.message;
                            return reply.redirect('/follow');
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        return confirmFollowing(request, response);
                    }
                });
            }else{
                var options ={
                    method: 'GET',
                    url: '/api/username/' + request.payload.username,
                    payload: {
                    }
                };

                server.inject(options, function(response){
                    console.log("response GET /username/username: ", response.result);
                    //console.log("response.result.message: ", response.result.message);
                    if(response.result.statusCode){
                        if(response.result.statusCode){
                            request.session.message = response.result.message;
                            return reply.redirect('/follow');
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        return confirmFollowing(request, response);
                    }
                });
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/confirmfollow',
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
        },handler: function (request, reply) {

            console.log('wants to follow: ', request.payload.followsUser);
            console.log('user requesting: ', request.auth.credentials.user._id);

            // if user wants to follow to himself -> not allowed
            if(request.payload.followsUser == request.auth.credentials.user._id){
                return reply.redirect('/follow?message=Ein Saugnapf an sich selbst zu heften macht keinen Sinn.');
            }

            var options ={
                method: 'PUT',
                url: '/api/follow',
                payload: {
                    followsUser:    request.payload.followsUser,
                    isUser:         request.auth.credentials.user._id
                }
            };

            server.inject(options, function(usertworesponse) {
                console.log("usertworesponse GET /coopid/id: ", usertworesponse.result);
                if (usertworesponse.result.statusCode) {
                    if (usertworesponse.result.statusCode == 400) {
                        return reply.view('../login/index', {
                            message: usertworesponse.result.message
                        });
                    } else {
                        return reply.redirect('/404');
                    }
                } else {
                    return reply.redirect('/follow?message=Erfolgreich angehangen');
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/deletefollow',
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
        }, handler: function (request, reply) {

            console.log('POST /deletefollow payload: ', request.payload);
            console.log('user requesting: ', request.auth.credentials.user._id);

            var options ={
                method: 'DELETE',
                url: '/api/unfollow',
                payload: {
                    followsUser:    request.payload.followsUser,
                    isUser:         request.auth.credentials.user._id
                }
            };

            server.inject(options, function(usertworesponse) {
                console.log("usertworesponse GET /coopid/id: ", usertworesponse.result);
                return reply.redirect('/follow?message=Dein Saugnapf wurde erfolgreich entfernt.');
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/coops',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            //console.log("XXX", request.auth.credentials);

            var options ={
                method: 'GET',
                url: '/api/users/my',
                payload: {
                },
                credentials: request.auth.credentials
            };

            server.inject(options, function(response){
                //console.log("response: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("User: ", response.result);

                    var verknExtended, altersvorsorge, sozialakademie, knappenbar, gemuesefond, gluecklichtage, paybackpele = '';
                    var walzer, diskofox, chachacha, wienerwalzer, swing, rumba, foxtrott, blues = '';

                    if(response.result.verknExtended){verknExtended = 'checked'}
                    if(response.result.altersvorsorge){altersvorsorge = 'checked'}
                    if(response.result.sozialakademie){sozialakademie = 'checked'}
                    if(response.result.knappenbar){knappenbar = 'checked'}
                    if(response.result.gemuesefond){gemuesefond = 'checked'}
                    if(response.result.gluecklichtage){gluecklichtage = 'checked'}
                    if(response.result.paybackpele){paybackpele = 'checked'}

                    if(response.result.walzer){walzer = 'checked'}
                    if(response.result.diskofox){diskofox = 'checked'}
                    if(response.result.chachacha){chachacha = 'checked'}
                    if(response.result.wienerwalzer){wienerwalzer = 'checked'}
                    if(response.result.swing){swing = 'checked'}
                    if(response.result.rumba){rumba = 'checked'}
                    if(response.result.foxtrott){foxtrott = 'checked'}
                    if(response.result.blues){blues = 'checked'}

                    var options ={
                        method: 'GET',
                        url: '/api/events',
                        payload: {
                        },
                        credentials: request.auth.credentials
                    };

                    server.inject(options, function(eventResponse) {
                        //console.log("eventResponse: ", eventResponse.result);
                        if (eventResponse.result.statusCode) {
                            if (eventResponse.result.statusCode == 400) {
                                return reply.view('../login/index', {
                                    message: eventResponse.result.message
                                });
                            } else {
                                return reply.redirect('/404');
                            }
                        } else {
                            console.log("Events: ", eventResponse.result.data);

                            return reply.view('coops', {
                                auth: JSON.stringify(request.auth),
                                session: JSON.stringify(request.session),
                                isLoggedIn: request.auth.isAuthenticated,
                                username: response.result.username,
                                email: response.result.email,
                                mobile: response.result.mobile,
                                town: response.result.town,
                                coopid: response.result.coopid,
                                id: response.result._id,
                                verknExtended: verknExtended,
                                altersvorsorge: altersvorsorge,
                                sozialakademie: sozialakademie,
                                knappenbar: knappenbar,
                                gemuesefond: gemuesefond,
                                gluecklichtage: gluecklichtage,
                                paybackpele: paybackpele,
                                walzer: walzer,
                                diskofox: diskofox,
                                chachacha: chachacha,
                                wienerwalzer: wienerwalzer,
                                swing: swing,
                                rumba: rumba,
                                foxtrott: foxtrott,
                                blues: blues,
                                events: eventResponse.result.data
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