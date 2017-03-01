'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const NoteEntry = require('./note-entry');
const StatusEntry = require('./status-entry');


class Vote extends MongoModels {
    static create(title, ownerId, ownerUsername, content, endDate, callback) {

        const document = {
            isActive: true,
            title: title,
            content: content,
            endDate: endDate,
            ownerId: ownerId,
            ownerUsername: ownerUsername,
            timeCreated: new Date(),
            timeChanged: new Date()
        };

        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }

    static findByTitle(title, callback) {

        const query = { 'title': title };

        this.findOne(query, callback);
    }
}


Vote.collection = 'votes';


Vote.schema = Joi.object().keys({
    _id: Joi.object(),
    isActive: Joi.boolean().default(true),
    title: Joi.string(),
    content: Joi.string(),
    endDate: Joi.date(),
    ownerId: Joi.string(),
    ownerUsername: Joi.string(),
    votespos: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required()
    }),
    votesneg: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required()
    }),
    comments: Joi.object().keys({
        comment:    Joi.string().required(),
        id:         Joi.string().required(),
        name:       Joi.string().required(),
        timeCreated:Joi.date()
    }),
    timeCreated: Joi.date(),
    timeChanged: Joi.date()
});


Vote.indexes = [
    { key: { title: 1 } }
];


module.exports = Vote;
