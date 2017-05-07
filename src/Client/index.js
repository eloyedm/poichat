const {app, BrowserWindow} = require('electron')
const {ipcMain} = require('electron')
const path = require('path');
const url = require('url');
var io = require('./node_modules/socket.io-client/dist/socket.io.js');
// const Backbone = require('backbone')
// var WebSocket = require('ws');


let win;
var chats = new Object();
var watchWindow = '';
var currentUser = '';
var userLine = '';
var returnLine = '';
var socket = '';
var token = '';

var chatUser = '';
var friends = new Array();

function createWindow() {
  win = new BrowserWindow({width: 400, height: 300});
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
  userName = {name: arg.name, token: arg.token}
  chatUser = arg.name
  token = arg.token
  watchWindow = new BrowserWindow({parent: win,width: 300, height: 200});
  watchWindow.loadURL('file://' + __dirname + '/views/watch.html');
  watchWindow.webContents.openDevTools();
})

ipcMain.on('watch', (event, arg) =>{
  event.sender.send('login', JSON.stringify(userName))
  returnLine = event.sender
})

ipcMain.on('new-chat', (event, arg) => {
  currentUser = arg.user
  if(friends.indexOf(arg.friend) == -1){
    friends.push(arg.friend)
    var newChat = new BrowserWindow({width: 400, height: 300});
    newChat.loadURL('file://'+__dirname+'/views/index.html');
    newChat.webContents.openDevTools();
    chats[arg.friend] = newChat;
  }
})

ipcMain.on('opened-chat', (event, arg) => {
  event.sender.send('user-return', friends[friends.length-1])
  userLine = event.sender
})

ipcMain.on('chat message', (event, arg) => {
  // socket.emit('chat message', arg);
  watchWindow.webContents.send('chat message', arg);
})

ipcMain.on('offer', (event, arg) => {
  // socket.emit('offer', arg);
  watchWindow.webContents.send('offer', arg);
})

ipcMain.on('answer', (event, arg) => {
  // socket.emit('answer', arg);
  watchWindow.webContents.send('answer', arg);
})

ipcMain.on('buzz', (event, arg) => {
  // socket.emit("buzz", arg);
  watchWindow.webContents.send('buzz', arg);
})

ipcMain.on('candidate', (event, arg) =>{
  watchWindow.webContents.send('candidate', arg);
})

ipcMain.on('file transfer', (event, arg) => {
  watchWindow.webContents.send('file transfer', arg);
})

ipcMain.on('chat message-r', (event, arg) => {
  chats[arg.sender].webContents.send('chat message', arg);
})

ipcMain.on('offer-r', (event, arg) => {
  // socket.emit('offer', arg);
  chats[arg.sender].webContents.send('offer', arg);
})

ipcMain.on('answer-r', (event, arg) => {
  // socket.emit('answer', arg);
  chats[arg.sender].webContents.send('answer', arg);
})

ipcMain.on('buzz-r', (event, arg) => {
  // socket.emit("buzz", arg);
  chats[arg.sender].webContents.send('buzz', arg);
})

ipcMain.on('candidate-r', (event, arg) =>{
  // console.log(arg);
  // var currentChat = chats[arg.sender];
  // console.log(currentChat);
  chats[arg.sender].webContents.send('candidate', arg);
})

ipcMain.on('file transfer-r', (event, arg) => {
  arg.name = chatUser;
  arg.token = token;
  chats[arg.sender].webContents.send('file transfer', arg);
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
