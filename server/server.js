const express = require('express');
const app = express();
require('./sockets')(app);

const path = require('path');

app.use(express.static(path.join(__dirname,'..','client')));
app.use("/touchpad", express.static(path.join(__dirname,'..','touchpad')));
app.use("/sounds", express.static(path.join(__dirname,'..','sounds')));

app.get('/socket.io.js', (req, res) => {
  res.sendFile('socket.io.min.js', {
  	root: path.join(__dirname, '..', 'node_modules', 'socket.io-client', 'dist')
  });
});
