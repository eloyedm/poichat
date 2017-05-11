var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var dl = require('delivery');
var fs = require('fs');
var md5 = require('./node_modules/blueimp-md5/js/md5.min.js')
var nodemailer = require('nodemailer')
var CryptoJS = require('crypto-js');
var pending = {};
var groups = {};


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
var mysql = require('mysql');
var dbConnection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'homecoming96',
  database : 'senses'
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'senses.chat@gmail.com',
    pass: 'diaz.1913'
  }
});


var mailOptions = {
  from: ' "Senses Chat" <supportsenses@mail.com>',
  subject: 'Welcome to Senses ',
  text: "Thanks for joining to senseswe hope you have a good time with us",
  to: ''
};

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

  dbConnection.query('SELECT * FROM user WHERE username = ?',[userName], function(error, results, fields){
    if(results.length == 0){
      registerUser(userName, password, email, function(result, email, name){
        mailOptions.to = email;
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
      })
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
  check(req.body.nameUser, req.body.pass, function(valid, profile){
    if(valid){
      dbConnection.query('SELECT username, status FROM user WHERE username != ? AND status != 4', [req.body.nameUser], function(error, results, fields){
        var newToken = randomize();
        dbConnection.query('UPDATE user SET validToken = ? WHERE username = ?', [newToken, req.body.nameUser]);
        res.json({user: req.body.nameUser, people: results, token: newToken, status: profile.status, secret: profile.secret});
      });
    }
    else{
      res.status(401).end();
    }
  });
})

io.on('connection', function(socket){
  var chats = []
  var delivery = dl.listen(socket)
  socket.on('chat message', function(msg){
    try {
       data = JSON.parse(msg);
       if(data.name != ""){
         console.log(data.name)
         console.log(users)
         if(users[data.name]){
           console.log(data)
           if(data.group == true){
             if(!groups[data.friend]){
               groups[data.friend] = data.member;
              }
             for (member of groups[data.members]) {
               socket.broadcast.to(users[member]).emit('chat message', {
                 origin: "other",
                 message: data.message,
                 sender: data.friend,
                 token: data.token,
                 crypting: data.crypting
               })
             }
           }
           else{
             console.log(data)
             socket.broadcast.to(users[data.name]).emit('chat message', {
               origin: "other",
               message: data.message,
               sender: socket.name,
               token: data.token,
               crypting: data.crypting
             })
             socket.broadcast.to(users[socket.name]).emit('chat message', {
               origin: "own",
               message: data.message,
               sender: socket.name
             })
           }
         }
         else{
          //  socket.broadcast.to(users[socket.name]).emit('notHere', {
          //     error: "No es posible entregar el mensaje en este momento"
          //  })
            if(!pending[data.name]){
              pending[data.name] = {};
            }
            pending[data.name] = checkForPreviousMessages(pending[data.name], socket.name, data);
         }
       }
       else{
         io.emit('chat message',{
           origin: "group",
           message: data.message
         });
       }
       console.log(users[socket.name])
    } catch (e) {
       data = {};
    }
    console.log(pending);
  });

  socket.on('login', function(msg){
    var data = validateMessage(msg)
    if(data){
      validateToken(data.name, data.token, function(result){
        if(users[result.name]){
          socket.emit('login', {success: false})
        } else {
          users[result.username] = socket.id;
          socket.name = result.username;
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
          sender: socket.name
        })
      }
    }
  })

  socket.on('leave', function(msg){
    var data = validateMessage(msg)
    if(data){
      var conn = users[data.name]
      socket.broadcast.to(users[data.name]).emit('leave', {
        sender: socket.name
      })
    }
  })

  socket.on('candidate', function(msg){
    var data = validateMessage(msg)
    // if(data){
      var conn = users[msg.name]
      console.log("candidate enviado de "+ socket.name+ " a "+ msg.name);
      if(conn != null){
        console.log(msg.sender)
        socket.broadcast.to(users[msg.name]).emit(
          'candidate', {
          candidate: msg.candidate,
          sender: socket.name
        });
      }
      else{
        console.log("noe sta entrando");
      }
    // }
  })

  socket.on('buzz', function(msg){
    var data = validateMessage(msg)
    if(data){
      if(users[data.name]){
        socket.broadcast.to(users[data.name]).emit(
          'buzz', {
            buzz: "pzzzzz",
            sender: socket.name
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

  socket.on('statusChange', function(msg){
    validateToken(msg.name, msg.token, function(result){
      dbConnection.query('UPDATE user SET status = ? WHERE username = ?', [msg.status, msg.name], function(error, results, fields){
      });
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

  socket.on('getOldMessages', function(msg){
    console.log(users[socket.name])
    validateToken(socket.name, msg.token, function(result){
      if(result != null){
        if(pending[socket.name] != undefined ){
          console.log(socket.name)
          if(pending[socket.name][msg.friend] != undefined){
            console.log('hay mensajes');
            socket.emit('getOldMessages', {
              messages: pending[socket.name][msg.friend],
              friend: msg.friend,
            })
          }else{
            socket.emit('getOldMessages', {
              messages: null
            })
          }
        }
        else{
          socket.broadcast.to(users[socket.name]).emit('getOldMessages', {
            messages:  null
          })
        }
      }
    })
  })

  socket.on('store-messages', function(msg){
    validateToken(socket.name, msg.token, function(result){
      if(result != null){
        for (message of msg.messages) {
          saveMessage(msg.friend, socket.name, message);
        }
      }
    })
  })

  socket.on('startGame', function(msg){
    console.log(msg)
    if(msg.friend != ""){
      if(users[msg.friend]){
            console.log(users[msg.friend])
        socket.broadcast.to(users[msg.friend]).emit('startGame', {
          sender: socket.name
        })
      }
    }
  })

  socket.on('acceptGame', function(msg){
    if(msg.friend != ""){
      if(users[msg.friend]){
        socket.broadcast.to(users[msg.friend]).emit('acceptGame', {
          sender: socket.name,
          answer: msg.answer
        })
      }
    }
  })

  socket.on('recoverMessages', function(msg){
    validateToken(socket.name, msg.token, function(result){
      if(result != null){
        recoverMessages(socket.name, msg.friend, function(messages){
          if(messages != null){
            socket.emit('recoverMessages', {
              messages: messages,
              friend: msg.friend
            })
          }
        })
      }
    })
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

function checkForPreviousMessages(parent, name, data){
  if(!parent[name])
  {
    parent[name] = [];
  }
  parent[name].push(data);

  return parent;
}

function registerUser(name, password, email, callback){
  var parameters = {username: name, password: password, email: email, secret: randomize(false), confirmed: false}
  return dbConnection.query('INSERT INTO user SET ?', parameters, function(error, results, fields){
    if(error)
    {
      throw error
    }
    else{
      console.log("ya se inserto, sigue el mail")
    callback(true,email, name);
    }
  })
}

function check(name, password, callback){
  var parameters = [name, password]
  return dbConnection.query('SELECT username, status, secret FROM user WHERE username = ? AND password = ?', parameters, function(error, results, fields){
    if(results.length == 0)
    {
      callback(false)
    }
    else{
      console.log("si entro")
      setOnline(name);
      callback(true, results[0])
    }
  })
}

function setOnline(name){
  return dbConnection.query('UPDATE user SET status = 1 WHERE username = ?', [name], function(error, results, fields){
    if(error){
      throw error
    }
    else{
      return true
    }
  })
}

function getAvailableUsers(name){
  var users = dbConnection.query('SELECT username, status FROM user WHERE username != ? AND status != 0', [name], function(error, results, fields){
    if(error){
      throw error
    }
    else{
      console.log(results);
      return results
    }
  })
  return users
}

function randomize(crypt) {
    crypt= typeof crypt !== 'undefined' ? crypt : false;
    var startString =  Math.random().toString(36).substr(2); // remove `0.`
    console.log(startString);
    if(crypt == true){
      return md5(startString);
    }else{
      var hash = CryptoJS.SHA256(startString).toString();
      return hash;
    }

};

function validateToken(name, token, callback){
  dbConnection.query('SELECT username FROM user WHERE username = ? AND validToken = ?', [name, token], function(error, results, fields){
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

function saveMessage(sender, receiver, message){
  dbConnection.query('CALL sp_insertMessage(?, ?, ?)', [sender, receiver, message], function(err, rows){
    console.log(rows);
    console.log(err);
  })
}

function recoverMessages(receiver, sender, callback){
  dbConnection.query('CALL sp_recoverMessages(?, ?)', [receiver, sender], function(err, rows){
    if(rows != null){
      callback(rows[0]);
    }
    else{
      callback(null);
    }
  })
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
