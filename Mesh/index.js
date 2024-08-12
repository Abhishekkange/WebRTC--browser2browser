function log(str) {
    console.log(str);
}

////////////////////variables/////////////////////////

const wss = new WebSocket('wss://chaitanya-garg.com/');
const callBtn = document.getElementById('callBtn');

let ourStream;


class ConnectionData {
    constructor(theirId) {
        this.theirId = theirId;
        log("Establishing connection to " + this.theirId);
    }

    async Initialise() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                },
            ],
        });

        if (ourStream == null) {
            log("Creating our Stream");
            ourStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        }

        ourStream.getTracks().forEach(track => this.peer.addTrack(track, ourStream));
        console.log(ourStream.getVideoTracks());

        this.peer.addEventListener("track", event => {
            log("Tracks received from " + this.theirId);
            if (this.theirStream == undefined) {
                log("Creating new media stream");
                this.theirStream = new MediaStream();
            }

            if(event.track.kind == "video")
            {
             const remoteVideo = document.createElement("video");
            remoteVideo.autoplay = true;
            this.theirStream.addTrack(event.track);
            remoteVideo.srcObject = this.theirStream;
            document.getElementById("peerVideo").appendChild(remoteVideo);

            }
            if(event.track.kind == "audio")
            {
                const remoteAudio = document.createElement("audio");
                remoteAudio.autoplay = true;
                this.theirStream.addTrack(event.track);
                remoteAudio.srcObject = this.theirStream;
                document.getElementById("peerVideo").appendChild(remoteAudio);

            }
            wss.send(encode({
                'payloadType': 96,
                'id': this.theirId
            }))
        });

        this.peer.addEventListener("icecandidate", event => {

            log("Sending new Ice to " + this.theirId + ".");

            wss.send(encode({
                'payloadType': 95,
                'id': this.theirId,
                'ice': event.candidate
            }));
        });

        log("Peer fetched and tracks added to " + this.theirId + "'s peer");
    }

    async GenerateOffer() {
        log("Generating Offer for " + this.theirId);
        this.offer = await this.peer.createOffer();
        log("Offer Generated for " + this.theirId);
        this.peer.setLocalDescription(new RTCSessionDescription(this.offer));
    }

    async RecieveOffer(offer) {

        log("Offer recieved from " + this.theirId +": "+offer);

        this.peer.setRemoteDescription(new RTCSessionDescription(offer));

        log("Creating answer for " + this.theirId);

        this.answer = await this.peer.createAnswer();

        log("Answer created.");

        this.peer.setLocalDescription(new RTCSessionDescription(this.answer));
    }

    RecieveAnswer(answer) {
        log("Answer recieved from " + this.theirId);

        this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    }

}

let RtcConnections = [];

/////////////////////////////////////////////////////
wss.onopen = function () {
    log("RTC client connected to server");

    wss.send(encode({
        'payloadType': 99,
    }));
    log("Message Sent");
};

wss.onmessage = async function (event) {
    let payload = decode(await event.data.arrayBuffer());

    log(payload);

    switch (payload.payloadType) {
        case 100:
            // Connect
            RtcConnections.push(new ConnectionData(payload.id));

            var index = RtcConnections.findIndex((t) => t.theirId == payload.id)

            await RtcConnections[index].Initialise();

            await RtcConnections[index].GenerateOffer();

            wss.send(encode({
                'payloadType': 98,
                'id': payload.id,
                'offer': RtcConnections[index].offer
            }))

            console.log(RtcConnections[index].offer);
            console.log("Offer sent to " + payload.id);
            break;
        case 101:
            // Offer

            RtcConnections.push(new ConnectionData(payload.id));

            var index = RtcConnections.findIndex((t) => t.theirId == payload.id)

            await RtcConnections[index].Initialise();

            await RtcConnections[index].RecieveOffer(payload.offer);

            wss.send(encode({
                'payloadType': 97,
                'id': payload.id,
                'answer': RtcConnections[index].answer
            }))

            console.log("Answer sent to " + payload.id);
            break;
        case 102:
            // Answer

            var index = RtcConnections.findIndex((t) => t.theirId == payload.id)

            await RtcConnections[index].RecieveAnswer(payload.answer);

            break;
        case 103:
            // Disconnect
            break;
        case 104:
            // Recieved ICE
            var index = -1;
            index = RtcConnections.findIndex((t) => t.theirId == payload.id);

            if (index != -1) {
                if (payload.ice)
                    RtcConnections[index].peer.addIceCandidate(payload.ice);
                else
                    log("Ice Candidate:" + payload.ice);
                log("Successfully registered new Ice from " + payload.id + ".");
            } else {
                log("Cannot find Connection with " + payload.id + ", but got ICE from them.");
            }

            break;
    }
};

function decode(jsonData) {
    return JSON.parse(new TextDecoder("utf-8").decode(jsonData));
}
function encode(stringData) {
    return new TextEncoder("utf-8").encode(JSON.stringify(stringData));
}

////////////////////////////////////////////////////

async function InitiateNewConnection(connectionName) {
    log("Started");
}

callBtn.addEventListener('click', () => { InitiateNewConnection("Test"); });

/*
//get user streama and set as local stream video
ourStream = await navigator.mediaDevices.getUserMedia({ video: true });

ourStream.getTracks().forEach(track => peer.addTrack(track, ourStream));
log("Strean started...");

const offer = await peer.createOffer();

peer.setLocalDescription(new RTCSessionDescription(offer));
//send offer to client
const data = {
    type: "offer",
    value: offer
}

wss.send(JSON.stringify(data));
}
////////////////////////////////////////////////////
peer.addEventListener("track", event => {
    if (!theirStream) {
        theirStream = new MediaStream();
        remoteVideo.srcObject = theirStream;
        //send remote stream using localWebSockets
        //localWebSocket.send(remoteStream);
    }
    theirStream.addTrack(event.track);
    const mediaRecorder = new MediaRecorder(theirStream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            localWebSocket.send(event.data);
            log("data sent");
        }
    };

    mediaRecorder.start(100); // Send data in chunks of 100ms
    log("remote stream sent");
    log("Remote stream received:", event.track);
});

wss.addEventListener("message", async message => {

//decode the message
try {

    data = JSON.parse(message.data);
    if (data.type === "offer") {

        peer.setRemoteDescription(new RTCSessionDescription(data.value));
        const answer = await peer.createAnswer();
        peer.setLocalDescription(new RTCSessionDescription(answer));
        //send the answer to other peer
        const data2 = {
            type: 'answer',
            value: answer
        }
        wss.send(JSON.stringify(data2));
        log("Ansswer sent");



    }
    if (data.type === "answer") {

        peer.setRemoteDescription(new RTCSessionDescription(data.value));
        log("Answer received");
        log("Connection established");



    }

}
});*/