'use strict';

const internals = {};

internals.applyRoutes = function (server, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: 'GET',
        path: '/live',
        config: {
            auth: {
                strategy: 'session',
                scope: 'admin'
            },
        },
        handler: function (request, reply) {

            var options ={
                method: 'GET',
                url: '/api/users',
                payload: {
                },
                credentials: request.auth.credentials
            };

            server.inject(options, function(responseGetUsers) {
                //console.log("response GET /coopid/id: ", response.result);
                if (responseGetUsers.result.statusCode) {
                    if (responseGetUsers.result.statusCode == 400) {
                        return reply.view('../login/index', {
                            message: responseGetUsers.result.message
                        });
                    } else {
                        return reply.redirect('/404');
                    }
                } else {

                    var coopUserArray = responseGetUsers.result.data;
                    console.log("Number of Users found: ", coopUserArray.length);

                    var coop3000Objects = {
                        elements: []
                    };

                    coopUserArray.forEach(function (user) {

                        // check if user already in coop3000Objects
                        function searchInCoop3000Objects(divs, userID, callback){
                            for (var i = 0; i < divs.length; i++) {
                                //console.log("divs: ", divs[i].data);
                                if (divs[i].data.id == userID) {
                                    //console.log("ist im array.");
                                    callback(true);
                                }
                            }
                            callback(false);
                        }
                        //console.log("coop3000Objects.elements: ", coop3000Objects.elements);
                        searchInCoop3000Objects(coop3000Objects.elements, user._id, function (response) {
                            if(!response){
                                //console.log("hinzufügen");
                                //add to array
                                coop3000Objects.elements.push({
                                    data: {
                                        id: user._id,
                                        name: user.username + ' ' + user.coopid
                                    }
                                });
                            }
                        });
                        function searchForConnections(divs, userIDone, userIDtwo, callback){
                            for (var i = 0; i < divs.length; i++) {
                                //console.log("divs: ", divs[i].data);
                                var connectionIDOne = userIDone + userIDtwo;
                                var connectionIDTwo = userIDtwo + userIDone;
                                if (divs[i].data.id == connectionIDOne || divs[i].data.id == connectionIDTwo) {
                                    //console.log("ist im connection array.");
                                    callback(true);
                                }
                            }
                            callback(false);
                        }
                        if(user.connections && user.connections.length > 0){
                            user.connections.forEach(function (connection) {
                                searchForConnections(coop3000Objects.elements, user._id, connection.user.id, function (response) {
                                    if (!response) {
                                        //console.log("Connection hinzufügen");
                                        //console.log("Connection: ", connection);
                                        //add to array
                                        coop3000Objects.elements.push({
                                            data: {
                                                id: user._id + connection.user.id,
                                                source: user._id,
                                                target: connection.user.id
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });

                    /*coop3000Objects = {
                        elements: [
                            {data: {id: 'a', name: 'marco 12345'}},
                            {
                                data: {
                                    id: 'ab',
                                    source: 'a',
                                    target: 'b'
                                }
                            },
                            {data: {id: 'b', name: 'susanne 34562'}},
                            {data: {id: 'c', name: 'ansgar 84313'}},
                            {data: {id: 'd', name: 'wiebke 85632'}},
                            {
                                data: {
                                    id: 'cd',
                                    source: 'c',
                                    target: 'd'
                                }
                            }
                        ]
                    };*/
                    var coopElementsString = JSON.stringify(coop3000Objects);
                    //console.log("coop3000Objects: ", coopElementsString);
                    //console.log("coop3000 JSON Object: ", JSON.parse(coopElementsString));
                    return reply.view('index', {
                        auth: JSON.stringify(request.auth),
                        session: JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        coopElementsString: JSON.stringify(coop3000Objects)
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
    name: 'live'
};
