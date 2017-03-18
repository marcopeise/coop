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
        path: '/profile/{id}',
        config: {
        },
        handler: function (request, reply) {

            //console.log("XXX", request.auth.credentials);

            var options ={
                method: 'GET',
                url: '/api/user/public/'+request.params.id,
                payload: {
                },
            };

            server.inject(options, function(response){
                //console.log("response: ", response.result);
                if(response.result.statusCode){
                    return reply.redirect('/404');
                }else{
                    //console.log("User: ", response.result);
                    return reply.view('index',{
                        username:   response.result.username,
                        town:       response.result.town,
                        coopid:     response.result.coopid,
                        description:response.result.description,
                        id:         request.params.id
                    });
                }
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/following/{id}',
        config: {
        },
        handler: function (request, reply) {

            //console.log("payload", request.query);
            var message = '';

            var options ={
                method: 'GET',
                url: '/api/user/public/'+request.params.id,
                payload: {
                },
            };

            server.inject(options, function(response){
                //console.log("response: ", response.result);
                if(response.result.statusCode){
                  return reply.redirect('/404');
                }else{
                    //console.log("User: ", response.result);

                    if(request.query != undefined && request.query.message !== undefined){
                        message =  request.query.message;
                    }

                    return reply.view('follow',{
                        id:         request.params.id,
                        follows:    response.result.follows,
                        followedBy: response.result.followedBy,
                        moment:     Moment
                    });
                }
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/coops/{id}',
        config: {
        },
        handler: function (request, reply) {

            //console.log("XXX", request.params.id);

            var options ={
                method: 'GET',
                url: '/api/user/public/'+request.params.id,
                payload: {
                },
            };

            server.inject(options, function(response){
                //console.log("response: ", response.result);
                if(response.result.statusCode){
                    return reply.redirect('/404');
                }else{
                    //console.log("User: ", response.result);

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
                    };

                    server.inject(options, function(eventResponse) {
                        //console.log("eventResponse: ", eventResponse.result);
                        if (eventResponse.result.statusCode) {
                            return reply.redirect('/404');
                        } else {
                            //console.log("Events: ", eventResponse.result.data);

                            return reply.view('coops', {
                                id: request.params.id,
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
        path: '/votingactivity/{id}',
        config: {
        },
        handler: function (request, reply) {

            console.log("GET votingactivity");
            console.log("request:", request.params.id);

            // get user first

            var options = {
                method: 'GET',
                url: '/api/user/public/' + request.params.id,
                payload: {},
            };

            server.inject(options, function (userResponse) {
                //console.log("userResponse: ", userResponse.result);
                if (userResponse.result.statusCode) {
                    return reply.redirect('/404');
                } else {
                    console.log("User: ", userResponse.result);

                    var user = userResponse.result;

                    if (request.query != undefined && request.query.message !== undefined) {
                        message = request.query.message;
                    }

                    var options = {
                        method: 'GET',
                        url: '/api/votes',
                        payload: {
                            sort: '_id',
                            limit: 200,
                            page: 1
                        }
                    };

                    //console.log("BEFORE server.inject: ", options);
                    server.inject(options, function (getVotesResponse) {
                        //console.log("getVotesResponse: ", getVotesResponse.result);
                        if (getVotesResponse.result.statusCode) {
                            if (getVotesResponse.result.statusCode) {
                                return reply.view('../login/index', {
                                    message: response.result.message
                                });
                            } else {
                                return reply.redirect('/404');
                            }
                        } else {

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
                                if (voteList[i].ownerId == request.params.id) {
                                    //console.log("user is owner");
                                    userIsOwnerList.push(voteList[i]);
                                }
                                // user is voting
                                loop1:
                                    if (voteList[i].votespos != undefined && voteList[i].votespos.length > 0) {
                                        for (var k = 0; k < voteList[i].votespos.length; k++) {
                                            if (voteList[i].votespos[k].id == request.params.id) {
                                                //console.log("user is voting pos");
                                                voteList[i].voting = "DAFÜR";
                                                userIsVotingList.push(voteList[i]);
                                                break loop1;
                                            }
                                        }
                                    }
                                loop2:
                                    if (voteList[i].votesneg != undefined && voteList[i].votesneg.length > 0) {
                                        for (var l = 0; l < voteList[i].votesneg.length; l++) {
                                            //console.log("negativId: ", voteList[i].votesneg[l].id);
                                            //console.log("request.auth.credentials.user._id: ", request.auth.credentials.user._id);
                                            if (voteList[i].votesneg[l].id == request.params.id) {
                                                //console.log("user is voting neg");
                                                voteList[i].voting = "DAGEGEN";
                                                userIsVotingList.push(voteList[i]);
                                                break loop2;
                                            }
                                        }
                                    }

                                // user is commenting
                                if (voteList[i].comments != undefined && voteList[i].comments.length > 0) {
                                    var commentList = [];
                                    for (var m = 0; m < voteList[i].comments.length; m++) {
                                        if (voteList[i].comments[m].id == request.params.id) {
                                            //console.log("user is commenting");
                                            //console.log("pushing voteList[i].comments[m]: ", voteList[i].comments[m]);
                                            commentList.push(voteList[i].comments[m]);
                                            voteList[i].commentList = commentList;
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

                            return reply.view('votingactivity', {
                                user:                   user,
                                userIsOwnerList:        userIsOwnerList,
                                userIsVotingList:       userIsVotingList,
                                userIsCommentingList:   userIsCommentingList,
                                moment:                 Moment
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
    name: 'publicprofile'
};