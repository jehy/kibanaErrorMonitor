const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const debug = require('debug')('shodan:server');
const config = require('config');
const knex = require('knex')(config.db);
require('./modules/knex-timings')(knex, false);
const showLogsByMsgName = require('./modules/showLogsByMsgName');
const showTopErrors = require('./modules/showTopErrors');

if (config.ui.auth && config.ui.auth.enabled) {
// eslint-disable-next-line global-require
  require('./auth.js')(app, io, knex);
}

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

app.use(express.static('dist'));

setInterval(() => {
  debug(`Current users connected: ${Object.keys(io.sockets.connected).length}`);
}, 5000);

io.on('connection', (socket) => {
  debug(`A user connected (${socket.request.user && socket.request.user.displayName || 'unknown'})`);

  socket.on('event', (event) => {
    debug(`event ${event.name} fired: ${JSON.stringify(event)}`);

    if (config.ui.auth && config.ui.auth.enabled) {
      if (!socket.request.user || !socket.request.user.logged_in) {
        debug('user not authorized!');
        socket.emit('event', {name: 'updateTopErrors', data: [], fetchErrors: ['Not authorized']});
        return;
      }
    }
    if (event.name === 'showTopErrors') {
      showTopErrors(knex, socket, event);
    }
    else if (event.name === 'showLogsByMsgName') {
      showLogsByMsgName(knex, socket, event);
    }
    else {
      debug(`dunno event name ${event.name}`);
    }
  });

});

http.listen(config.ui.port, () => {
  debug(`listening on *:${config.ui.port}`);
});

