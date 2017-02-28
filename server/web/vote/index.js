'use strict';
const internals = {};
const Moment = require('moment');

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
        path: '/createvote',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            },
        },
        handler: function (request, reply) {

            //console.log("request.auth registrierung: ", request.auth);
            return reply.view('createvote', {
                auth:       JSON.stringify(request.auth),
                session:    JSON.stringify(request.session),
                isLoggedIn: request.auth.isAuthenticated,
                message:    ''
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/createVote',
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

            console.log("CreateVote Request");
            console.log(request.payload);
            console.log("Auth Request");
            console.log(request.auth.credentials.user._id);
            console.log(request.auth.credentials.user.username);

            var options ={
                method: 'POST',
                url: '/api/votes',
                payload: {
                    title:      request.payload.title,
                    content:    request.payload.content,
                    enddate:    request.payload.enddate,
                    ownerId:    request.auth.credentials.user._id,
                    ownerUsername: request.auth.credentials.user.username
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(createVoteResponse){
                console.log("createVoteResponse: ", createVoteResponse.result);
                if(createVoteResponse.result.statusCode){
                    if(createVoteResponse.result.statusCode){
                        return reply.view('index',{
                            message:   createVoteResponse.result.message,
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("Voting created: ", createVoteResponse.result);


                    return reply.view('success',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        title:          createVoteResponse.result.title,
                        content:        createVoteResponse.result.content,
                        endDate:        Moment(createVoteResponse.result.endDate).format('DD.MM.YYYY'),
                        ownerId:        createVoteResponse.result.ownerId,
                        ownerUsername:  createVoteResponse.result.ownerUsername,
                        timeCreated:    Moment(createVoteResponse.result.timeCreated).format('DD.MM.YYYY'),
                        _id:            createVoteResponse.result._id
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
    name: 'vote'
};