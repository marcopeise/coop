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

    next();
};

exports.register = function (server, options, next) {

    server.dependency(['auth', 'hapi-mongo-models'], internals.applyRoutes);

    next();
};

exports.register.attributes = {
    name: 'publicprofile'
};