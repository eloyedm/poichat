const {app, BrowserWindow, Tray, clipboard} = require('electron')
const {ipcMain} = require('electron')
const path = require('path');
const url = require('url');
const nativeImage = require('electron').nativeImage
var io = require('./node_modules/socket.io-client/dist/socket.io.js');
var CryptoJS = require('crypto-js');
// const Backbone = require('backbone')
// var WebSocket = require('ws');


let win;
var chats = new Object();
var games = new Object();
var groups = new Object();
var watchWindow = '';
var currentUser = '';
var userLine = '';
var returnLine = '';
var socket = '';
var token = '';
var friendsTokens = {};

var chatUser = '';
var friends = new Array();
var rivals = new Array();
var crypting = true;
let secret = '';
var waitingMessage;

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
  console.log(__dirname + '/resources/img/graph-icon.png');
  var imageN = nativeImage.createFromPath(__dirname + '/resources/img/Accept-icon.png');
  win = new BrowserWindow({width: 800, height: 600, icon: imageN});

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
  secret = arg.secret
  watchWindow = new BrowserWindow({parent: win,width: 300, height: 200, show: false, transparent: true});
  watchWindow.loadURL('file://' + __dirname + '/views/watch.html');
  watchWindow.webContents.openDevTools();
})

ipcMain.on('watch', (event, arg) =>{
  event.sender.send('login', JSON.stringify(userName))
  returnLine = event.sender
})

ipcMain.on('new-chat', (event, arg) => {
  currentUser = arg.user
  if(arg.type == 'group'){
    var oneFriend = arg.friend.join('.');
    oneFriend = CryptoJS.SHA256(oneFriend).toString();
    groups[oneFriend] = [];
    groups[oneFriend] = arg.friend;
    console.log(arg.friend);
    arg.friend = oneFriend;
    console.log(groups)
  }
  if(friends.indexOf(arg.friend) == -1){
    friends.push(arg.friend)
    var newChat = new BrowserWindow({width: 800, height: 600});
    newChat.loadURL('file://'+__dirname+'/views/index.html');
    newChat.webContents.openDevTools();
    // newChat.on('close', () => {
    //
    // })
    newChat.started = false;
    newChat.friend = arg.friend;
    chats[arg.friend] = newChat;

    chats[arg.friend].on('close', (e) =>{
      var d = e.sender.friend;
      chats[d].webContents.send('save-before-close', null);
      delete chats[d];
      friends.splice(d, 1);
    });
  }
})

ipcMain.on('opened-chat', (event, arg) => {
  var group = false;
  if(friends[friends.length-1].length == 64 ){
    group = true;
  }
  event.sender.send('user-return', {friend:friends[friends.length-1], group: group})
  watchWindow.webContents.send('getOldMessages', {token: token, friend: friends[friends.length-1]})
  userLine = event.sender
})

ipcMain.on('opened-game', (event, arg) => {
  console.log(event.sender.friend);
  event.sender.send('game-return', {friend: rivals[rivals.length-1]})
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
    tempArg.message = mensaje;
    tempArg.token = token;
  }
  if(tempArg.group == true){
    tempArg.members = groups[tempArg.name]
  }
  console.log(tempArg)
  arg = JSON.stringify(tempArg);
  watchWindow.webContents.send('chat message', arg);

  // var tempChat = event.getPosition()
  // console.log(tempChat)
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
  watchWindow.webContents.send('startGame',arg )
})

ipcMain.on('acceptGame', (event, arg) => {
  watchWindow.webContents.send('acceptGame',arg )
  if(arg.answer == true){
    if(friends.indexOf(arg.friend) != -1){
      var newGame = new BrowserWindow({width: 800, height: 600});
      newGame.loadURL('file://'+__dirname+'/views/game.html');
      newGame.webContents.openDevTools();
      newGame.friend = arg.friend
      rivals.push(arg.friend)
      games[arg.friend] = newGame;
    }
  }
})

ipcMain.on('save-before-close', (event, arg) =>{
  var mensajesSt = []
  if(arg.messages.length > 0){
    for (message of arg.messages) {
      mensaje = CryptoJS.AES.encrypt(message, secret);
      mensaje = CryptoJS.enc.Utf8.parse(mensaje);
      mensajesSt.push(JSON.stringify(mensaje))
    }
    watchWindow.webContents.send('store-messages', {messages: mensajesSt, token: token, friend: arg.friend});
  }
})

ipcMain.on('recoverMessages', (event, arg) =>{
  arg.token = token;
  watchWindow.webContents.send('recoverMessages', arg)
})

ipcMain.on('accelerateGame', (event, arg) =>{
  watchWindow.webContents.send('accelerateGame', arg)
})

ipcMain.on('gameover', (event, arg) =>{
  console.log("si sale del cliente el gameover")
  watchWindow.webContents.send('gameover', arg)
})

ipcMain.on('chat message-r', (event, arg) => {
  if(!friends[arg.sender]){
    console.log('este vato es nuevo')
    console.log(arg)
    if(friends.indexOf(arg.sender) == -1){
      friends.push(arg.sender)
      var newChat = new BrowserWindow({width: 800, height: 600});
      newChat.loadURL('file://'+__dirname+'/views/index.html');
      newChat.webContents.openDevTools();
      // newChat.on('close', () => {
      //
      // })
      newChat.started = false;
      newChat.friend = arg.sender;
      chats[arg.sender] = newChat;
      chats[arg.sender].on('close', (e) =>{
        var d = e.sender.friend;
        chats[d].webContents.send('save-before-close', null);
        delete chats[d];
        delete friends[d];
      });
    }
  }
  // if(arg.token != 'undefined'){
  //   var tempName = arg.sender;
  //   friendsTokens[tempName] = {};
  //   friendsTokens[tempName]['token'] = arg.token;
  //   friendsTokens[tempName]['crypting'] = arg.crypting
  // }
  // friendsTokens[arg.sender]['crypting']
  if(arg.crypting){
    console.log(arg.message)
    var words = CryptoJS.enc.Utf8.stringify(arg.message);
    console.log(words)
    arg.message = CryptoJS.AES.decrypt(words, arg.token)
    console.log(arg.message)
    var utf8 = arg.message.toString(CryptoJS.enc.Utf8)
    console.log(utf8)
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
  chats[arg.sender].flashFrame(true);

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
  if(arg.messages != null){
    var mensajes = [];
    for (message of arg.messages) {
      if(message.crypting == true){
        var newMensaje;
        var words = CryptoJS.enc.Utf8.stringify(message.message);
        newMensaje = CryptoJS.AES.decrypt(words, message['token']);
        var utf8 = newMensaje.toString(CryptoJS.enc.Utf8);
        newMensaje = utf8;
        chats[arg.friend].webContents.send('chat message', {message:newMensaje});
        mensajes.push(newMensaje);
      }
    }
  }
})

ipcMain.on('startGame-r', (event, arg) => {
  console.log("llego aqui la solicitud")
  chats[arg.sender].webContents.send('startGame', arg)
})

ipcMain.on('acceptGame-r', (event, arg) => {
  if(friends.indexOf(arg.sender) != -1){
    if(arg.answer == true){
      var newGame = new BrowserWindow({width: 800, height: 600});
      newGame.loadURL('file://'+__dirname+'/views/game.html');
      newGame.webContents.openDevTools();
      newGame.friend = arg.sender
      rivals.push(arg.sender);
      games[arg.sender] = newGame;
      console.log(arg.sender);
    }
    else{
      chats[arg.sender].webContents.send('not', {message: 'El usuario no acepto tu solicitud'});
    }
  }
})

ipcMain.on('recoverMessages-r', (event, arg) => {
  console.log(arg.messages);
  for (indMensaje of arg.messages) {
    var oldMessage = JSON.parse(indMensaje.message);
    console.log(oldMessage)
    var words = CryptoJS.enc.Utf8.stringify(oldMessage);
    console.log(words)
    oldMessage = CryptoJS.AES.decrypt(words, secret)
    console.log(oldMessage)
    var utf8 = oldMessage.toString(CryptoJS.enc.Utf8)
    oldMessage = utf8;
    console.log(oldMessage)
    chats[arg.friend].webContents.send('recoverMessages', {message: oldMessage});
  }
  // chats[arg.friend].webContents.send('recoverMessages', arg)
})

ipcMain.on('accelerateGame-r', (event, arg) =>{
  console.log("llega al client");
  games[arg.sender].webContents.send('accelerateGame', arg)
})

ipcMain.on('gameover-r', (event, arg) =>{
  console.log("llega al client");
  games[arg.sender].webContents.send('gameover', arg)
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
