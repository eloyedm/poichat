var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*var mysql = require('mysql');
var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'homecoming96',
  database : 'senses'
});
*/

//dbConnection.connect("");

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

app.use('/login', function(req, res){
  console.log(req.method);
  // res.sendFile(__dirname +'/index.html');
})

io.on('connection', function(socket){
  var chats = []
  socket.on('chat message', function(msg){
    try {
       data = JSON.parse(msg);
       if(data.name != ""){
         if(users[data.name]){
           socket.broadcast.to(users[data.name]).emit('chat message', {
             origin: "other",
             message: data.message
           })
           socket.broadcast.to(users[socket.name]).emit('chat message', {
             origin: "own",
             message: data.message
           })
         }
         else{
           socket.broadcast.to(users[socket.name]).emit('notHere', {
              error: "No es posible entregar el mensaje en este momento"
           })
         }
       }
       else{
         io.emit('chat message',{
           origin: "group",
           message: data.message
         });
       }
    } catch (e) {
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
    console.log("aqui llega un candidate primero")
    console.log(msg.name)
    // if(data){
      var conn = users[msg.name]
      if(conn != null){
        console.log("se envia el candidate")
        socket.broadcast.to(users[msg.name]).emit(
          'candidate', {
          candidate: msg.candidate
        });
        console.log("si se envia el ice candidate");
      }
      else{
        console.log("noe sta entrando");
      }
    // }
  })

  socket.on('video-frame', function(msg){
    io.emit('video-frame', msg);
  })

  socket.on('buzz', function(msg){
    var data = validateMessage(msg)
    if(data){
      if(users[data.name]){
        console.log("aqui deberia entrar", users[data.name]);
        console.log(users);
        socket.broadcast.to(users[data.name]).emit('buzz', {buzz: "pzzzzz"})
      } else {
        console.log(users[socket.name])
        socket.broadcast.to(users[socket.name]).emit('notHere', {
          error: "No es posible realizar el zumbido en este momento"
        })
      }
    }
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
