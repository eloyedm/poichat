define(['jquery', 'Backbone', 'socket'], function($, backbone, io){
  var socket = io('http://localhost:8001');
  var yourConn;
  var stream;
  var name;
  var connectedUser;
  // var rtc = require('webrtc.io-client');
  // console.log(rtc);
  // ipcRenderer.on('new-message', (event, arg) => {
  //    $('#messages').append($('<li>').text(arg))
  // })


  $("#login").click(() =>{
    var userName = {name: $("#userName").val()}
    socket.emit('login', JSON.stringify(userName))
  })

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
  })

  socket.on('login', function(data){
    handleLogin(data.success);
  })

  socket.on('offer', function(data){
    console.log(data)
    handleOffer(data.offer, data.name)
  })

  socket.on('answer', function(data){
    handleAnswer(data.answer)
  })

  socket.on('candidate', function(data){
    handleCandidate(data.candidate)
  })


  $('#send').click(() => {
    // ipcRenderer.send('response-message', $('#m').val());
    var msg = {
      message: $('#m').val()
    }
    socket.emit('chat message', JSON.stringify(msg));
    $('#m').val('');
    return false;
  });

  $("#callBtn").click(function(){
    var friend = $("#callUser").val();
    if(friend.length > 0 ){
      connectedUser= friend;
      yourConn.createOffer(
        function(offer){
          var newfriend = {name: friend, offer: offer};
          console.log(newfriend);
          socket.emit('offer', JSON.stringify(newfriend));
          yourConn.setLocalDescription(offer);
        },
        function(error){
          console.log(error);
        });
    }
    else{
      alert("Por favor escribe el nombre de tu amigo");
    }
  });

  function handleLogin(success){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedua;
    //
    var constraints = {
      audio: false,
      video: true
    };

    var video = $("#local");
    //
    function successCallback(myStream){
        stream = myStream;
        $("#local").attr("src", window.URL.createObjectURL(stream));

        var configuration = {
          "iceServers": [{ "url" : "stun:stun2.1.google.com:19302"}]
        }

        yourConn = new webkitRTCPeerConnection(configuration)

        yourConn.addStream(stream)
        yourConn.onaddstream = function (e) {
          $("#pantalla").attr("src",window.URL.createObjectURL(e.stream));
        }

        yourConn.onicecandidate = function(event){
          if(event.candidate){
            socket.emit('candidate', {"candidate": event.candidate})
          }
        }
    }

    function errorCallback(error){
      console.log('navigator.getUserMedia erro: ', error);
    }

    navigator.getUserMedia(constraints, successCallback(myStream), errorCallback);
  }

  function handleOffer(offer, name){
    connectedUser = name;
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));
    yourConn.createAnswer(function(answer){
    yourConn.setLocalDescription(answer)
        var newAnswer = {'name': name, 'answer': answer};
        socket.emit('answer', JSON.stringify(newAnswer));
    }, function(error){
      alert("Error en respuesta")
    })
  }

  function handleAnswer(answer){
    yourConn.setRemoteDescription(new RTCSessionDescription(answer));
  }

  function handleCandidate(candidate){
    yourConn.addIceCandidate(new RTCIceCandidate(candidate));
  }

  function makeid()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
});
