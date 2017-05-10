var $ = global.jQuery = require('./../node_modules/jquery/dist/jquery.js');
const renderer = require('electron').ipcRenderer
var io = require('./../node_modules/socket.io-client/dist/socket.io.js')
const remote = require("electron").remote
var window = remote.getCurrentWindow()
var md5 = require('./../node_modules/blueimp-md5/js/md5.min.js')
var serverAddress = "http://localhost:8001"

function chatWindow(){
  this.userName = '';
  this.render = function(data){
    var docBody = $("body");
    var mainContainer = $("<div />", {
      class: "leftColumn"
    });
    var logo = $('<div />',{
      class: 'logo'
    }).html('<img src="../resources/img/logo-white.png" alt="">');
    var userInfo = $('<div />', {
      class: 'userInfo'
    });
      var username = $("<span />", {
        class: "username",
        text: data.user
      });
      var userStatus = $("<select />", {
        class: "statusList"
      });
      var statusNames = ["En linea", "Ausente", "Ocupado"];
      var statusName = "";
      for(var i = 1; i< 4; i++){
        statusName += '<option value="'+i+'">'+statusNames[i-1]+'</option>'
      }
      userStatus.html(statusName);
    userInfo.html('<div class="profilePicture"><img src="../resources/img/user-bgwhite.png" alt=""></div>');
    userInfo.append(username);
    userInfo.append(userStatus);
    var contacts = $('<div />',{
      class: 'contacts'
    });
      var friends = $("<ul />", {
        class: "friendsContainer"
      });
      var friend = "";
      for (person of data.people) {
        friend += "<li class='friendContainer' data="+person.username+">"+person.username+"<span>"+person.status+"  </span></li>";
      }
      friends.html(friend);
    contacts.html('<span>Contactos</span>');
    contacts.append(friends);
    mainContainer.append(logo);
    mainContainer.append(userInfo);
    mainContainer.append(contacts);
    var content = $('div.content');
    docBody.empty();
    docBody.append(mainContainer);
    docBody.append(content);

    $(".friendContainer").click(function(){
      var friendName = this.getAttribute('data');
      renderer.send('new-chat',{user: data.user, friend: friendName} );
    });

    $(".statusList").change(function(){
      renderer.send('statusChange', {status: this.value});
    });
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
      url: serverAddress+"/login",
      data: {
        nameUser: $("#userName").val(),
        pass: codedPass
      },
      success: function(data){
        alert("Bienvenido "+ data.user);
        renderer.send('succeedLogin',{name:data.user, token:data.token, secret: data.secret});
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
      url: serverAddress+"/register",
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
