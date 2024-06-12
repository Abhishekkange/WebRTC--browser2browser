
const wss = new WebSocket('wss://chaitanya-garg.com/');
const button = document.getElementById('peer1Submit');
const createOffer = document.getElementById('peer1CreateOffer');
const shareIce = document.getElementById('peer1IceShare');
const shareSDP = document.getElementById('peer1SdpShare');
const input = document.getElementById('peer1Input');
let isIceCandidateFound = false;
let candidate;

// creating a new peer connection
const PeerConnection1 = new RTCPeerConnection(null);
console.log("client connection made")

wss.addEventListener('open', function () {

    console.log("websocket conncted to server");
    wss.send("Hello");

});



button.addEventListener('click', function () {

    const data = input.value;
    wss.send(data);
    console.log("Message sent" + data);

});


shareIce.addEventListener('click', function () {


    if(isIceCandidateFound)
        {

            const data = {
                type:"ICE",
                value:candidate
            }
            wss.send(JSON.stringify(data));
            console.log('candidate sent');
        }
        else{
            
            console.log("Ice candidate not found");
            
        }
    

});

shareSDP.addEventListener('click', function () {

    //share SDP using web sockets
    const data = {

        type: "SDP",
        value: PeerConnection1.localDescription

    }

    wss.send(JSON.stringify(data));
    console.log("data sent successfully");


});



// create a new Data channel using the connection 
const dataChannel = PeerConnection1.createDataChannel("datachannel");

//ICE certifate event listener ( for connnection 1)
PeerConnection1.addEventListener('icecandidate', function (event) {

    
    isIceCandidateFound = true;
    console.log("ice candidate created");
    console.log("Ice candidate: " + event.candidate);
    candidate = event.candidate;
    console.log("candidate: " + candidate);

    //share this ICE candidate with client 2 using websockets


});


// data channel things here 

dataChannel.addEventListener("open", function () {

    console.log("data channel has been opened");

});



//now send data via button events
createOffer.addEventListener('click', function () {

    // creating an Offer
    PeerConnection1.createOffer().then((desc) => {


        //desc gives you the SD. set as local desc for peer1 and remote for peer2
        console.log("offer created successfully");
        console.log(desc.sdp);
        PeerConnection1.setLocalDescription(desc);
        

    });

   wss.addEventListener("message", data=>{

        const data2 = JSON.parse(data);
        const type = data.type;
        const value = data.value;

        if( type == "answer" )
            {
                PeerConnection1.setRemoteDescription(value);
                console.log("Remote description set for peer 1");
                
            }

   })

});
