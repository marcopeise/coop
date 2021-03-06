'use strict';
const Confidence = require('confidence');
const Config = require('./config');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the Coop3000 Server.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port/web'),
        labels: ['web']
    }],
    registrations: [
        {
            plugin: 'hapi-auth-cookie'
        },
        {
            plugin: 'lout'
        },
        {
            plugin: 'inert'
        },
        {
            plugin: 'vision'
        },
        {
            plugin: {
                register: 'visionary',
                options: {
                    engines: { jade: 'jade' },
                    path: './server/web'
                }
            }
        },
        {
            plugin: {
                register: 'hapi-mongo-models',
                options: {
                    mongodb: Config.get('/hapiMongoModels/mongodb'),
                    models: {
                        Account: './server/models/account',
                        AdminGroup: './server/models/admin-group',
                        Admin: './server/models/admin',
                        AuthAttempt: './server/models/auth-attempt',
                        Session: './server/models/session',
                        Status: './server/models/status',
                        User: './server/models/user',
                        Vote: './server/models/vote',
                        Event:'./server/models/event'
                    },
                    autoIndex: Config.get('/hapiMongoModels/autoIndex')
                }
            }
        },
        {
            plugin: './server/auth'
        },
        {
            plugin: './server/mailer'
        },
        {
            plugin: './server/api/accounts',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/admin-groups',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/admins',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/auth-attempts',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/contact',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/index',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/login',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/logout',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/sessions',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/signup',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/statuses',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/users',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/votes',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/api/events',
            options: {
                routes: { prefix: '/api' }
            }
        },
        {
            plugin: './server/web/home'
        },
        {
            plugin: './server/web/public'
        },
        {
            plugin: './server/web/impressum'
        },
        {
            plugin: './server/web/coop3000'
        },
        {
            plugin: './server/web/fuellhorn'
        },
        {
            plugin: './server/web/bildungswerke'
        },
        {
            plugin: './server/web/bildungswerkefuture'
        },
        {
            plugin: './server/web/registrierung'
        },
        {
            plugin: './server/web/registrierung02'
        },
        {
            plugin: './server/web/registrierungfehler'
        },
        {
            plugin: './server/web/newsletter'
        },
        {
            plugin: './server/web/profil'
        },
        {
            plugin: './server/web/registrierungsuccess'
        },
        {
            plugin: './server/web/404'
        },
        {
            plugin: './server/web/login'
        },
        {
            plugin: './server/web/admin'
        },
        {
            plugin: './server/web/logout'
        },
        {
            plugin: './server/web/live'
        },
        {
            plugin: './server/web/anteilsbilanz'
        },
        {
            plugin: './server/web/konzernbilanz'
        },
        {
            plugin: './server/web/aktuelles'
        },
        {
            plugin: './server/web/concernopening'
        },
        {
            plugin: './server/web/suppertheorieparties'
        },
        {
            plugin: './server/web/vote'
        },
        {
            plugin: './server/web/event'
        },
        {
            plugin: './server/web/publicprofile'
        },
        {
            plugin: './server/web/brauchen'
        },
        {
            plugin: './server/web/wasbishergeschah'
        },
        {
            plugin: './server/web/wasbishergeschah02'
        }
        
    ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
