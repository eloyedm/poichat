var $ = global.jQuery = require('./../node_modules/jquery/dist/jquery.js');
const ipcRenderer = require('electron').ipcRenderer
var io = require('./../node_modules/socket.io-client/dist/socket.io.js')
const remote = require("electron").remote
var window = remote.getCurrentWindow()
var md5 = require('./../node_modules/blueimp-md5/js/md5.min.js')

function chatWindow(){
  this.userName = '';
  this.render = function(data){
    var mainContainer = $("<div />", {
      class: "mainContainer"
    });
    console.log(data);
    var userTitle = $("<div />", {
      class: "userTitle",
      text: data.user
    });

    mainContainer.append(userTitle);
    $("body").append(mainContainer);
  }
}

$(document).ready(function(){
  $(".startRegister").click(function(){
    $(".form").toggle("slow");
  })

  console.log()
  $("#enviarLogin").click(function(event){
    event.stopPropagation();
    var codedPass = md5($("#password").val());
    $.ajax({
      method: "POST",
      url: "http://localhost:8001/login",
      data: {
        nameUser: $("#userName").val(),
        pass: codedPass
      },
      success: function(data){
        console.log(data);
        seeChats(data);
      }
    })
  })

  function seeChats(data){
    var chats = new chatWindow();
    chats.render(data);
  }
})
