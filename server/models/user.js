'use strict';
const Account = require('./account');
const Admin = require('./admin');
const Async = require('async');
const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');


class User extends MongoModels {
    static generatePasswordHash(password, callback) {

        Async.auto({
            salt: function (done) {

                Bcrypt.genSalt(10, done);
            },
            hash: ['salt', function (results, done) {

                Bcrypt.hash(password, results.salt, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(null, {
                password,
                hash: results.hash
            });
        });
    }

    static create(username, password, email, mobile, town, avatar, callback) {

        const self = this;
        function makeid()
        {
            var text = "";
            var possible = "0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        Async.auto({
            passwordHash: this.generatePasswordHash.bind(this, password),
            newUser: ['passwordHash', function (results, done) {

                const document = {
                    isActive: true,
                    username: username.toLowerCase(),
                    password: results.passwordHash.hash,
                    email: email.toLowerCase(),
                    timeCreated: new Date(),
                    mobile: mobile,
                    town: town,
                    avatar: avatar,
                    coopid: makeid()
                };

                self.insertOne(document, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            results.newUser[0].password = results.passwordHash.password;

            callback(null, results.newUser[0]);
        });
    }

    static findByCredentials(username, password, callback) {

        const self = this;

        Async.auto({
            user: function (done) {

                const query = {
                    isActive: true
                };

                if (username.indexOf('@') > -1) {
                    query.email = username.toLowerCase();
                }
                else {
                    query.username = username.toLowerCase();
                }

                self.findOne(query, done);
            },
            passwordMatch: ['user', function (results, done) {

                if (!results.user) {
                    return done(null, false);
                }

                const source = results.user.password;
                Bcrypt.compare(password, source, done);
            }]
        }, (err, results) => {

            if (err) {
                return callback(err);
            }

            if (results.passwordMatch) {
                return callback(null, results.user);
            }

            callback();
        });
    }

    static findByUsername(username, callback) {

        const query = { username: username.toLowerCase() };

        this.findOne(query, callback);
    }

    static findCOOPID(coopidString, callback) {

        //console.log("findCOOPID: ", coopidString);
        const query = { coopid: coopidString };

        this.findOne(query, callback);
    }

    static findEMAIL(email, callback) {

        //console.log("findEMAIL: ", email);
        const query = { email: email };

        this.findOne(query, callback);
    }

    constructor(attrs) {

        super(attrs);

        Object.defineProperty(this, '_roles', {
            writable: true,
            enumerable: false
        });
    }

    canPlayRole(role) {

        if (!this.roles) {
            return false;
        }

        return this.roles.hasOwnProperty(role);
    }

    hydrateRoles(callback) {

        if (!this.roles) {
            this._roles = {};
            return callback(null, this._roles);
        }

        if (this._roles) {
            return callback(null, this._roles);
        }

        const self = this;
        const tasks = {};

        if (this.roles.account) {
            tasks.account = function (done) {

                Account.findById(self.roles.account.id, done);
            };
        }

        if (this.roles.admin) {
            tasks.admin = function (done) {

                Admin.findById(self.roles.admin.id, done);
            };
        }

        Async.auto(tasks, (err, results) => {

            if (err) {
                return callback(err);
            }

            self._roles = results;

            callback(null, self._roles);
        });
    }
}


User.collection = 'users';


User.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(true),
    username: Joi.string().token().lowercase().required(),
    password: Joi.string(),
    email: Joi.string().email().lowercase().required(),
    mobile: Joi.number(),
    town: Joi.string(),
    coopid: Joi.string(),
    description: Joi.string(),
    connections: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required()
    }),
    follows: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required(),
        periodStart: Joi.date().required(),
        periodEnd: Joi.date().required()
    }),
    followsHistory: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required(),
        periodStart: Joi.date().required(),
        periodEnd: Joi.date().required()
    }),
    followedBy: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required(),
        votecount: Joi.number(),
        periodStart: Joi.date().required(),
        periodEnd: Joi.date().required()
    }),
    followedByHistory: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required(),
        votecount: Joi.number(),
        periodStart: Joi.date().required(),
        periodEnd: Joi.date().required()
    }),
    verknExtended: Joi.boolean().default(false),
    altersvorsorge: Joi.boolean().default(false),
    sozialakademie: Joi.boolean().default(false),
    knappenbar: Joi.boolean().default(false),
    gemuesefond: Joi.boolean().default(false),
    gluecklichtage: Joi.boolean().default(false),
    paybackpele: Joi.boolean().default(false),
    roles: Joi.object().keys({
        admin: Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string().required()
        }),
        account: Joi.object().keys({
            id: Joi.string().required(),
            name: Joi.string().required()
        })
    }),
    walzer: Joi.boolean().default(false),
    diskofox: Joi.boolean().default(false),
    chachacha: Joi.boolean().default(false),
    wienerwalzer: Joi.boolean().default(false),
    swing: Joi.boolean().default(false),
    rumba: Joi.boolean().default(false),
    foxtrott: Joi.boolean().default(false),
    blues: Joi.boolean().default(false),
    resetPassword: Joi.object().keys({
        token: Joi.string().required(),
        expires: Joi.date().required()
    }),
    timeCreated: Joi.date(),
    avartar: Joi.string().required(),
    timeaccount: Joi.number().default(0)
});


User.indexes = [
    { key: { username: 1, unique: true } },
    { key: { email: 1, unique: true } }
];


module.exports = User;
