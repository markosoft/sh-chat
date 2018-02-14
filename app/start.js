#!/usr/bin/env node
var debug = require('debug')('SH_Chat');
var crypto = require('crypto');
var app;

var localhost = false;

if (process.env.NON_LOCALHOST) {
    app = function (req, res) {
        res.end('Opa');
    };
    localhost = false;
}
else {
    app = require('../app');
    localhost = true;
}

var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.set('transports', ['websocket']);

console.log("localhost: " + localhost);

var avatar_url = "http://www.gravatar.com/avatar/";
var avatar_404 = ['mm', 'identicon', 'monsterid', 'wavatar', 'retro'];

function get_avatar_url(user) {
    var mymd5 = crypto.createHash('md5').update(user);
    //var rand = random(0, avatar_404.length);
    var end = '?s=24&d=wavatar';
    return avatar_url + mymd5.digest("hex") + "/" + end;
}

function random(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var port = process.env.NODEJS_PORT || 8080 || process.env.PORT;
//var ip = process.env.NODEJS_IP || '127.0.0.1' || env.NODE_IP;

var users = {}, offline = {}, socks = {};

io.on('connection', function (socket) {
    console.log("io.on connect");

    socket.on('join', function (recv) {
        var user_name = recv.name;
        var user_id = recv.uid;
        var user_avatar = recv.avatar;
        var user_profile = recv.profile;
        var email = recv.email;
        var color = recv.color;
        var security = recv.security;
        var online = recv.connection;

        var mymd5 = crypto.createHash('md5').update(crypto.createHash('md5').update(user_name + email).digest("hex")).digest("hex");

        if (!user_id || !user_name || (mymd5 != security && !localhost)) {
            socket.emit('confirm', { op: 'reject' });
            socket.user_id = 0;
            socket.disconnect(true);
            return;
        }

        socket.user_id = user_id;

        if (users[socket.user_id]) {
            socket.emit('confirm', { op: 'accept', first: false, online: true });
            if (Object.keys(users).length > 0) {
                socket.emit('chat', JSON.stringify({ 'action': 'usrlist', 'user': users }));
            }
            var i = socks[socket.user_id].indexOf(socket);
            if (i == -1) {
                socks[socket.user_id].push(socket);
                //console.log(user_name + ' - vec je tu');
                //console.log(util.inspect(socks[socket.user_id].length, false, null))
            }
        }
        else if (offline[socket.user_id]) {
            socket.emit('confirm', { op: 'accept', first: false, online: false });
            var i = socks[socket.user_id].indexOf(socket);
            if (i == -1) {
                socks[socket.user_id].push(socket);
                //console.log(user_name + ' - vec je tu');
            }
        }
        else {
            
            if (user_avatar == "") user_avatar = get_avatar_url(user_name);
            if (color == "") color = '000000';
            socks[socket.user_id] = [];
            socks[socket.user_id].push(socket);

            var current = { 'uid': user_id, 'name': user_name, 'avatar': user_avatar, 'profile': user_profile, 'color': color };
            socket.emit('confirm', { op: 'accept', first: true, user: current, online: online});

            if (online) {
                users[socket.user_id] = current;
                if (Object.keys(users).length > 0) {
                    //console.log('lista');
                    io.emit('chat', JSON.stringify({ 'action': 'usrlist', 'user': users }));
                }
            }
            else {
                offline[socket.user_id] = current;
            }
            //console.log(user_name + ' - prvi put');
        }
    });

    socket.on('online', function (recv) {

        if (socket.user_id != 0) {
            var value = recv.value;
            if (socket.user_id in socks) {
                for (var i = 0; i < socks[socket.user_id].length; i++) {
                    var sock = socks[socket.user_id][i];
                    sock.emit('self', JSON.stringify({ 'action': 'connect_disconnect', 'value': value }));
                }
            }

            if (value) {
                if (socket.user_id in offline) {
                    users[socket.user_id] = offline[socket.user_id];
                    delete offline[socket.user_id];
                }
            }
            else {

                if (socket.user_id in users) {
                    offline[socket.user_id] = users[socket.user_id];
                    delete users[socket.user_id];
                }
                socket.broadcast.emit('chat', JSON.stringify({ 'action': 'disconnect', 'user': offline[socket.user_id] }));
            }
            io.emit('chat', JSON.stringify({ 'action': 'usrlist', 'user': users }));
        }
        
    });

    socket.on('disconnect', function () {
        if (socket.user_id != 0) {
            if (socket.user_id in socks) {
                setTimeout(function () {
                    var i = socks[socket.user_id].indexOf(socket);
                    socks[socket.user_id].splice(i, 1);
                    if (socks[socket.user_id].length == 0) {
                        socket.broadcast.emit('chat', JSON.stringify({ 'action': 'disconnect', 'user': users[socket.user_id] }));
                        delete offline[socket.user_id];
                        delete users[socket.user_id];
                        delete socks[socket.user_id];
                        io.emit('chat', JSON.stringify({ 'action': 'usrlist', 'user': users }));
                    }
                }, 20000);
                
                //console.log('user disconnected');
            }
        }
    });

    socket.on('message', function (recv) {
        if (socket.user_id != 0) {
            //console.log(util.inspect(recv.user_id, false, null));
            var text = recv.msg.substr(0, 10000);
            var d = recv.date;

            var msg = { 'msg': text, 'user': users[socket.user_id], 'dest_user': recv.user_id, 'date': d, 'seen': false };
            

            //self
            if (socket.user_id in socks) {
                for (var i = 0; i < socks[socket.user_id].length; i++) {
                    var sock = socks[socket.user_id][i];
                    sock.emit('chat', JSON.stringify({ 'action': 'message', 'data': msg }));
                }
            }

            //real
            if (recv.user_id in socks && !(recv.user_id in offline)) {
                for (var i = 0; i < socks[recv.user_id].length; i++) {
                    var sock = socks[recv.user_id][i];

                    sock.emit('chat', JSON.stringify({ 'action': 'message', 'data': msg }));
                }
            }
        }
        
    });

    socket.on('user_typing', function (recv) {

        if (socket.user_id != 0) {
            if (recv.user_id in socks && !(recv.user_id in offline)) {
                for (var i = 0; i < socks[recv.user_id].length; i++) {
                    var sock = socks[recv.user_id][i];
                    sock.emit('chat', JSON.stringify({ 'action': 'user_typing', 'data': users[socket.user_id] }));
                }
            }
        }
    });

    socket.on('self', function (recv) {

        if (socket.user_id != 0) {
            if (socket.user_id in socks) {
                for (var i = 0; i < socks[socket.user_id].length; i++) {
                    var sock = socks[socket.user_id][i];
                    sock.emit('self', JSON.stringify(recv));
                }
            }
        }
    });
});


http.listen(port, function () {
    console.log('Express server listening on *:' + port);
});