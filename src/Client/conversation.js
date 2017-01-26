var $ = global.jQuery = require('./node_modules/jquery/dist/jquery.js');
const ipcRenderer = require('electron').ipcRenderer
var io = require('./node_modules/socket.io-client/dist/socket.io.js')
const remote = require("electron").remote
var window = remote.getCurrentWindow()
//
var socket = io('http://localhost:8000')
// var rtc = require('webrtc.io-client');
// console.log(rtc);
// ipcRenderer.on('new-message', (event, arg) => {
//    $('#messages').append($('<li>').text(arg))
// })

socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
})

socket.on('video-frame', function(msg){
  console.log(msg);
})

$('form').submit(() => {
  // ipcRenderer.send('response-message', $('#m').val());
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

'use strict';
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedua;

var constraints = {
  audio: false,
  video: true
};

var video = document.querySelector('video');

function successCallback(stream){
  window.stream = stream;
  if(window.URL) {
    video.src = URL.createObjectURL(stream);
    socket.emit('video-frame', stream);
  }else{
    console.log(stream)
    video.src = stream;
  }
}

function errorCallback(error){
  console.log('navigator.getUserMedia erro: ', error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);
