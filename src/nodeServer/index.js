var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var webRTC = require('webrtc.io').listen(http);

// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// })

var users = {};

http.listen(8001, function(){
  console.log('listening on *:8001');
})

app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
})

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    try {
       data = JSON.parse(msg);
       io.emit('chat message', data.message);
    } catch (e) {
       console.log("Invalid JSON");
       data = {};
    }
  });

  socket.on('video-frame', function(msg){
    io.emit('video-frame', msg);
  })

  users[data.name] = socket;
  socket.name = data.namew
})

// webRTC.rtc.on('chat_msg', (data, socket) => {
//   var roomList = webRTC.rtc.rooms[data.room] || [];
//   for(var i = 0; i < roomList.length; i++){
//     if(socketId !== socket.id){
//     var soc = webRTC.rtc.getSocket(socketId);
//
//     if(soc){
//       soc.send(JSON.stringify({
//           'eventName': 'receive_chat_msg',
//           'data': {
//             'messages': data.messages,
//             'color': data.color
//           }
//       }), function(error){
//         if(error){
//           console.log(error);
//         }
//       });
//     }
//   }
//   }
// })
