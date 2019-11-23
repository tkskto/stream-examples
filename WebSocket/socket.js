var Server = require('ws').Server;
var server = new Server({port: 5001});

server.on('connection', function (ws) {
    ws.on('message', function (message) {
        server.clients.forEach(function(client) {
            client.send(message);
        });
    });

    ws.on('close', function () {
        console.log('ws was closed');
    });
});
