var $ = global.jQuery = require('./node_modules/jquery/dist/jquery.js');
var WebSocket = require('ws');

var conn = new WebSocket('ws://localhost:8080');
conn.onopen = function(e) {
    console.log("Connection established!");

}
conn.onmessage = function(e) {
    // $('#messages').append($('<li>').text(e.data))

    // $(".mensajes").append(new Date()+"<br>");
    // $('.cubito').css('left', function(i){
    //     if($(this).position().left > 100){
    //       return 0;
    //     }
    //     return $(this).position().left + 5;
    // });
    // var c = document.getElementById("canvaspot");
    // var ctx = c.getContext("2d");
    // ctx.moveTo(0,0);
    // ctx.lineTo(200,(e.data)*100);
    // ctx.stroke();
    // ctx.clearRect(0, 0, c.width, c.height);

    ipcRenderer.send('new-message', e.data);
    $.trigger('income-message', [e.data])
}


 function sendMessage(data){
   conn.send(data)
 }

return true
