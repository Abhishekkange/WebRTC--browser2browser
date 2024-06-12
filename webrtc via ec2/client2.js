const wss = new WebSocket('wss://chaitanya-garg.com/');

wss.addEventListener('open', function () {

    console.log("websocket conncted to server");

});

//create a peer connection 
const PeerConnection2 = new RTCPeerConnection(null);

console.log("new peer connection created");

PeerConnection2.addEventListener("icecandidate", event =>{


    console.log("ICE candidate generated"+ event.candidate);
    //send it through web sockets
    const data = {

        type: "ICE",
        value: event.candidate

    }
    wss.send(data);

})

wss.addEventListener('message', data => {

    console.log(data.data);
    const data2 = JSON.parse(data.data);
    console.log(data2);
    const type = data2.type;
    const value = data2.value;

    if (type === 'offer') {

        PeerConnection2.createAnswer().then(answer => {

            const data = {

                type: 'answer',
                value: answer
            }
            wss.send(JSON.stringify(data));

        })


    }

    if (type == 'SDP') {

        PeerConnection2.setRemoteDescription(value);
        console.log("Remote Description set successfully" + value);


    }
    else if (type == 'ICE') {

        PeerConnection2.addIceCandidate(value);
        console.log("ICE candidate set successfully" + value);


    }

})



