var $ = global.jQuery = require('./../node_modules/jquery/dist/jquery.js');
const renderer = require('electron').ipcRenderer
var io = require('./../node_modules/socket.io-client/dist/socket.io.js')
const remote = require("electron").remote
var window = remote.getCurrentWindow()
var md5 = require('./../node_modules/blueimp-md5/js/md5.min.js')

function chatWindow(){
  this.userName = '';
  this.render = function(data){
    var docBody = $("body");
    var mainContainer = $("<div />", {
      class: "mainContainer"
    });

    var userTitle = $("<div />", {
      class: "userTitle",
      text: data.user
    });

    for (person of data.people) {
            console.log(person);
    }

    mainContainer.append(userTitle);
    docBody.empty();
    docBody.append(mainContainer);

    $(".mainContainer").click(function(){
      renderer.send('new-chat', data.user);
    })
  }
}

$(document).ready(function(){
  $(".startRegister").click(function(){
    $(".form").toggle("slow");
  })
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
        alert("Bienvenido "+ data.user);
        renderer.send('succeedLogin', data.user);
        seeChats(data);
      },
      error: function(){
        alert("Lo sentimos, el usuario o contraseña son incorrectos");
      }
    })
  })

  $("#enviarRegistro").click(function(event){
    event.stopPropagation();
    var codedPass = md5($("#newPassword").val());
    var userName = $("#newUser").val();
    var email = $("#email").val();
    $.ajax({
      method: "POST",
      url: "http://localhost:8001/register",
      data: {
        userName: userName,
        password: codedPass,
        email: email
      },
      success: function(data){
        seeChats(data);
      },
      error: function(){
        alert('Este usuario ya existe');
      }
    })
  })

  function seeChats(data){
    var chats = new chatWindow();
    console.log(data);
    chats.render(data);
  }
})
