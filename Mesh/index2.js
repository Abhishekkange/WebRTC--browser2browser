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
            // ourStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            let ourStream;
            console.log(ourStream);
        }

        const videoElement = document.createElement('video');
                videoElement.controls = true;  // Show video controls
                videoElement.autoplay = true;  // Autoplay the video
                videoElement.muted = true;     // Mute the video to comply with autoplay policies
                videoElement.srcObject = ourStream;
                document.body.appendChild(videoElement);

                const mediaRecorder2 = new MediaRecorder(videoElement.srcObject, { mimeType: 'video/webm' });

        mediaRecorder2.ondataavailable = (event) => {
            if (event.data.size > 0) {

                console.log("recording self....");
            }
        };


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
                remoteAudio.muted = false; // Or true, based on your requirement
            }

            if (remoteVideo && event.track.kind === 'video') {
                const videoStream = new MediaStream([event.track]);
                console.log("Remote Video Added to Videoplayer");
                console.log(videoStream.getVideoTracks());
                const mediaRecorder = new MediaRecorder(videoStream, { mimeType: 'video/webm' });

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {

                        console.log("recording....");
                    }
                };

                mediaRecorder.start(100); // Send data in chunks of 100ms
                // const videoElement = document.createElement('video');
                // videoElement.controls = true;  // Show video controls
                // videoElement.autoplay = true;  // Autoplay the video
                // videoElement.muted = true;     // Mute the video to comply with autoplay policies
                // videoElement.srcObject = this.theirStream;
                // document.body.appendChild(videoElement);
                // console.log(remoteVideo.srcObject);
                // // checking streams present in video player
                // const tracks2 = videoElement.srcObject.getTracks();
                // if (tracks2.length === 0) {
                //     console.log("Stream is empty.");
                // } else {
                //     console.log("Stream has tracks:", tracks2);
                // }
                // Or true, based on your requirement
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
        this.peer.setLocalDescription(new RTCSessionDescription(this.offer));
    }

    async RecieveOffer(offer) {
        console.log("Offer received from " + this.theirId);

        this.peer.setRemoteDescription(new RTCSessionDescription(offer));

        console.log("Creating answer for " + this.theirId);

        this.answer = await this.peer.createAnswer();

        console.log("Answer created.");

        this.peer.setLocalDescription(new RTCSessionDescription(this.answer));
        ourStream.getTracks().forEach(track => this.peer.addTrack(track, ourStream));
    }

    RecieveAnswer(answer) {
        console.log("Answer received from " + this.theirId);

        this.peer.setRemoteDescription(new RTCSessionDescription(answer));
        ourStream.getTracks().forEach(track => this.peer.addTrack(track, ourStream));
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
