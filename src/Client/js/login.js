var $ = global.jQuery = require('./../node_modules/jquery/dist/jquery.js');
const ipcRenderer = require('electron').ipcRenderer
var io = require('./../node_modules/socket.io-client/dist/socket.io.js')
const remote = require("electron").remote
var window = remote.getCurrentWindow()

$(document).ready(function(){
  $(".startRegister").click(function(){
    $(".form").toggle("slow");
  })

  $("#userName").click(function(event){
    event.stopPropagation();
    window.location.replace("/views/index.html");
  })
})
