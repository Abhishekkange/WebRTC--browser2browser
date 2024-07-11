

let localStream;
let ws = new WebSocket('ws://localhost:3400');

let videoPlayer;
videoPlayer = document.getElementById('videoFromSocket');


ws.onopen = () => {

    console.log("web socket opened");

}

ws.onmessage =message =>{

    console.log("message recieved"+message.data);
    const blob = new Blob([message.data], { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    videoPlayer.src = url;
            //console.log(url);
}

var btn = document.getElementById('button')

btn.addEventListener('click', async function(){

    localStream = await navigator.mediaDevices.getUserMedia({video:true});
    console.log(typeof(localStream));
    const mediaRecorder = new MediaRecorder(localStream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            ws.send(event.data);
            console.log("data sent");
        }
    };

    mediaRecorder.start(100); // Send data in chunks of 100ms

});