const socket = io('/'); //importing sockets.io

const videoGrid=document.getElementById('video-grid');
const myVideo=document.createElement('video');
myVideo.muted=true;

/*let's create a new peer connection */
var peer = new Peer(undefined, {
    path: '/peerjs', 
    host: '/',
    port: '8080'
});
/*promise */
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true,
}).then((stream) => {
    myVideoStream=stream;
    addVideoStream(myVideo,stream);

    peer.on('call', (call) => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
             addVideoStream(video, userVideoStream)
        })
    })
    socket.on('user-connected',(userId) => {
        connecToNewUser(userId, stream);
    })
    socket.on('user-disconnected',(userId) => {
        connecToNewUser(userId, stream);
    })
    

    /*chat-box */
    let text = $('input');

    $('html').keydown((e) =>{
      if(e.which == 13 && text.val().length !== 0){
          socket.emit('message', text.val());
          text.val('')
      }
    });
    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom()
      });
 

})


peer.on('open', id =>{
   socket.emit('join-room',ROOM_ID,id);
})


/* hey I have joined the room
socket.emit('join-room',ROOM_ID);
*/
const connecToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });
    call.on('close', () =>{
        video.remove()
    })
   
}

const addVideoStream=(video,stream) => {
    video.srcObject=stream;
    video.addEventListener('loadedmetadata',() => {
        video.play();
    })
    videoGrid.append(video);
}


/*for scrolling the chat */
  const scrollToBottom = () =>{
      let d = $('.main__chat_window');
      d.scrollTop(d.prop("scrollHeight"));
  }

  /*mute the video */
  const muteUnmute = () => {
      const enabled = myVideoStream.getAudioTracks()[0].enabled;
      if(enabled){
          myVideoStream.getAudioTracks()[0].enabled = false;
          setUnmuteButton();
      }
      else{
          setMuteButton();
          myVideoStream.getAudioTracks()[0].enabled = true;
      }
  }

  const setMuteButton = () => {
      const html = `<i class="fas fa-microphone"></i>
      <span>Mute</span>`
      document.querySelector('.main__mute_button').innerHTML = html;
  }

  const setUnmuteButton = () => {
    const html = `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`
    document.querySelector('.main__mute_button').innerHTML = html;
  }

  /*stop the video */
  const playStop = () => {
      let enabled = myVideoStream.getVideoTracks()[0].enabled;
      if(enabled){
          myVideoStream.getVideoTracks()[0].enabled = false;
          setPlayVideo()
      }
      else{
          setStopVideo()
          myVideoStream.getVideoTracks()[0].enabled = true;
      }
  }

  const setStopVideo = () => {
      const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>`
      document.querySelector('.main__video_button').innerHTML = html;
  }

  const setPlayVideo = () => {
   const html = `
   <i class="stop fas fa-video-slash"></i>
   <span>Play Video</span>`
   document.querySelector('.main__video_button').innerHTML =html;
  }
/* subTitles*/

let result = document.getElementById('result');
  
		function startConverting () {

		if('webkitSpeechRecognition' in window) {
			var speechRecognizer = new webkitSpeechRecognition();
			speechRecognizer.continuous = true;
			speechRecognizer.interimResults = true;
			speechRecognizer.lang = 'en-US';
			speechRecognizer.start();

			var finalTranscripts = '';

			speechRecognizer.onresult = function(event) {
				var interimTranscripts = '';
				for(var i = event.resultIndex; i < event.results.length; i++){
					var transcript = event.results[i][0].transcript;
					transcript.replace("\n", "<br>");
					if(event.results[i].isFinal) {
						finalTranscripts += transcript;
					}else{
						interimTranscripts += transcript;
					}
				}
				result.innerHTML = finalTranscripts + '<span style="color: #999">' + interimTranscripts + '</span>';
			};
			speechRecognizer.onerror = function (event) {

			};
		}else {
			result.innerHTML = 'Your browser is not supported. Please download Google chrome or Update your Google chrome!!';
		}	
		}
        
       /*invite */
        const cancel = () => { // Hide our invite modalwhen we click cancel
            $("#getCodeModal").modal("hide");
        };
        
        const copy = async() => { // copy our Invitation link when we press the copy button
            const roomid = document.getElementById("roomId").innerText;
            await navigator.clipboard.writeText("http://localhost:8080/" + roomid);
        };
        const invitebox = () => { // SHow our model when we click
            $("#getCodeModal").modal("show");
        };
