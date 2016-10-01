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
                isLoggedIn: request.auth.isAuthenticated
            });

        },
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

            var options ={
                method: 'GET',
                url: '/api/coopid/' + request.payload.coopid,
                payload: {
                }
            };

            server.inject(options, function(response){
                //console.log("response GET /coopid/id: ", response.result);
                if(response.result.statusCode){
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    //console.log("User found: ", response.result);
                    var verknExtended = '', altersvorsorge = '', sozialakademie = '', knappenbar = '', gemuesefond = '', gluecklichtage = '', paybackpele = '';
                    var walzer = '', diskofox = '', chachacha = '', wienerwalzer = '', swing = '', rumba = '', foxtrott = '', blues = '';
                    if(response.result.verknExtended || response.result.verknExtended==true) verknExtended = 'checked';
                    if(response.result.altersvorsorge || response.result.altersvorsorge==true) altersvorsorge = 'checked';
                    if(response.result.sozialakademie || response.result.sozialakademie==true) sozialakademie = 'checked';
                    if(response.result.knappenbar || response.result.knappenbar==true) knappenbar = 'checked';
                    if(response.result.gemuesefond || response.result.gemuesefond==true) gemuesefond = 'checked';
                    if(response.result.gluecklichtage || response.result.gluecklichtage==true) gluecklichtage = 'checked';
                    if(response.result.paybackpele || response.result.paybackpele==true) paybackpele = 'checked';
                    if(response.result.walzer || response.result.walzer==true) walzer = 'checked';
                    if(response.result.diskofox || response.result.diskofox==true) diskofox = 'checked';
                    if(response.result.chachacha || response.result.chachacha==true) chachacha = 'checked';
                    if(response.result.wienerwalzer || response.result.wienerwalzer==true) wienerwalzer = 'checked';
                    if(response.result.swing || response.result.swing==true) swing = 'checked';
                    if(response.result.rumba || response.result.rumba==true) rumba = 'checked';
                    if(response.result.foxtrott || response.result.foxtrott==true) foxtrott = 'checked';
                    if(response.result.blues || response.result.blues==true) blues = 'checked';
                    console.log("verknExtended: ", verknExtended);
                    return reply.view('adminprofil',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.username,
                        email:      response.result.email,
                        mobile:     response.result.mobile,
                        town:       response.result.town,
                        coopid:     response.result.coopid,
                        id:         response.result._id,
                        verknExtendedValue: verknExtended,
                        altersvorsorgeValue: altersvorsorge,
                        sozialakademieValue: sozialakademie,
                        knappenbarValue: knappenbar,
                        gemuesefondValue: gemuesefond,
                        gluecklichtageValue: gluecklichtage,
                        paybackpeleValue: paybackpele,
                        walzerValue: walzer,
                        diskofoxValue: diskofox,
                        chachachaValue: chachacha,
                        wienerwalzerValue: wienerwalzer,
                        swingValue: swing,
                        rumbaValue: rumba,
                        foxtrottValue: foxtrott,
                        bluesValue: blues
                    });
                }
            });
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
                    coopid:     request.payload.idhelper,
                    isActive:   true,
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
                    if(response.result.statusCode == 400){
                        return reply.view('../login/index',{
                            message:   response.result.message
                        });
                    }else{
                        return reply.redirect('/404');
                    }
                }else{
                    console.log("User updated: ", response.result);

                    return reply.view('index',{
                        auth:       JSON.stringify(request.auth),
                        session:    JSON.stringify(request.session),
                        isLoggedIn: request.auth.isAuthenticated,
                        username:   response.result.username,
                        email:      response.result.email,
                        mobile:     response.result.mobile,
                        town:       response.result.town,
                        coopid:     response.result.coopid,
                        verknExtended: response.result.verknExtended,
                        altersvorsorge: response.result.altersvorsorge,
                        sozialakademie: response.result.sozialakademie,
                        knappenbar: response.result.knappenbar,
                        gemuesefond: response.result.gemuesefond,
                        gluecklichtage: response.result.gluecklichtage,
                        paybackpele: response.result.paybackpele,
                        walzer: response.result.walzer,
                        diskofox: response.result.diskofox,
                        chachacha: response.result.chachacha,
                        wienerwalzer: response.result.wienerwalzer,
                        swing: response.result.swing,
                        rumba: response.result.rumba,
                        foxtrott: response.result.foxtrott,
                        blues: response.result.blues
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
    name: 'admin'
};
