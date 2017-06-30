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
                    /*return reply.view('index',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.user.username,
                        email:      response.result.user.email,
                        mobile:     response.result.user.mobile,
                        town:       response.result.user.town,
                        coopid:     response.result.user.coopid,
                        description:response.result.user.description,
                        avatar:     response.result.user.avatar,
                        id:         response.result.user._id
                    });*/
                    reply.redirect('/listvotes');
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
                        description:response.result.description,
                        avatar:     response.result.avatar,
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
                scope: ['admin', 'account']
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
                    description:request.payload.description,
                    avatar:     request.payload.avatar,
                    isActive:   true,
                    isAdmin:    false
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
                        description:response.result.description,
                        avatar:     response.result.avatar,
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
                        description:response.result.description,
                        avatar:     response.result.avatar,
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
                    if(usertworesponse.result==true){
                        return reply.redirect('/follow?message=Erfolgreich angehangen');
                    }else{
                        return reply.redirect('/follow?message=Dieser COOP3000 Nutzer ist inaktiv und folgt selbst einem anderen. Bitte suche Dir einen aktiven Teilnehmer.');
                    }
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

    server.route({
        method: 'GET',
        path: '/voteactivity',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("GET voteactivity");
            console.log("user._id: ", request.auth.credentials.user._id);

            var options ={
                method: 'GET',
                url: '/api/votes',
                payload: {
                    sort    : '_id',
                    limit   : 200,
                    page    : 1
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(getVotesResponse){
                //console.log("getVotesResponse: ", getVotesResponse.result);
                if(getVotesResponse.result.statusCode){
                    if(getVotesResponse.result.statusCode){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{

                    //console.log("data: ", getVotesResponse.result.data);
                    //console.log("get first Vote title: ", getVotesResponse.result.data[0].title);
                    //console.log("get first Vote _id: ", getVotesResponse.result.data[0]._id);
                    var voteList = getVotesResponse.result.data;
                    //console.log("voteList: ", voteList);

                    var userIsOwnerList = [];
                    var userIsVotingList = [];
                    var userIsCommentingList = [];

                    //var tempArray1 = JSON.parse(JSON.stringify(voteList));
                    //var tempArray2 = JSON.parse(JSON.stringify(voteList));
                    //var tempArray3 = JSON.parse(JSON.stringify(voteList));

                    //get only those votes where user is either owner, votes or makes a comment
                    for (var i = 0; i < voteList.length; i++) {
                        //console.log("vote: ", voteList[i]);
                        // user is owner
                        if (voteList[i].ownerId==request.auth.credentials.user._id) {
                            //console.log("user is owner");
                            userIsOwnerList.push(voteList[i]);
                        }
                        // user is voting
                        loop1:
                            if(voteList[i].votespos != undefined && voteList[i].votespos.length>0){
                                for (var k = 0; k < voteList[i].votespos.length; k++) {
                                    if (voteList[i].votespos[k].id == request.auth.credentials.user._id) {
                                        //console.log("user is voting pos");
                                        voteList[i].voting="DAFÜR";
                                        userIsVotingList.push(voteList[i]);
                                        break loop1;
                                    }
                                }
                            }
                        loop2:
                            if(voteList[i].votesneg != undefined && voteList[i].votesneg.length>0){
                                for (var l = 0; l < voteList[i].votesneg.length; l++) {
                                    //console.log("negativId: ", voteList[i].votesneg[l].id);
                                    //console.log("request.auth.credentials.user._id: ", request.auth.credentials.user._id);
                                    if (voteList[i].votesneg[l].id == request.auth.credentials.user._id) {
                                        //console.log("user is voting neg");
                                        voteList[i].voting="DAGEGEN";
                                        userIsVotingList.push(voteList[i]);
                                        break loop2;
                                    }
                                }
                            }

                        // user is commenting
                        if(voteList[i].comments != undefined && voteList[i].comments.length>0){
                            var commentList = [];
                            for (var m = 0; m < voteList[i].comments.length; m++) {
                                if (voteList[i].comments[m].id == request.auth.credentials.user._id) {
                                    //console.log("user is commenting");
                                    commentList.push(voteList[i].comments[m]);
                                    voteList[i].commentList = commentList;
                                    //console.log("pushing voteList[i]: ", voteList[i]);
                                }
                            }
                            if(commentList.length>0){
                                //console.log("pushing voteList[i]: ", voteList[i]);
                                userIsCommentingList.push(voteList[i]);
                            }
                        }
                    }

                    console.log("userIsOwnerList: ", userIsOwnerList.length);
                    console.log("userIsVotingList: ", userIsVotingList.length);
                    console.log("userIsCommentingList: ", userIsCommentingList.length);

                    return reply.view('voteactivity',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        userIsOwnerList:        userIsOwnerList,
                        userIsVotingList:       userIsVotingList,
                        userIsCommentingList:   userIsCommentingList,
                        moment:                 Moment
                    });
                }
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/search',
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

                    return reply.view('search',{
                        message:    message,
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.username,
                        moment:     Moment
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/search',
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
            function foundUser(request, response) {
                console.log("User found: ", response.result);
                return reply.view('founduser', {
                    auth:           JSON.stringify(request.auth),
                    session:        JSON.stringify(request.session),
                    isLoggedIn:     request.auth.isAuthenticated,
                    foundUser:      response.result
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
                        return foundUser(request, response);
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
                        return foundUser(request, response);
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
    name: 'profil'
};