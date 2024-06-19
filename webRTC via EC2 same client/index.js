const wss = new WebSocket('wss://chaitanya-garg.com/');
const localWebSocket = new WebSocket('ws://localhost:3400');

const callBtn = document.getElementById('callBtn');

const remotevideo = document.getElementById('remotevideo');
let localStream,remoteStream;

localWebSocket.onopen = () => {

    console.log("localWebsocket open");

}



const peer = new RTCPeerConnection({iceServers:[
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:global.stun.twilio.com:3478",
      ],
    },
  ],});
const sendBtn = document.getElementById('sendData');
const input = document.getElementById('input');

let senderDataChannel,recieverDataChannel;
senderDataChannel = peer.createDataChannel("channel");
console.log("Data channel created");

peer.addEventListener("icecandidate", event=>{


    const data = {
        type: "icecandidate",
        value: event.candidate
    }
    wss.send(JSON.stringify(data));
    console.log(event.candidate);
    console.log("ice candidated shared");
})

peer.addEventListener("track", event => {
    if (!remoteStream) {
        remoteStream = new MediaStream();
        remotevideo.srcObject = remoteStream;
        //send remote stream using localWebSockets
        //localWebSocket.send(remoteStream);
        

    }
    remoteStream.addTrack(event.track);
    const mediaRecorder = new MediaRecorder(remoteStream, { mimeType: 'video/webm' });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                localWebSocket.send(event.data);
                console.log("data sent");
            }
        };
    
        mediaRecorder.start(100); // Send data in chunks of 100ms
        console.log("remote stream sent");
    console.log("Remote stream received:", event.track);
});



callBtn.addEventListener('click',async function(){

    //get user streama and set as local stream video
    localStream = await navigator.mediaDevices.getUserMedia({video:true});
     document.getElementById('localvideo').srcObject = localStream;

     localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
     console.log("Strean started...");

    const offer = await peer.createOffer();
    peer.setLocalDescription(new RTCSessionDescription(offer));
    //send offer to client
    const data = {
        type:"offer",
        value:offer
    }

    wss.send(JSON.stringify(data));
    console.log("offer sent");
    
});

wss.addEventListener("message", async message=>{

    //decode the message
    try{

   data = JSON.parse(message.data);
    if(data.type === "offer"){

        peer.setRemoteDescription(new RTCSessionDescription(data.value));
        const answer = await peer.createAnswer();
        peer.setLocalDescription(new RTCSessionDescription(answer));
        //send the answer to other peer
        const data2 = {
            type: 'answer',
            value: answer
        }
        wss.send(JSON.stringify(data2));
        console.log("Ansswer sent");



    }else if(data.type === "answer"){

        peer.setRemoteDescription(new RTCSessionDescription(data.value));
        console.log("Answer received");
        console.log("Connection established");

      

    }else if(data.type === "icecandidate"){

        peer.addIceCandidate(data.value);
        console.log("ice candidate of other peer accepted");

        
    }

    }catch{


        console.log(message);
        if(data.type === "icecandidate"){

            peer.addIceCandidate(data.value);
            console.log("ice candidate of other peer accepted");
    
            
        }else{

            console.log("other error");
        }

    }
    
});

senderDataChannel.addEventListener("open",event=>{


    console.log("sender data channel opened");
});

peer.addEventListener("datachannel",event=>{

    if(event.channel){

        recieverDataChannel = event.channel;
        console.log("reciever data channel accepted");

    }



    recieverDataChannel.addEventListener("message",message =>{

        console.log(message);
        console.log("message received successfully");
    
    });


    
    
});

sendBtn.addEventListener("click",function(){

    const data = input.value;
    senderDataChannel.send(data);
    console.log("data sent successfully");

    //send video stream 
   


});




