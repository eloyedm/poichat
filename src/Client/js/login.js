var $ = global.jQuery = require('./../node_modules/jquery/dist/jquery.js');
const ipcRenderer = require('electron').ipcRenderer
var io = require('./../node_modules/socket.io-client/dist/socket.io.js')
const remote = require("electron").remote
var window = remote.getCurrentWindow()
var md5 = require('./../node_modules/blueimp-md5/js/md5.min.js')

$(document).ready(function(){
  $(".startRegister").click(function(){
    $(".form").toggle("slow");
  })

  console.log()
  $("#enviarLogin").click(function(event){
    event.stopPropagation();
    console.log(md5($("#password").val()));
    $.ajax({
      method: "POST",
      url: "http://localhost:8001/login",
      data: {
        name: $("#userName").val(),
        pass: $("#password").val()
      },
      success: function(){

      }
    })
  })
})
