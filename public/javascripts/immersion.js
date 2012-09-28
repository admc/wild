$(document).ready(function() {
  window.myPlayer = _V_("videoPortal"); 

  myPlayer.ready(function() {
    console.log('video ready');
  });

  audiojs.events.ready(function() {
    var as = audiojs.createAll();
  });
});

var show = function(part, when) {
  var entry = $("<a>");
  entry.css("display","block");
  entry.attr("href", "javascript:void(0)");
  entry.html("You flagged a "+part+" around "+Math.round(when)+" seconds.");
  entry.click(function(e) {
    if (when > 1) {
      myPlayer.currentTime(when - 1); 
    }
    else {
      myPlayer.currentTime(when); 
    }
  });
  
  entry.click(function() {
    socket.emit("thing", { entry: "1" });
  });

  var link = $("<li>");
  link.append(entry);

  $("#words").append(link);
}

$(window).keydown(function(event){
  if (event.keyCode == 87) {
    var when = myPlayer.currentTime()
    var socket = io.connect("http://localhost");
    socket.emit("cut", { when: when });
    show("word", when);
  }
  if (event.keyCode == 83) {
    show("sentence", myPlayer.currentTime());
  }
});
