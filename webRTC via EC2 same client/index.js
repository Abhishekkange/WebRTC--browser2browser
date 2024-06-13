const wss = new WebSocket('wss://chaitanya-garg.com/');
const callBtn = document.getElementById('callBtn');
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



callBtn.addEventListener('click',async function(){

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

});


