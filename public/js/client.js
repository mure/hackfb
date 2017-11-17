socket = io();

document.addEventListener('DOMContentLoaded', function() {

  var player;

  window.onYouTubeIframeAPIReady = function() {
    if (!player) {
      player = new YT.Player('player', {
        height: '810',
        width: '1440',
        playerVars: { 'autoplay': 0, 'controls': 0 },
        events: {
            'onStateChange': onPlayerStateChange,
            "onReady":onPlayerReady
          }
      });
    }
  }
      
  var ready = false;
  function onPlayerStateChange(event) {
    if (event.data === 1 && ready === false) {
      player.pauseVideo();
      player.seekTo(0);
      ready = true;
    }
  }
  
  function onPlayerReady() {
    socket.emit('init');
  }
  
  window.setTimeout(window.onYouTubeIframeAPIReady, 200);
    
  $('#player').hide();
  $('#play').hide();
  $('#join').hide();
  
  $('#host').on('click', function () {
    var url = $('#url').val();
    
    var video_id = url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
      video_id = video_id.substring(0, ampersandPosition);
    }
    
    socket.emit('video', video_id);

    $('#play').show();
  });
  
  
  /* SYNCING */

  
  socket.on('video', function(response) {
    if (response.id) {
      player.loadVideoById(response.id, 0, "small");

      $('header').hide();
      $('#player').show();
      
      if (response.startTime) {
        $('#join').show();
      }
    }
  });
  
  var time = performance.now();
  socket.emit('sync');
  
  var bestRtt = 9999;
  var counter = 0;
  var offset = 0;
  
  socket.on('sync', function(serverTime) {
    var rtt = performance.now() - time;
    
    if (rtt < bestRtt) {
      offset = serverTime - Date.now() + rtt * 0.5;
      bestRtt = rtt;
    }
    
    if (counter < 30) {
      time = performance.now();
      socket.emit('sync');
    }
    
    counter++;
  });
  
  
  /* PLAYING */
  
  var playButton = document.getElementById('play');

  playButton.addEventListener("click", function () {
    socket.emit('start');
  });
    
  socket.on('start', function(startTime) {
    var delay = startTime - (Date.now() + offset);
    console.log(delay);
    
    var start = performance.now();
    var intervalId = window.setInterval(function() {
      var diff = performance.now() - start;
      if (diff >= delay) {
        player.playVideo();
        
        clearInterval(intervalId);
      }
    }, 0);
    
  });
  
  /* JOINING */
  document.getElementById('join').addEventListener("click", function () {
    socket.emit('join');
  });
    
  socket.on('join', function(startTime) {
    var timePassed = (Date.now() + offset) - startTime;
        
    var seekTime = Math.ceil((timePassed + 3000)/1000);
    player.seekTo(seekTime);
    
    var delay = seekTime * 1000 - timePassed;

    var start = performance.now();
    var intervalId = window.setInterval(function() {
      var diff = performance.now() - start;
      if (diff >= delay) {
        player.playVideo();
        
        clearInterval(intervalId);
      }
    }, 0);
    
  });

});
  
