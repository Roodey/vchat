import Ember from "ember";
export default Ember.Controller.extend({
    needs: ['index'],
    httpsServer: null,
    socketServer: null,
    rootSpace: {},
    listening: false,
    tryPort: '0',
    booting: true,  //temporary boolean to wait for ssl keys...
    setup: function(){
        var self = this;
        var nodeModules = this.get('nodeModules');
        var https = nodeModules.get('https');
        var Io = nodeModules.get('socketIo');
        var pem = nodeModules.get('pem');
        //we can't do anything until we have ssl keys to host a call
        pem.createCertificate({days:999, selfSigned: true}, function(err, keys){
            if(err)
            {
                alert('OpenSSL is not available on this machine.  Please install OpenSSL and restart the application.');
                process.exit(1);
            }
            else
            {
                self.set('booting', false);
                self.set('httpsServer', https.createServer({key: keys.serviceKey, cert: keys.certificate}));
                self.set('socketServer', new Io(self.get('httpsServer'), { 'transports': ['polling', 'websocket'], allowUpgrades: true, log: false }));
                self.set('rootSpace',  self.get('socketServer').of("/"));
                self.routeServer();
                self.get('httpsServer').on('error', function(){
                    self.set('listening', false);
                    self.send('openModal', 'modal.alert', 'Unable to listen on port: ' + self.get('tryPort'));
                    self.get('controllers.index').readyToCall();
                });
            }
        });
    }.on('init'),
    listen: function(port){
        var self = this;
        if(!this.get('booting'))
        {
            var listening = this.get('listening');
            port = (isNaN(port) || port < 1) ? 9090 : port;
            if(!listening)
            {
                this.set('tryPort', port);
                this.get('httpsServer').listen(port, function(){
                    self.set('listening', true);
                    self.get('controllers.index').readyToHost();
                });
            }
        }
        else
        {
            setTimeout(function(){self.listen(port);}, 1000);
        }
    },
    stopListening: function(){
        var self = this;
        var listening = this.get('listening');
        var sockets = this.findSockets();
        if(listening)
            this.get('httpsServer').close(function(){
                self.set('listening', false);
                self.get('controllers.index').readyToCall();
            });
        for(var x = 0; x < sockets.length; x++)
            sockets[x].disconnect();
    },
    disconnectSocket: function(el){
        var sockets = this.findSockets();
        for(var x = 0; x < sockets.length; x++)
            if(el === sockets[x].id)
                sockets[x].disconnect();
    },
    findSockets: function(roomId, namespace){   //find all sockets in a place
        var res = [];
        var ns = this.get('socketServer').of(namespace || "/");    // the default namespace is "/"

        if (ns) {
            for (var id in ns.connected) {
                if(roomId) {
                    var index = ns.connected[id].rooms.indexOf(roomId) ;
                    if(index !== -1) {
                        res.push(ns.connected[id]);
                    }
                } else {
                    res.push(ns.connected[id]);
                }
            }
        }
        return res;
    },
    routeServer: function(){
        var self = this,
            socketio = this.get('socketServer');
    
        socketio.on('connection', function (socket) {
            
            socket.broadcast.emit('peerConnected', { id: socket.id });
            debug.debug('Alerting peers of new client: ' + socket.id);
            
            socket.on('webrtc', function (data) {
                var tgt = self.get('rootSpace').connected[data.to];
                if (tgt) {
                    data.by = socket.id;
                    debug.debug('Redirecting message to: ' + data.to + ' from: ' + data.by);
                    debug.debug('Message data: ' + JSON.stringify(data));
                    tgt.emit('webrtc', data);
                }
                else
                {
                    console.warn('Invalid user');
                }
            });

            socket.on('disconnect', function () {
                if (socket) {
                    socket.broadcast.emit('peerDisconnected', { id: socket.id });
                }
            });
            
            debug.debug('Socket link established: ' + socket.id);
        });
    }
});