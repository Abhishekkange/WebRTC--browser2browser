const wss = new WebSocket('wss://chaitanya-garg.com/');
const shareICE = document.getElementById('peer2ShareIce');
let isIceCandidateFound2 = false;
let candidate;

wss.addEventListener('open', function () {

    console.log("websocket conncted to server");

});

//create a peer connection 
const PeerConnection2 = new RTCPeerConnection(null);


console.log("new peer connection created");
PeerConnection2.addEventListener("icecandidate", event => {
    console.log("ICE candidate generated" + event.candidate);
    candidate = event.candidate;

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
            PeerConnection2.setLocalDescription(answer);            wss.send(JSON.stringify(data));

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

shareIce.addEventListener("click", function () {

    if (isIceCandidateFound2) {

        const data = {

            type: "ICE",
            value: candidate

        }
        wss.send(data);


    } else {

        console.log("Ice candidate not found");


    }


})


