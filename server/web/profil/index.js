'use strict';
const Joi = require('joi');

exports.register = function (server, options, next) {

    server.views({
        engines: { ejs: require('ejs') },
        relativeTo: __dirname,
        path: '.'
    });

    server.route({
        method: 'POST',
        path: '/profil',
        config: {
            validate: {
                payload: {
                    username: Joi.string().lowercase().required(),
                    password: Joi.string().required()
                }
            }
        },
        handler: function (request, reply) {

            console.log("Login Request");
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
                console.log("response: ", response.result);
                if(response.result.statusCode){
                    return reply.redirect('/404');
                }else{
                    console.log("User: ", response.result.user.email);
                    return reply.view('index',{
                        username:   response.result.user.username,
                        email:      response.result.user.email,
                        mobile:     response.result.user.mobile,
                        town:       response.result.user.town
                    });
                }
            });
        }
    });


    next();
};


exports.register.attributes = {
    name: 'profil'
};
