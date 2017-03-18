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

            //console.log('Admin GET, ', request.auth.credentials.user);
            //console.log('hello, ' + request.auth.credentials.user.User.username);
            return reply.view('index',{
                auth:       JSON.stringify(request.auth),
                session:    JSON.stringify(request.session),
                isLoggedIn: request.auth.isAuthenticated,
                message:    '',
                updatemessage: ''
            });

        }
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

            //console.log('Admin POST, ', request.auth.credentials.user);
            //console.log('search: ', request.payload.coopid);
            function showUpdate(request, response) {
                console.log("User found: ", response.result);
                var verknExtended = '', altersvorsorge = '', sozialakademie = '', knappenbar = '', gemuesefond = '', gluecklichtage = '', paybackpele = '';
                var walzer = '', diskofox = '', chachacha = '', wienerwalzer = '', swing = '', rumba = '', foxtrott = '', blues = '';
                if (response.result.verknExtended || response.result.verknExtended == true) verknExtended = 'checked';
                if (response.result.altersvorsorge || response.result.altersvorsorge == true) altersvorsorge = 'checked';
                if (response.result.sozialakademie || response.result.sozialakademie == true) sozialakademie = 'checked';
                if (response.result.knappenbar || response.result.knappenbar == true) knappenbar = 'checked';
                if (response.result.gemuesefond || response.result.gemuesefond == true) gemuesefond = 'checked';
                if (response.result.gluecklichtage || response.result.gluecklichtage == true) gluecklichtage = 'checked';
                if (response.result.paybackpele || response.result.paybackpele == true) paybackpele = 'checked';
                if (response.result.walzer || response.result.walzer == true) walzer = 'checked';
                if (response.result.diskofox || response.result.diskofox == true) diskofox = 'checked';
                if (response.result.chachacha || response.result.chachacha == true) chachacha = 'checked';
                if (response.result.wienerwalzer || response.result.wienerwalzer == true) wienerwalzer = 'checked';
                if (response.result.swing || response.result.swing == true) swing = 'checked';
                if (response.result.rumba || response.result.rumba == true) rumba = 'checked';
                if (response.result.foxtrott || response.result.foxtrott == true) foxtrott = 'checked';
                if (response.result.blues || response.result.blues == true) blues = 'checked';
                //console.log("verknExtended: ", verknExtended);

                /*var eventsList = [];
                if(response.result.events !== undefined && response.result.events.length>0){
                    response.result.events.forEach(function (event) {
                        //add to array
                        var participate = '';
                        if(event.participate){
                            participate = 'checked';
                            console.log("event: ", event.name);
                        }
                        eventsList.push({
                                name: event.name,
                                participate: event.participate,
                                displayparticipate: participate
                        });
                    });
                }

                console.log("eventList: ", eventsList);*/

                var options ={
                    method: 'GET',
                    url: '/api/events',
                    payload: {
                    },
                    credentials: request.auth.credentials
                };

                server.inject(options, function(eventResponse){
                    //console.log("eventResponse: ", eventResponse.result);
                    if(eventResponse.result.statusCode){
                        if(eventResponse.result.statusCode == 400){
                            return reply.view('../login/index',{
                                message:   eventResponse.result.message
                            });
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        //console.log("Events: ", eventResponse.result.data);
                        /*var events = eventResponse.result.data;
                        for(var i=0; i<events.length; i++) {
                            if(events[i].participants!= undefined && events[i].participants.length>0){
                                console.log("participants: ", events[i].participants);
                                //console.log("response.result._id: ", response.result._id);
                                for(var j = 0; j < events[i].participants.length; j++) {
                                    console.log("matching? ", events[i].participants[j].id.toString() + " : " + response.result._id);
                                    if(events[i].participants[j].id == response.result._id) {
                                        console.log("gefunden!");
                                    }
                                }
                            }
                        }*/

                        return reply.view('adminprofil', {
                            auth: JSON.stringify(request.auth),
                            session: JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated,
                            username: response.result.username,
                            email: response.result.email,
                            mobile: response.result.mobile,
                            town: response.result.town,
                            description: response.result.description,
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

            if(request.payload.coopid){
                var options ={
                    method: 'GET',
                    url: '/api/coopid/' + request.payload.coopid,
                    payload: {
                    }
                };

                server.inject(options, function(response){
                    //console.log("response GET /coopid/id: ", response.result);
                    if(response.result.statusCode){
                        if(response.result.statusCode){
                            return reply.view('index',{
                                updatemessage:   response.result.message,
                                message: '',
                                auth:       JSON.stringify(request.auth),
                                session:    JSON.stringify(request.session),
                                isLoggedIn: request.auth.isAuthenticated
                            });
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        return showUpdate(request, response);
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
                    //console.log("response GET /email/email: ", response.result);
                    //console.log("response.result.message: ", response.result.message);
                    if(response.result.statusCode){
                        if(response.result.statusCode){
                            return reply.view('index',{
                                updatemessage:   response.result.message,
                                message: '',
                                auth:       JSON.stringify(request.auth),
                                session:    JSON.stringify(request.session),
                                isLoggedIn: request.auth.isAuthenticated
                            });
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        return showUpdate(request, response);
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
                    //console.log("response GET /username/username: ", response.result);
                    //console.log("response.result.message: ", response.result.message);
                    if(response.result.statusCode){
                        if(response.result.statusCode){
                            return reply.view('index',{
                                updatemessage:   response.result.message,
                                message: '',
                                auth:       JSON.stringify(request.auth),
                                session:    JSON.stringify(request.session),
                                isLoggedIn: request.auth.isAuthenticated
                            });
                        }else{
                            return reply.redirect('/404');
                        }
                    }else{
                        return showUpdate(request, response);
                    }
                });
            }
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

            //console.log('Update Profile POST, ', request.auth.credentials.user);
            //console.log('ID: ', request.payload.id);
            //console.log('idhelper: ', request.payload.idhelper);
            //console.log('verknExtended: ', request.payload.verknExtended);
            //console.log('knappenbar: ', request.payload.knappenbar);

            var verknExtended = false, altersvorsorge = false, sozialakademie = false, knappenbar = false, gemuesefond = false, gluecklichtage = false, paybackpele = false;
            var walzer = false, diskofox = false, chachacha = false, wienerwalzer = false, swing = false, rumba = false, foxtrott = false, blues = false;
            if(request.payload.verknExtended && request.payload.verknExtended == 'on') verknExtended = true;
            if(request.payload.altersvorsorge && request.payload.altersvorsorge == 'on') altersvorsorge = true;
            if(request.payload.sozialakademie && request.payload.sozialakademie == 'on') sozialakademie = true;
            if(request.payload.knappenbar && request.payload.knappenbar == 'on') knappenbar = true;
            if(request.payload.gemuesefond && request.payload.gemuesefond == 'on') gemuesefond = true;
            if(request.payload.gluecklichtage && request.payload.gluecklichtage == 'on') gluecklichtage = true;
            if(request.payload.paybackpele && request.payload.paybackpele == 'on') paybackpele = true;
            if(request.payload.walzer && request.payload.walzer == 'on') walzer = true;
            if(request.payload.diskofox && request.payload.diskofox == 'on') diskofox = true;
            if(request.payload.chachacha && request.payload.chachacha == 'on') chachacha = true;
            if(request.payload.wienerwalzer && request.payload.wienerwalzer == 'on') wienerwalzer = true;
            if(request.payload.swing && request.payload.swing == 'on') swing = true;
            if(request.payload.rumba && request.payload.rumba == 'on') rumba = true;
            if(request.payload.foxtrott && request.payload.foxtrott == 'on') foxtrott = true;
            if(request.payload.blues && request.payload.blues == 'on') blues = true;
            var options ={
                method: 'PUT',
                url: '/api/users/' + request.payload.id,
                payload: {
                    username:   request.payload.username,
                    email:      request.payload.email,
                    mobile:     request.payload.mobile,
                    town:       request.payload.town,
                    description:request.payload.description,
                    coopid:     request.payload.idhelper,
                    isActive:   true,
                    isAdmin:    true,
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
                    blues: blues
                }
            };

            server.inject(options, function(response){
                //console.log("response GET /coopid/id: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode){
                        return reply.view('index',{
                            updatemessage:   response.result.message,
                            message: '',
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("User updated: ", response.result);

                    // UPDATE EVENT PARTICIPATION
                    if(request.payload.eventnumber !== undefined && request.payload.eventnumber>0){
                        var eventList = new Array();

                        function update_event_participation(request, user, callback) {
                            for (var i=0; i<request.payload.eventnumber; i++) {
                                try {
                                    //console.log("event: ", eval('request.payload.event' + i));
                                    //var participate = false;
                                    if(eval('request.payload.event' + i) == 'on'){
                                        //participate = true;
                                        console.log("update Events with user!!!")

                                        var options ={
                                            method: 'POST',
                                            url: '/api/participateevent/' + eval('request.payload.eventID' + i),
                                            payload: {
                                                participantId:          request.payload.id,
                                                participantUsername:    request.payload.username
                                            }
                                        };

                                        server.inject(options, function(participateEventResponse){
                                            //console.log("response GET /email/email: ", participateEventResponse.result);
                                            //console.log("participateEventResponse.result.message: ", participateEventResponse.result.message);
                                            if(participateEventResponse.result.statusCode){
                                                if(participateEventResponse.result.statusCode){
                                                    return reply.view('index',{
                                                        updatemessage:   participateEventResponse.result.message,
                                                        message: '',
                                                        auth:       JSON.stringify(request.auth),
                                                        session:    JSON.stringify(request.session),
                                                        isLoggedIn: request.auth.isAuthenticated
                                                    });
                                                }else{
                                                    return reply.redirect('/404');
                                                }
                                            }else{
                                                console.log("Successfull added to EVENT", participateEventResponse.result);
                                            }
                                        });
                                    }else{
                                        console.log("update Events without user!!!")

                                        var options ={
                                            method: 'POST',
                                            url: '/api/notparticipateevent/' + eval('request.payload.eventID' + i),
                                            payload: {
                                                participantId:          request.payload.id
                                            }
                                        };

                                        server.inject(options, function(notParticipateEventResponse){
                                            //console.log("response GET /email/email: ", notParticipateEventResponse.result);
                                            //console.log("notParticipateEventResponse.result.message: ", notParticipateEventResponse.result.message);
                                            if(notParticipateEventResponse.result.statusCode){
                                                if(notParticipateEventResponse.result.statusCode){
                                                    return reply.view('index',{
                                                        updatemessage:   notParticipateEventResponse.result.message,
                                                        message: '',
                                                        auth:       JSON.stringify(request.auth),
                                                        session:    JSON.stringify(request.session),
                                                        isLoggedIn: request.auth.isAuthenticated
                                                    });
                                                }else{
                                                    return reply.redirect('/404');
                                                }
                                            }else{
                                                console.log("Successfull removed from EVENT", notParticipateEventResponse.result);
                                            }
                                        });
                                    }
                                    /*eventList.push({
                                        participate: participate,
                                        id: eval('request.payload.eventID' + i),
                                        displayparticipate: eval('request.payload.event' + i)
                                    })*/
                                } catch(ex) { }
                            }
                            callback(user);
                        }

                        update_event_participation(request, response.result, function(user){
                            //console.log("mein array: ", eventList );
                            return reply.view('index',{
                                auth:       JSON.stringify(request.auth),
                                session:    JSON.stringify(request.session),
                                isLoggedIn: request.auth.isAuthenticated,
                                updatemessage: 'Der Benutzer ' + user.username + ' (' + user.coopid +') mit der E-Mail: '+ user.email + ' wurde erfolgreich aktualisiert.',
                                message: ''
                            });
                        })

                    }else{
                        return reply.view('index',{
                            auth:       JSON.stringify(request.auth),
                            session:    JSON.stringify(request.session),
                            isLoggedIn: request.auth.isAuthenticated,
                            username:   response.result.username,
                            email:      response.result.email,
                            mobile:     response.result.mobile,
                            town:       response.result.town,
                            description:response.result.description,
                            coopid:     response.result.coopid,
                            updatemessage: 'Der Benutzer ' + response.result.username + ' (' + response.result.coopid +') mit der E-Mail: '+ response.result.email + ' wurde erfolgreich aktualisiert.',
                            message: ''
                        });
                    }
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
