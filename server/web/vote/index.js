'use strict';
const internals = {};
const Moment = require('moment');
Moment.locale('de');

internals.applyRoutes = function (server, next) {

    const User = server.plugins['hapi-mongo-models'].User;

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

            var endDate = Moment.utc(request.payload.enddate, 'DD.MM.YYYY');

            /*console.log("CreateVote Request");
            console.log(request.payload);
            console.log("Enddate: ", request.payload.enddate);
            console.log("endDate: ", endDate);
            console.log("Auth Request");
            console.log(request.auth.credentials.user._id);
            console.log(request.auth.credentials.user.username);*/

            var options ={
                method: 'POST',
                url: '/api/votes',
                payload: {
                    title:      request.payload.title,
                    content:    request.payload.content,
                    enddate:    endDate,
                    ownerId:    request.auth.credentials.user._id,
                    ownerUsername: request.auth.credentials.user.username
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(createVoteResponse){
                //console.log("createVoteResponse: ", createVoteResponse.result);
                if(createVoteResponse.result.statusCode){
                    if(createVoteResponse.result.statusCode){
                        return reply.view('../login/index',{
                            message:   response.result.message
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
                        return reply.view('../login/index',{
                            message:   response.result.message
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
                            //console.log("votepos");
                            nrVoters = nrVoters + voteList[i].votespos.length;
                        }
                        if (voteList[i].votesneg != undefined) {
                            //console.log("votesneg");
                            nrVoters = nrVoters + voteList[i].votesneg.length;
                        }
                        voteList[i].nrVoters = nrVoters;
                        //console.log("nrVoters: ", voteList[i].nrVoters);
                    }

                    var pastVoteList = [];
                    var activeVoteList = [];
                    var recentVoteList = [];

                    // get specific list of votes
                    for (var i = 0; i < voteList.length; i++) {
                        //console.log("isBefore today: ", Moment(voteList[i].endDate).isBefore(new Date()));
                        // get past Votes moment('today').isBefore('endDate');
                        if (Moment(voteList[i].endDate).isBefore(new Date())) {
                            //console.log("vote is already done");
                            pastVoteList.push(voteList[i]);
                        }else{
                            //console.log("vote is still active");
                            activeVoteList.push(voteList[i]);
                        }
                        //get recent vote
                        if (voteList[i].comments != undefined && voteList[i].comments.length > 0) {
                            var commentList = [];
                            //console.log("last comment created: ", voteList[i].comments[voteList[i].comments.length-1].timeCreated);
                            recentVoteList.push(voteList[i]);
                        }
                    }

                    pastVoteList.sort(function(a, b) {
                        a = a.endDate;
                        b = b.endDate;
                        return a>b ? -1 : a<b ? 1 : 0;
                    });

                    activeVoteList.sort(function(a, b) {
                        a = a.endDate;
                        b = b.endDate;
                        return a<b ? -1 : a>b ? 1 : 0;
                    });

                    recentVoteList.sort(function(a, b) {
                        a = a.comments[a.comments.length-1].timeCreated;
                        b = b.comments[b.comments.length-1].timeCreated;
                        return a>b ? -1 : a<b ? 1 : 0;
                    });

                    console.log("pastVoteList: ", pastVoteList.length);
                    //console.log("pastVoteList print: ", pastVoteList);
                    console.log("activeVoteList: ", activeVoteList.length);
                    //console.log("activeVoteList print: ", activeVoteList);
                    console.log("recentVoteList: ", recentVoteList.length);

                    return reply.view('listvotes',{
                        auth:           JSON.stringify(request.auth),
                        session:        JSON.stringify(request.session),
                        isLoggedIn:     request.auth.isAuthenticated,
                        voteList:       getVotesResponse.result.data,
                        pastVoteList:   pastVoteList,
                        activeVoteList: activeVoteList,
                        recentVoteList: recentVoteList,
                        moment:         Moment
                    });
                }
            });
        }
    });

    function getNrOfVoters(getVoteResponse, request, notvoted) {
        var nrVoters = 0;
        var vote = "DAGEGEN";
        if (getVoteResponse.result.votespos != undefined) {
            //console.log("getVoteResponse.result.votespos.length: ", getVoteResponse.result.votespos.length);
            nrVoters = nrVoters + getVoteResponse.result.votespos.length;

            for (var i = 0; i < getVoteResponse.result.votespos.length; i++) {
                //console.log("comparison: ", getVoteResponse.result.votespos[i].id);
                //console.log(request.auth.credentials.user._id);

                if (getVoteResponse.result.votespos[i].id == request.auth.credentials.user._id) {
                    notvoted = false;
                    vote = "DAFÜR";
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
        return {nrVoters: nrVoters, notvoted: notvoted, vote: vote};
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
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("getVoteResponse: ", getVoteResponse.result);

                    // check if user is admin
                    const id = request.auth.credentials.user._id.toString();
                    const fields = User.fieldsAdapter('roles');

                    User.findById(id, fields, (err, user) => {

                        if (err) {
                            return reply(err);
                        }

                        if (!user) {
                            return reply(Boom.notFound('Document not found. That is strange.'));
                        }

                        //console.log("user: ", user);
                        var currentUser = user;
                        console.log("currentUser: ", currentUser);
                        // check if user is admin
                        var isAdmin = false;
                        if(currentUser.roles.admin != undefined){
                            isAdmin = true;
                        }

                        // check if user is ownerOfVote
                        var isOwner = false;
                        if(request.auth.credentials.user._id == getVoteResponse.result.ownerId ){
                            isOwner = true;
                        }

                        // check if current user has already voted for this vote
                        var notvoted = true;

                        // amount of voters already
                        var __ret = getNrOfVoters(getVoteResponse, request, notvoted);
                        var nrVoters = __ret.nrVoters;
                        notvoted = __ret.notvoted;
                        var vote = __ret.vote;

                        return reply.view('showvote',{
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            notvoted:   notvoted,
                            nrVoters:   nrVoters,
                            ownvote:    vote,
                            isLoggedIn: request.auth.isAuthenticated,
                            isAdmin:    isAdmin,
                            isOwner:    isOwner,
                            vote:       getVoteResponse.result,
                            moment:     Moment
                        });
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
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("postVoteResponse: ", postVoteResponse.result);

                    return reply.redirect('/getvote/' + request.params.id);

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
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("postVoteResponse: ", postVoteResponse.result);

                    return reply.redirect('/getvote/' + request.params.id);

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
            console.log("comment: ", request.payload.comment);

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
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("postCommentVoteResponse: ", postCommentVoteResponse.result);

                    return reply.redirect('/getvote/' + request.params.id);

                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/deletevote/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("POST Delete Vote");
            console.log("vote id: ", request.params.id);

            var options ={
                method: 'DELETE',
                url: '/api/deletevote/' + request.params.id,
                payload: {
                    voteOwnerId:     request.payload.voteOwnerId,
                    currentUserId:   request.auth.credentials.user._id
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(postDeleteVoteResponse){
                //console.log("postDeleteVoteResponse: ", postDeleteVoteResponse.result);
                if(postDeleteVoteResponse.result.statusCode){
                    if(postDeleteVoteResponse.result.statusCode){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("postDeleteVoteResponse: ", postDeleteVoteResponse.result);

                    return reply.redirect('/listvotes');
                }
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/editvotemode/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("GET Edit Vote");
            console.log("vote id: ", request.params.id);
            console.log("payload: ", request.payload);

            var endDate = new Date(request.payload.voteEndDate).toISOString();

            return reply.view('editvote', {
                auth:               JSON.stringify(request.auth),
                session:            JSON.stringify(request.session),
                isLoggedIn:         request.auth.isAuthenticated,
                message:            '',
                voteId:             request.params.id,
                voteOwnerId:        request.payload.voteOwnerId,
                currentUserId:      request.auth.credentials.user._id,
                voteTitle:          request.payload.voteTitle,
                voteContent:        request.payload.voteContent,
                voteEndDate:        Moment(endDate).format('YYYY-MM-DD')
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/editVote/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: ['user', 'admin', 'account']
            }
        },
        handler: function (request, reply) {

            console.log("POST Edit Vote");
            console.log("vote id: ", request.params.id);
            //console.log("payload: ", request.payload);

            //var from = request.payload.voteEndDate.split("-");
            //var voteEndDate = new Date(from[2], from[1] - 1, from[0]);
            var endDate = Moment.utc(request.payload.voteEndDate, 'DD.MM.YYYY');

            var options ={
                method: 'PUT',
                url: '/api/editvote/' + request.params.id,
                payload: {
                    voteOwnerId:        request.payload.voteOwnerId,
                    currentUserId:      request.auth.credentials.user._id,
                    voteTitle:          request.payload.voteTitle,
                    voteContent:        request.payload.voteContent,
                    voteEndDate:        endDate
                }
            };

            //console.log("BEFORE server.inject: ", options);
            server.inject(options, function(putEditVoteResponse){
                //console.log("putEditVoteResponse: ", putEditVoteResponse.result);
                if(putEditVoteResponse.result.statusCode){
                    if(putEditVoteResponse.result.statusCode){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("putEditVoteResponse: ", putEditVoteResponse.result);

                    return reply.redirect('/getvote/' + request.params.id);
                }
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/votingperiod',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            //console.log('Admin GET votingperiod, ', request.auth.credentials.user);
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

                    return reply.view('votingperiods',{
                        auth:           JSON.stringify(request.auth),
                        session:        JSON.stringify(request.session),
                        isLoggedIn:     request.auth.isAuthenticated,
                        updatemessage:  message,
                        followsHistory: response.result.followsHistory,
                        follows:        response.result.follows,
                        moment:         Moment
                    });
                }
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/votingperiod',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            console.log('Admin POST votingperiod, ', request.auth.credentials.user);

            var options ={
                method: 'POST',
                url: '/api/users/newvotingperiod',
                payload: {
                }
            };

            server.inject(options, function(createVotingPeriodResponse) {
                console.log("createVotingPeriodResponse: ", createVotingPeriodResponse.result);

                if(createVotingPeriodResponse.result.statusCode){
                    if(createVotingPeriodResponse.result.statusCode){
                        request.session.message = createVotingPeriodResponse.result.message;
                        return reply.redirect('/events');
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    return reply.redirect('/votingperiod?updatemessage='+ createVotingPeriodResponse.result.message);

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