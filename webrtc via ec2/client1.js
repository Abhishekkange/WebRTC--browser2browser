// creating a new peer connection
const PeerConnection1 = new RTCPeerConnection(null);
console.log("client connection made")

// create a new Data channel using the connection 
const dataChannel = PeerConnection1.createDataChannel("datachannel");

//ICE certifate event listener ( for connnection 1)
PeerConnection1.addEventListener('icecandidate', function(event){

    console.log("ice candidate created");
    console.log("Ice candidate: "+ event.candidate);

    //share this ICE candidate with client 2 using websockets

});

// creating an Offer
PeerConnection1.createOffer().then((desc)=>{


    //desc gives you the SD. set as local desc for peer1 and remote for peer2
    console.log("offer created successfully");
    console.log(desc.sdp);
    return PeerConnection1.setLocalDescription(desc);
    
}).then(()=>{

    //send this( to peer 2 via web sockets
    console.log("sent to client 2 via web sockets")
});

// data channel things here 

