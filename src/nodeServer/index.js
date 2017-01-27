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
  var chats = []
  socket.on('chat message', function(msg){
    try {
       data = JSON.parse(msg);
       io.emit('chat message', data.message);
    } catch (e) {
       console.log("Invalid JSON");
       data = {};
    }
  });

  socket.on('login', function(msg){
    var data = validateMessage(msg)
    if(data){
      if(users[data.name]){
        socket.emit('login', {success: false})
      } else {
        users[data.name] = socket.id;
        socket.name = data.name;
        socket.emit('login', {success: true,})
      }
    }
  })

  socket.on('offer', function(msg){
    var data = validateMessage(msg)
    if(data){
      var conn = users[data.name];
      if(conn != null){
        chats.push(data.name)
        socket.broadcast.to(users[data.name]).emit('offer', {
          offer: data.offer,
          name: socket.name
        })
      }
    }
  })

  socket.on('answer', function(msg){
    var data = validateMessage(msg)
    if(data){
      var conn = users[data.name]
      if(conn != null){
        chats.push(data.name)
        socket.broadcast.to(users[data.name]).emit('answer', {
          answer: data.answer
        })
      }
    }
  })

  socket.on('candidate', function(msg){
    var data = validateMessage(msg)
    if(data){
      var conn = users(data.name);
      if(conn != null){
        socket.broadcast.to(users[data.name]).emit('candidate', {
          candidate: data.candidate
        })
      }
    }
  })

  socket.on('video-frame', function(msg){
    io.emit('video-frame', msg);
  })

})

function validateMessage(msg){
  try{
    data = JSON.parse(msg)
    return data;
  }
  catch(e){
    return false
  }
}

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
