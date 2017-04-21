const {app, BrowserWindow} = require('electron')
const {ipcMain} = require('electron')
const path = require('path');
const url = require('url');
var io = require('./node_modules/socket.io-client/dist/socket.io.js')
// const Backbone = require('backbone')
// var WebSocket = require('ws');


let win;
var chats = [];
var currentUser = '';
var userLine = '';
var socket = '';

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadURL('file://' + __dirname + '/views/login.html');

  win.webContents.openDevTools();

  win.on('closed', () =>{
    win = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin'){
    app.quit()
  }
})

app.on('activate', () => {
  if(win === null){
    createWindow()
  }
})

ipcMain.on('succeedLogin', (event, arg) =>{
  socket = io('http://localhost:8001');
  userName = {name: arg}
  socket.emit('login', JSON.stringify(userName))
})

ipcMain.on('new-chat', (event, arg) => {
  var newChat = new BrowserWindow({width: 800, height: 600});
  newChat.loadURL('file://'+__dirname+'/views/index.html');
  newChat.webContents.openDevTools();
  chats.push[newChat]
  currentUser = arg;
})

ipcMain.on('opened-chat', (event, arg) => {
  event.sender.send('user-return', currentUser)
  userLine = event.sender
})

ipcMain.on('chat message', (event, arg) => {
  socket.emit('chat message', arg);
})

ipcMain.on('offer', (event, arg) => {
  socket.emit('offer', arg);
})

ipcMain.on('answer', (event, arg) => {
  socket.emit('answer', arg);
})

ipcMain.on('buzz', (event, arg) => {
  socket.emit("buzz", arg);
})

ipcMain.on('candidate', (event, arg) => {
  socket.emit('candidate', arg);
})

socket.on('chat message', function(msg){
  userLine.send('chat message', msg)
})

socket.on("buzz", function(){
  userLine.send('buzz', 'ok')
})

socket.on('offer', function(data){
  userLine.send('offer', data)
})

socket.on('answer', function(data){
  userLine.send('answer', data)
})

socket.on('candidate', function(data){
  userLine.send('candidate', function(data))
})

// var conn = new WebSocket('ws://localhost:8080');
// conn.onopen = function(e) {
//     console.log("Connection established!");
//
// }

// conn.onmessage = function(e) {
//     // $('#messages').append($('<li>').text(e.data))
//
//     // $(".mensajes").append(new Date()+"<br>");
//     // $('.cubito').css('left', function(i){
//     //     if($(this).position().left > 100){
//     //       return 0;
//     //     }
//     //     return $(this).position().left + 5;
//     // });
//     // var c = document.getElementById("canvaspot");
//     // var ctx = c.getContext("2d");
//     // ctx.moveTo(0,0);
//     // ctx.lineTo(200,(e.data)*100);
//     // ctx.stroke();
//     // ctx.clearRect(0, 0, c.width, c.height);
//
//     win.webContents.send('new-message', e.data);
// }


ipcMain.on('response-message', (event, arg) => {
    conn.send(arg)
})
