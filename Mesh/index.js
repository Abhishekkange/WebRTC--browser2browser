////////////////////variables/////////////////////////
const wss = new WebSocket('wss://chaitanya-garg.com/');
const callBtn = document.getElementById('callBtn');

let ourStream;

class ConnectionData {
    constructor(theirId) {
        this.theirId = theirId;
        console.log("Establishing connection to " + this.theirId);
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
            console.log("Creating our Stream");
            ourStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            ourStream.getTracks().forEach(track => this.peer.addTrack(track, ourStream));
            console.log(ourStream);
        }

        this.peer.addEventListener("track", event => {
            console.log("Tracks received from " + this.theirId);
            if (this.theirStream == undefined) {
                this.theirStream = new MediaStream();
            }
            this.theirStream.addTrack(event.track);

            // Check if the stream is empty or has tracks
            const tracks = this.theirStream.getTracks();
            if (tracks.length === 0) {
                console.log("Stream is empty.");
            } else {
                console.log("Stream has tracks:", tracks);
            }

            const remoteAudio = document.getElementById('remoteAudio');
            const remoteVideo = document.getElementById('remotevideo');
            if (remoteAudio && event.track.kind === 'audio') {
                remoteAudio.srcObject = this.theirStream;
                remoteAudio.autoplay = true;
                remoteAudio.muted = false;
            }

            if (remoteVideo && event.track.kind === 'video') {
                
                const videoStream = new MediaStream([event.track]);
                remoteVideo.srcObject = videoStream;
                console.log("Remote Video Added to Videoplayer");
                console.log("getting video track from videoplayer here here..")
                console.log(remoteVideo.srcObject.getVideoTracks());
       
            }

            wss.send(encode({
                'payloadType': 96,
                'id': this.theirId
            }));
        });

        console.log("Peer fetched and tracks added to " + this.theirId + "'s peer");
    }

    async GenerateOffer() {
        console.log("Generating Offer for " + this.theirId);
        this.offer = await this.peer.createOffer();
        console.log("Offer Generated.");
        console.log(this.offer);
        this.peer.setLocalDescription(new RTCSessionDescription(this.offer));
    }

    async RecieveOffer(offer) {
        console.log("Offer received from " + this.theirId);
        console.log(offer);

        this.peer.setRemoteDescription(new RTCSessionDescription(offer));

        console.log("Creating answer for " + this.theirId);

        this.answer = await this.peer.createAnswer();

        console.log("Answer created.");

        this.peer.setLocalDescription(new RTCSessionDescription(this.answer));
    
    }

    RecieveAnswer(answer) {
        console.log("Answer received from " + this.theirId);

        this.peer.setRemoteDescription(new RTCSessionDescription(answer));
       
    }
}

let RtcConnections = [];

/////////////////////////////////////////////////////
wss.onopen = function () {
    console.log("RTC client connected to server");

    wss.send(encode({
        'payloadType': 99,
    }));
    console.log("Message Sent");
};

wss.onmessage = async function (event) {
    payload = decode(await event.data.arrayBuffer());

    console.log(payload);

    switch (payload.payloadType) {
        case 100:
            // Connect
            RtcConnections.push(new ConnectionData(payload.id));

            var index = RtcConnections.findIndex((t) => t.theirId == payload.id);

            await RtcConnections[index].Initialise();

            await RtcConnections[index].GenerateOffer();

            wss.send(encode({
                'payloadType': 98,
                'id': payload.id,
                'offer': RtcConnections[index].offer
            }));

            console.log("Offer sent to " + payload.id);
            break;
        case 101:
            // Offer

            RtcConnections.push(new ConnectionData(payload.id));

            var index = RtcConnections.findIndex((t) => t.theirId == payload.id);

            await RtcConnections[index].Initialise();

            await RtcConnections[index].RecieveOffer(payload.offer);

            wss.send(encode({
                'payloadType': 97,
                'id': payload.id,
                'answer': RtcConnections[index].answer
            }));

            console.log("Answer sent to " + payload.id);
            break;
        case 102:
            // Answer

            var index = RtcConnections.findIndex((t) => t.theirId == payload.id);

            await RtcConnections[index].RecieveAnswer(payload.answer);

            break;
        case 103:
            // Disconnect
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
    console.log("Started");
}

callBtn.addEventListener('click', () => { InitiateNewConnection("Test"); });
