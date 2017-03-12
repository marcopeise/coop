'use strict';
const Joi = require('joi');
const MongoModels = require('mongo-models');
const NoteEntry = require('./note-entry');
const StatusEntry = require('./status-entry');


class Event extends MongoModels {
    static create(name, callback) {

        const document = {
            name: name,
            timeCreated: new Date(),
            timeChanged: new Date()
        };

        console.log("document: ", document);

        this.insertOne(document, (err, docs) => {

            if (err) {
                return callback(err);
            }

            callback(null, docs[0]);
        });
    }

    static findByName(name, callback) {

        const query = { 'name': name };

        this.findOne(query, callback);
    }
}


Event.collection = 'events';


Event.schema = Joi.object().keys({
    _id: Joi.object(),
    name: Joi.string().required(),
    participants: Joi.object().keys({
        id: Joi.string().required(),
        name: Joi.string().required()
    }),
    timeCreated: Joi.date(),
    timeChanged: Joi.date()
});


Event.indexes = [
    { key: { name: 1 } }
];


module.exports = Event;
