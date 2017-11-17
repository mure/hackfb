var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var path = require('path');


app.use(express.static(__dirname + '/node_modules'));  

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

app.get('/join', function(req, res,next) {  
    res.sendFile(__dirname + '/views/join.html');
});


app.get('/create', function(req, res,next) {  
    res.sendFile(__dirname + '/views/create.html');
});



/*
io.on('connection', function(client) {  
    console.log('Client connected...');

    client.on('join', function(data) {
        client.emit('messages', 'Hello from server');
        console.log(data);

    client.on('messages', function(data) {
           client.emit('broad', data);
           client.broadcast.emit('broad',data);
    });

});*/


server.listen(3000);  