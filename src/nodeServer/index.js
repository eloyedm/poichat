var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var dl = require('delivery');
var fs = require('fs');
var md5 = require('./node_modules/blueimp-md5/js/md5.min.js')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
var mysql = require('mysql');
var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'diaz.1913',
  database : 'senses'
});

//dbConnection.connect("");

// var webRTC = require('webrtc.io').listen(http);

// app.get('/', function(req, res){
//   res.send('<h1>Hello world</h1>');
// })

var users = {};
var deliverers = [];

http.listen(8001, function(){
  console.log('listening on *:8001');
})

app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
})

app.post("/register", function(req, res){
  var userName = req.body.userName
  var password = req.body.password
  var email = req.body.email

  dbConnection.query('SELECT * FROM users WHERE name = ?',[userName], function(error, results, fields){
    if(results.length == 0){
      registerUser(userName, password, email)
    }
    else{
      res.status(401).end();
    }
  })
})

app.get('/receive/:type/:file/:token', function(req, res){
  var token = req.params.token
  var file = req.params.file
  var type = req.params.type
  console.log( token + " " + file + " " + type)
  res.download(__dirname+'/'+type+'/'+file, file);
})

app.post('/login', function(req, res){
  //authentication with te db
  if(check(req.body.nameUser, req.body.pass)){
    dbConnection.query('SELECT name FROM users WHERE name != ? AND online = 1', [req.body.nameUser], function(error, results, fields){
      var newToken = randomize();
      dbConnection.query('UPDATE users SET validToken = ? WHERE name = ?', [newToken, req.body.nameUser]);
      res.json({user: req.body.nameUser, people: results, token: newToken});
    });
  }
  else{
    res.status(401).end();
  }
})

io.on('connection', function(socket){
  var chats = []
  var delivery = dl.listen(socket)
  socket.on('chat message', function(msg){
    try {
       data = JSON.parse(msg);
       if(data.name != ""){
         if(users[data.name]){
           socket.broadcast.to(users[data.name]).emit('chat message', {
             origin: "other",
             message: data.message,
             sender: socket.name
           })
           socket.broadcast.to(users[socket.name]).emit('chat message', {
             origin: "own",
             message: data.message,
             sender: socket.name
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
      validateToken(data.name, data.token, function(result){
        if(users[result.name]){
          socket.emit('login', {success: false})
        } else {
          users[result.name] = socket.id;
          socket.name = result.name;
          socket.deliverer = delivery;
          socket.emit('login', {success: true,})
        }
      })
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
          name: socket.name,
          sender: socket.name
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
          answer: data.answer,
          sender: users[socket.name]
        })
      }
    }
  })

  socket.on('candidate', function(msg){
    var data = validateMessage(msg)
    // if(data){
      var conn = users[msg.name]
      if(conn != null){
        socket.broadcast.to(users[msg.name]).emit(
          'candidate', {
          candidate: msg.candidate,
          sender: users[socket.name]
        });
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
        socket.broadcast.to(users[data.name]).emit(
          'buzz', {
            buzz: "pzzzzz",
            sender: users[socket.name]
          });
      } else {
        console.log(users[socket.name])
        socket.broadcast.to(users[socket.name]).emit('notHere', {
          error: "No es posible realizar el zumbido en este momento"
        })
      }
    }
  })

  socket.on('disconnect', function() {
    var d = socket.name;
    delete users[d];
  })

  socket.on('file transfer', function(msg){
    var newFilename = msg.filename.toLowerCase().replace(" ", "-")
    var buff = new Buffer(msg.file, 'base64');
    fs.writeFile(msg.type+"/"+newFilename, buff, function(err){
      if(err){
        console.log("err");
      }
      else{
        var conn = users[msg.name]
        if(conn != null){
          socket.broadcast.to(users[msg.name]).emit(
            'file transfer', {
            file: newFilename,
            sender: socket.name,
            type: msg.type
          });
        }
      }
    })
  })

  delivery.on('receive.success', function(file, extra){
    var params = file.params;
    console.log(file.params);
    fs.writeFile("images/"+file.name, file.buffer, function(err){
      if(err){
        console.log('File could not be saved');
      }else{
        users[extra.name].deliverer.send({
          name: file.name,
          path: "images/"+file.name
        })
      }
    });
  });
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

function registerUser(name, password, email){
  var parameters = {name: name, password: password, email: email}
  return dbConnection.query('INSERT INTO users SET ?', parameters, function(error, results, fields){
    if(error)
    {
      throw error
    }
    else{
      return true
    }
  })
}

function check(name, password){
  var parameters = [name, password]
  return dbConnection.query('SELECT name FROM users WHERE name = ? AND password = ?', parameters, function(error, results, fields){
    if(results.length == 0)
    {
      throw error
    }
    else{
      setOnline(name);
      return true
    }
  })
}

function setOnline(name){
  return dbConnection.query('UPDATE users SET online = true WHERE name = ?', [name], function(error, results, fields){
    if(error){
      throw error
    }
    else{
      return true
    }
  })
}

function getAvailableUsers(name){
  var users = dbConnection.query('SELECT name FROM users WHERE name != ? AND online = 1', [name], function(error, results, fields){
    if(error){
      throw error
    }
    else{
      return results
    }
  })
  return users
}

function randomize() {
    var startString =  Math.random().toString(36).substr(2); // remove `0.`
    return md5(startString);
};

function validateToken(name, token, callback){
  dbConnection.query('SELECT name FROM users WHERE name = ? AND validToken = ?', [name, token], function(error, results, fields){
    if(!error){
      if(results.length > 0){
        callback(results[0]);
      }
      else{
        callback(null);
      }
    }
  });
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
