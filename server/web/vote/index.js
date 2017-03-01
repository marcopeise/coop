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

            /*console.log("CreateVote Request");
            console.log(request.payload);
            console.log("Auth Request");
            console.log(request.auth.credentials.user._id);
            console.log(request.auth.credentials.user.username);*/

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
                //console.log("createVoteResponse: ", createVoteResponse.result);
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

    server.route({
        method: 'GET',
        path: '/listvotes',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("GET Votes");
            console.log("user._id: ", request.auth.credentials.user._id);
            console.log("user.username: ", request.auth.credentials.user.username);

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
                        return reply.view('index',{
                            message:   getVotesResponse.result.message,
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    //console.log("getVotesResponse: ", getVotesResponse.result);
                    //console.log("data: ", getVotesResponse.result.data);
                    //console.log("get first Vote title: ", getVotesResponse.result.data[0].title);
                    //console.log("get first Vote _id: ", getVotesResponse.result.data[0]._id);
                    var voteList = getVotesResponse.result.data;

                    //calculate nr of participants
                    for (var i = 0; i < voteList.length; i++) {
                        var nrVoters = 0;
                        //console.log("votepos: ", voteList[i].votespos);
                        if (voteList[i].votespos != undefined) {
                            console.log("votepos");
                            nrVoters = nrVoters + voteList[i].votespos.length;
                        }
                        if (voteList[i].votesneg != undefined) {
                            console.log("votesneg");
                            nrVoters = nrVoters + voteList[i].votesneg.length;
                        }
                        voteList[i].nrVoters = nrVoters;
                        console.log("nrVoters: ", voteList[i].nrVoters);
                    }

                    return reply.view('listvotes',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        voteList:   getVotesResponse.result.data,
                        moment:     Moment
                    });
                }
            });
        }
    });

    function getNrOfVoters(getVoteResponse, request, notvoted) {
        var nrVoters = 0;
        if (getVoteResponse.result.votespos != undefined) {
            //console.log("getVoteResponse.result.votespos.length: ", getVoteResponse.result.votespos.length);
            nrVoters = nrVoters + getVoteResponse.result.votespos.length;

            for (var i = 0; i < getVoteResponse.result.votespos.length; i++) {
                //console.log("comparison: ", getVoteResponse.result.votespos[i].id);
                //console.log(request.auth.credentials.user._id);

                if (getVoteResponse.result.votespos[i].id == request.auth.credentials.user._id) {
                    notvoted = false;
                    //console.log("FOUND");
                }
            }

        }
        if (getVoteResponse.result.votesneg != undefined) {
            //console.log("getVoteResponse.result.votesneg.length: ", getVoteResponse.result.votesneg.length);
            nrVoters = nrVoters + getVoteResponse.result.votesneg.length;

            for (var i = 0; i < getVoteResponse.result.votesneg.length; i++) {
                if (getVoteResponse.result.votesneg[i].id == request.auth.credentials.user._id) {
                    notvoted = false;
                }
            }
        }
        return {nrVoters: nrVoters, notvoted: notvoted};
    }

    server.route({
        method: 'GET',
        path: '/getvote/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("GET Vote");
            console.log("vote id: ", request.params.id);

            var options ={
                method: 'GET',
                url: '/api/votes/' + request.params.id
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(getVoteResponse){
                //console.log("getVoteResponse: ", getVoteResponse.result);
                if(getVoteResponse.result.statusCode){
                    if(getVoteResponse.result.statusCode){
                        return reply.view('index',{
                            message:   getVoteResponse.result.message,
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("getVoteResponse: ", getVoteResponse.result);

                    // check if current user has already voted for this vote
                    var notvoted = true;

                    // amount of voters already
                    var __ret = getNrOfVoters(getVoteResponse, request, notvoted);
                    var nrVoters = __ret.nrVoters;
                    notvoted = __ret.notvoted;

                    return reply.view('showvote',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        notvoted:   notvoted,
                        nrVoters:   nrVoters,
                        isLoggedIn: request.auth.isAuthenticated,
                        vote:       getVoteResponse.result,
                        moment:     Moment
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/voteplus/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("POST Vote plus");
            console.log("vote id: ", request.params.id);

            var options ={
                method: 'POST',
                url: '/api/voting/' + request.params.id,
                payload: {
                    ownerId:        request.auth.credentials.user._id,
                    ownerUsername:  request.auth.credentials.user.username,
                    decision:       'plus'
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(postVoteResponse){
                //console.log("postVoteResponse: ", postVoteResponse.result);
                if(postVoteResponse.result.statusCode){
                    if(postVoteResponse.result.statusCode){
                        return reply.view('index',{
                            message:   postVoteResponse.result.message,
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("postVoteResponse: ", postVoteResponse.result);

                    // check if current user has already voted for this vote
                    var notvoted = true;

                    // amount of voters already
                    var __ret = getNrOfVoters(postVoteResponse, request, notvoted);
                    var nrVoters = __ret.nrVoters;
                    notvoted = __ret.notvoted;

                    return reply.view('showvote',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        notvoted:   notvoted,
                        nrVoters:   nrVoters,
                        isLoggedIn: request.auth.isAuthenticated,
                        vote:       postVoteResponse.result,
                        moment:     Moment
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/voteminus/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("POST Vote minus");
            console.log("vote id: ", request.params.id);

            var options ={
                method: 'POST',
                url: '/api/voting/' + request.params.id,
                payload: {
                    ownerId:        request.auth.credentials.user._id,
                    ownerUsername:  request.auth.credentials.user.username,
                    decision:       'minus'
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(postVoteResponse){
                //console.log("postVoteResponse: ", postVoteResponse.result);
                if(postVoteResponse.result.statusCode){
                    if(postVoteResponse.result.statusCode){
                        return reply.view('index',{
                            message:   postVoteResponse.result.message,
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("postVoteResponse: ", postVoteResponse.result);

                    // check if current user has already voted for this vote
                    var notvoted = true;

                    // amount of voters already
                    var __ret = getNrOfVoters(postVoteResponse, request, notvoted);
                    var nrVoters = __ret.nrVoters;
                    notvoted = __ret.notvoted;

                    return reply.view('showvote',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        notvoted:   notvoted,
                        nrVoters:   nrVoters,
                        isLoggedIn: request.auth.isAuthenticated,
                        vote:       postVoteResponse.result,
                        moment:     Moment
                    });
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/commentvote/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("POST comment Vote");
            console.log("vote id: ", request.params.id);

            var options ={
                method: 'POST',
                url: '/api/commentvoting/' + request.params.id,
                payload: {
                    commentOwnerId:         request.auth.credentials.user._id,
                    commentOwnerUsername:   request.auth.credentials.user.username,
                    comment:                request.payload.comment
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(postCommentVoteResponse){
                //console.log("postCommentVoteResponse: ", postCommentVoteResponse.result);
                if(postCommentVoteResponse.result.statusCode){
                    if(postCommentVoteResponse.result.statusCode){
                        return reply.view('index',{
                            message:   postCommentVoteResponse.result.message,
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("postCommentVoteResponse: ", postCommentVoteResponse.result);

                    // check if current user has already voted for this vote
                    var notvoted = true;

                    // amount of voters already
                    var __ret = getNrOfVoters(postCommentVoteResponse, request, notvoted);
                    var nrVoters = __ret.nrVoters;
                    notvoted = __ret.notvoted;

                    return reply.view('showvote',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        notvoted:   notvoted,
                        nrVoters:   nrVoters,
                        isLoggedIn: request.auth.isAuthenticated,
                        vote:       postCommentVoteResponse.result,
                        moment:     Moment
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