var app = require('express')();
var http = require('http').Server(app);
// var io = require('socket.io')(http);
var webRTC = require('webrtc.io').listen(http);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
})

http.listen(8000, function(){
  console.log('listening on *:8000');
})

app.get('/', function(req, res){
  res.sendfile('index.html');
})

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// })

webRTC.rtc.on('chat_msg', (data, socket) => {
  var roomList = webRTC.rtc.rooms[data.room] || [];
  for(var i = 0; i < roomList.length; i++){
    if(socketId !== socket.id){
    var soc = webRTC.rtc.getSocket(socketId);

    if(soc){
      soc.send(JSON.stringify({
          'eventName': 'receive_chat_msg',
          'data': {
            'messages': data.messages,
            'color': data.color
          }
      }), function(error){
        if(error){
          console.log(error);
        }
      });
    }
  }
  }
})
