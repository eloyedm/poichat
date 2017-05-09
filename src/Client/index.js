const {app, BrowserWindow} = require('electron')
const {ipcMain} = require('electron')
const path = require('path');
const url = require('url');
var io = require('./node_modules/socket.io-client/dist/socket.io.js');
var CryptoJS = require('crypto-js');
// const Backbone = require('backbone')
// var WebSocket = require('ws');


let win;
var chats = new Object();
var games = new Object();
var watchWindow = '';
var currentUser = '';
var userLine = '';
var returnLine = '';
var socket = '';
var token = '';
var friendsTokens = {};

var chatUser = '';
var friends = new Array();
var crypting = true;

var JsonFormatter = { stringify: function (cipherParams) {
  var jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };
  if (cipherParams.iv) {
     jsonObj.iv = cipherParams.iv.toString();
   }
   if (cipherParams.salt) {
     jsonObj.s = cipherParams.salt.toString();
   }
   return JSON.stringify(jsonObj);
 }, parse: function (jsonStr) {
      var jsonObj = JSON.parse(jsonStr);
      var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct) });
        if (jsonObj.iv) {
          cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
        }
        if (jsonObj.s) {
          cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
        }
        return cipherParams;
      }
    }
function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadURL('file://' + __dirname + '/views/login.html');

  // win.webContents.openDevTools();

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
    var newChat = new BrowserWindow({width: 800, height: 600});
    newChat.loadURL('file://'+__dirname+'/views/index.html');
    newChat.webContents.openDevTools();
    // newChat.on('close', () => {
    //
    // })
    newChat.started = false;
    chats[arg.friend] = newChat;
  }
})

ipcMain.on('opened-chat', (event, arg) => {
  event.sender.send('user-return', friends[friends.length-1])
  watchWindow.webContents.send('getOldMessages', {token: token, friend: friends[friends.length-1]})
  userLine = event.sender
})

ipcMain.on('chat message', (event, arg) => {
  // socket.emit('chat message', arg
  var tempArg = JSON.parse(arg);
  if(chats[tempArg.name]['started'] != true){
    tempArg.token = token;
    tempArg.crypting = crypting;
  }
  if(crypting){
    var mensaje = tempArg.message;
    mensaje = CryptoJS.AES.encrypt(mensaje, token);
    mensaje = CryptoJS.enc.Utf8.parse(mensaje);
    console.log(mensaje);
    tempArg.message = mensaje;
    tempArg.token = token;
    // mensaje =CryptoJS.enc.Utf8.parse(words);
    // console.log(mensaje);
    // var decrypted = CryptoJS.AES.decrypt(words, token)
    // console.log(decrypted);
    // var utf8 = decrypted.toString(CryptoJS.enc.Utf8)
    // console.log(utf8)
  }

  arg = JSON.stringify(tempArg);
  console.log(arg);
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

ipcMain.on('leave', (event, arg) => {
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

ipcMain.on('statusChange', (event, arg) => {
  arg.token = token;
  arg.name = chatUser;
  watchWindow.webContents.send('statusChange', arg);
})

ipcMain.on('startGame', (event, arg) => {

  if(friends.indexOf(arg.friend) != -1){
    var newGame = new BrowserWindow({width: 800, height: 600});
    newGame.loadURL('file://'+__dirname+'/views/game.html');
    newGame.webContents.openDevTools();
    games[arg.friend] = newGame;
  }
})

ipcMain.on('chat message-r', (event, arg) => {
  console.log(arg);
  if(arg.token != 'undefined'){
    var tempName = arg.sender;
    friendsTokens[tempName] = {};
    friendsTokens[tempName]['token'] = arg.token;
    friendsTokens[tempName]['crypting'] = arg.crypting
  }
  friendsTokens[arg.sender]['crypting']
  if(friendsTokens[arg.sender]['crypting']){
    var words = CryptoJS.enc.Utf8.stringify(arg.message);
    arg.message = CryptoJS.AES.decrypt(words, friendsTokens[arg.sender]['token'])
    var utf8 = arg.message.toString(CryptoJS.enc.Utf8)
    arg.message = utf8
  }
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

ipcMain.on('leave-r', (event, arg) => {
  chats[arg.sender].webContents.send('leave', arg);
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

ipcMain.on('oldMessages-r', (event, arg) => {
  console.log(arg)
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
