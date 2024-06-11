//creating a new Peer connection 
const connection = new RTCPeerConnection();

//creating a Data channel
const dataChannel = connection.createDataChannel("channel");

dataChannel.onmessage = message =>{

    console.log("Message received :"+ message.data);
};

//if connection is opened then
dataChannel.onopen= () =>{

    console.log("Connection opened");
};

//check for new ice candidates
connection.onicecandidate = (event) =>{

    //send the ice candidate to another peer
    console.log("Ice candidate: "+ event.candidate);
};

//creating an offer (client 1 creates and offer and client 2 recieves it)
//It returns a promise 
connection.createOffer().then(offer=>{

    // set this as local description
    console.log("SDP: "+offer.sdp);
    connection.setLocalDescription(offer).then(e=>{

        console.log("local description of client 1 set successfully");
    });




})