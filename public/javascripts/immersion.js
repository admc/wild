$(document).ready(function() {
  window.myPlayer = _V_("videoPortal"); 

  myPlayer.ready(function() {
    console.log('video ready');
  });

  audiojs.events.ready(function() {
    var as = audiojs.createAll();
  });
});

var randomString = function(length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

  if (! length) {
    length = Math.floor(Math.random() * chars.length);
  }

  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}


var show = function(part, when) {
  var entry = $("<a>");
  entry.attr("id", randomString(8));
  entry.attr("when", Math.round(when));
  entry.css("display","block");
  entry.attr("href", "javascript:void(0)");
  entry.html("Processing a "+part+", flagged around "+Math.round(when)+" seconds...");
  /*entry.click(function(e) {
    if (when > 1) {
      myPlayer.currentTime(when - 1); 
    }
    else {
      myPlayer.currentTime(when); 
    }
  });*/

  var link = $("<li>");
  link.append(entry);

  $("#words").append(link);
  return entry;
}

$(window).keydown(function(event){
  if (event.keyCode == 87) {
    var when = myPlayer.currentTime()
    var socket = io.connect("http://localhost");
    var entryLink = show("word", when);
    socket.emit("cut", { when: when-5, url: window.currentURL, entry: entryLink.attr("id") });
  }
  if (event.keyCode == 83) {
    show("sentence", myPlayer.currentTime());
  }
});
