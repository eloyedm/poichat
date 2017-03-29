var express = require('express')
var app = express()
var io = require('socket.io');
// var webRTC = require('webrtc.io').listen(http);

// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// })

var users = {};

app.listen(8000, function(){
  console.log('listening on *:8000');
})

app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
})

app.use('/bundles',express.static('bundles'));
app.use('/css', express.static('css'));
app.use('/resources', express.static('resources'));

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
