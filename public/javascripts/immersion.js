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

  $("#words").append(entry);
}

$(window).keydown(function(event){
  if (event.keyCode == 87) {
    show("word", myPlayer.currentTime());
  }
  if (event.keyCode == 83) {
    show("sentense", myPlayer.currentTime());
  }
  if (event.keyCode == 80) {
    show("paragraph", myPlayer.currentTime());
  }
});
