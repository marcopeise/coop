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
        path: '/events',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            //console.log('Admin POST event, ', request.auth.credentials.user);

            var options ={
                method: 'GET',
                url: '/api/events',
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
                    return reply.view('events',{
                        auth:           JSON.stringify(request.auth),
                        session:        JSON.stringify(request.session),
                        isLoggedIn:     request.auth.isAuthenticated,
                        message:        '',
                        updatemessage:  '',
                        events:         response.result.data
                    });
                }
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/createevent',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            console.log('Admin POST create event, ', request.auth.credentials.user);
            console.log('create eventname: ', request.payload.eventname);

            var options ={
                method: 'POST',
                url: '/api/event',
                payload: {
                    eventname:    request.payload.eventname
                }
            };

            server.inject(options, function(createEventResponse) {
                console.log("createEventResponse: ", createEventResponse.result);

                if(createEventResponse.result.statusCode){
                    if(createEventResponse.result.statusCode){
                        request.session.message = createEventResponse.result.message;
                        return reply.redirect('/events');
                    }else{
                        return reply.redirect('/404');
                    }
                }else{

                    var options ={
                        method: 'GET',
                        url: '/api/events',
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
                            //console.log("Events: ", response.result.data);
                            return reply.view('events',{
                                auth:       JSON.stringify(request.auth),
                                session:    JSON.stringify(request.session),
                                isLoggedIn: request.auth.isAuthenticated,
                                message:    '',
                                updatemessage: 'NEUES EVENT ERFOLGREICH HINZUGEFÜGT!',
                                events:         response.result.data
                            });
                        }
                    });
                }
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/editevent/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            console.log('Admin GET edit event, ', request.auth.credentials.user);
            console.log('request params: ', request.params);

            var options ={
                method: 'GET',
                url: '/api/event/'+request.params.id,
                payload: {
                },
                credentials: request.auth.credentials
            };

            server.inject(options, function(response) {
                //console.log("response: ", response.result);
                if (response.result.statusCode) {
                    if (response.result.statusCode == 400) {
                        return reply.view('../login/index', {
                            message: response.result.message
                        });
                    } else {
                        return reply.redirect('/404');
                    }
                } else {
                    console.log("response: ", response.result);
                    return reply.view('editevent', {
                        auth: JSON.stringify(request.auth),
                        session: JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        message: '',
                        updatemessage: '',
                        event: response.result
                    });
                }

            });
        }
    });

    server.route({
        method: 'POST',
        path: '/editevent/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            console.log('Admin POST edit event, ', request.auth.credentials.user);
            console.log('edit old eventname: ', request.params.id);
            console.log('create new eventname: ', request.payload.eventnamenew);

            var options ={
                method: 'PUT',
                url: '/api/event/'+request.params.id,
                payload: {
                    eventnamenew:    request.payload.eventnamenew
                }
            };

            server.inject(options, function(editEventResponse) {
                console.log("editEventResponse: ", editEventResponse.result);

                if(editEventResponse.result.statusCode){
                    if(editEventResponse.result.statusCode){
                        request.session.message = editEventResponse.result.message;
                        return reply.redirect('/events');
                    }else{
                        return reply.redirect('/404');
                    }
                }else{

                    //console.log("editEventResponse: ", editEventResponse.result);

                    return reply.redirect('/events');
                }
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/deleteevent/{id}',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            }
        },
        handler: function (request, reply) {

            console.log('Admin POST edit event, ', request.auth.credentials.user);
            console.log('delete event: ', request.params.id);

            var options ={
                method: 'DELETE',
                url: '/api/deleteevent/'+request.params.id,
                payload: {
                }
            };

            server.inject(options, function(deleteEventResponse) {
                console.log("deleteEventResponse: ", deleteEventResponse.result);

                if(deleteEventResponse.result.statusCode){
                    if(deleteEventResponse.result.statusCode){
                        request.session.message = deleteEventResponse.result.message;
                        return reply.redirect('/events');
                    }else{
                        return reply.redirect('/404');
                    }
                }else{

                    console.log("deleteEventResponse: ", deleteEventResponse.result);

                    var options ={
                        method: 'GET',
                        url: '/api/events',
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
                            //console.log("Events: ", response.result.data);
                            return reply.view('events',{
                                auth:           JSON.stringify(request.auth),
                                session:        JSON.stringify(request.session),
                                isLoggedIn:     request.auth.isAuthenticated,
                                message:        '',
                                updatemessage: 'EVENT ERFOLGREICH GELÖSCHT!',
                                events:         response.result.data
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
    name: 'event'
};