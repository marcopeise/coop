'use strict';
const Composer = require('./index');


Composer((err, server) => {

    if (err) {
        throw err;
    }

    server.start(() => {

        console.log('Started the coop3000 server on port ' + server.info.port);
    });
});
