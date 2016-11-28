'use strict';

var mongoose = require('mongoose');
var SocketModel = mongoose.model('Socket');
var atob = require('atob');
var event = require('../../../actsec/event.js');

module.exports = function(Socket, io) {
    return {
        init: function() {
            var b64_to_utf8 = function(str) {
                return decodeURIComponent(escape(atob(str)));
            }

            io.on('connection', function(socket) {
                var sid = socket.id;

                event.on('notify', function(socketId, notif) {
                    io.to(socketId).emit('notify', {
                        payload: JSON.stringify(notif),
                        source: 'server'
                    });
                });

                socket.on('auth', function(socketAuth) {
                    var encodedUser = decodeURI(b64_to_utf8(socketAuth.token.split('.')[1]));
                    var user = JSON.parse(encodedUser);

                    if (socketAuth.user == user._id) {
                        SocketModel.addSocket(socket.id, user._id, function(err, userSocket) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Added Socket [' + userSocket.socketId + '] for user [' + userSocket.userId + ']');
                            }
                        });
                    }
                });

                socket.on('disconnect', function() {
                    console.log('socket-id: ' + socket.id + ' disconnected');
                    SocketModel.removeSocket(socket.id, function(err, userSocket) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (userSocket.result.n == 1) {
                                console.log('Removed Socket [' + socket.id + ']');
                            }
                        }
                    });
                });
            });
        }
    }
};