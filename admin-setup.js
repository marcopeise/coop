'use strict';
const Async = require('async');
const MongoModels = require('mongo-models');
const Mongodb = require('mongodb');
const Promptly = require('promptly');


Async.auto({
    mongodbUri: (done) => {

        const options = {
            default: 'mongodb://localhost:27017/coop3000'
        };

        Promptly.prompt(`MongoDB URI: (${options.default})`, options, done);
    },
    testMongo: ['mongodbUri', (results, done) => {

        Mongodb.MongoClient.connect(results.mongodbUri, {}, (err, db) => {

            if (err) {
                console.error('Failed to connect to Mongodb.');
                return done(err);
            }

            db.close();
            done(null, true);
        });
    }],
    rootUsername: ['testMongo', (results, done) => {

        Promptly.prompt('Admin username:', done);
    }],
    rootEmail: ['rootUsername', (results, done) => {

        Promptly.prompt('Admin user email:', done);
    }],
    rootPassword: ['rootEmail', (results, done) => {

        Promptly.password('Admin user password:', done);
    }],
    setupRootUser: ['rootPassword', (results, done) => {

        const Account = require('./server/models/account');
        const AdminGroup = require('./server/models/admin-group');
        const Admin = require('./server/models/admin');
        const AuthAttempt = require('./server/models/auth-attempt');
        const Session = require('./server/models/session');
        const Status = require('./server/models/status');
        const User = require('./server/models/user');

        Async.auto({
            connect: function (done) {

                MongoModels.connect(results.mongodbUri, {}, done);
            },
            clean: ['connect', (dbResults, done) => {

                Async.parallel([
                ], done);
            }],
            admin: ['clean', function (dbResults, done) {

                const document = {
                    name: {
                        first: results.rootUsername,
                        middle: '',
                        last: ''
                    },
                    timeCreated: new Date()
                };

                Admin.insertOne(document, (err, docs) => {

                    done(err, docs && docs[0]);
                });
            }],
            user: ['clean', function (dbResults, done) {

                Async.auto({
                    passwordHash: User.generatePasswordHash.bind(this, results.rootPassword)
                }, (err, passResults) => {

                    if (err) {
                        return done(err);
                    }

                    function makeid()
                    {
                        var text = "";
                        var possible = "0123456789";

                        for( var i=0; i < 5; i++ )
                            text += possible.charAt(Math.floor(Math.random() * possible.length));

                        return text;
                    }

                    const document = {
                        isActive:       true,
                        username:       results.rootUsername,
                        password:       passResults.passwordHash.hash,
                        email:          results.rootEmail.toLowerCase(),
                        timeCreated:    new Date(),
                        coopid:         makeid()
                    };

                    User.insertOne(document, (err, docs) => {

                        done(err, docs && docs[0]);
                    });
                });
            }],
            adminMembership: ['admin', function (dbResults, done) {

                const id = dbResults.admin._id.toString();
                const update = {
                    $set: {
                        groups: {
                            root: 'Root'
                        }
                    }
                };

                Admin.findByIdAndUpdate(id, update, done);
            }],
            linkUser: ['admin', 'user', function (dbResults, done) {

                const id = dbResults.user._id.toString();
                const update = {
                    $set: {
                        'roles.admin': {
                            id: dbResults.admin._id.toString(),
                            name: results.rootUsername
                        }
                    }
                };

                User.findByIdAndUpdate(id, update, done);
            }],
            linkAdmin: ['admin', 'user', function (dbResults, done) {

                const id = dbResults.admin._id.toString();
                const update = {
                    $set: {
                        user: {
                            id: dbResults.user._id.toString(),
                            name: results.rootUsername
                        }
                    }
                };
                //console.log("BEFORE Admin.findByIdAndUpdate");
                Admin.findByIdAndUpdate(id, update, done);
                //console.log("AFTER Admin.findByIdAndUpdate");
            }]
        }, (err, dbResults) => {
            //console.log("db results: ", dbResults);
            if (err) {
                console.error('Failed to setup root user.');
                return done(err);
            }

            done(null, true);
        });
    }]
}, (err, results) => {
    //console.log("results: ", results);
    if (err) {
        console.error('Setup failed.');
        console.error(err);
        return process.exit(1);
    }

    console.log('Setup complete.');
    process.exit(0);
});
