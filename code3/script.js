//------------------------Other functions here---------







//------------------------MAIN function HERE ------

function call(){

    // console.log("function called")


    //connection and calling will start


    //  ---------- PEER 1 Connection --------------------

    //create a new connection for peer1
    const peerConnection1 = new RTCPeerConnection(null);
    //creating a data channel 
    const senderDataChannel = peerConnection1.createDataChannel("datachannel");
    // create datachannel function doesnot have a callback so use open event for it

    //create a Offer (SenderOfer)
    peerConnection1.createOffer().then((desc)=>{

        console.log("Offer created successfully");
        //promise returns a SDP object
        console.log("SDP : " + desc.sdp);

        //set desc as LocalDescription for peerConnection1 and RemoteDescription 
        // for peerConnection2 (DON'T KNOW WHY ?)
        

    });




    

    //Event fired when data channel is opened
    senderDataChannel.addEventListener("open", function(dataChannel){

        //data channel will open when both pairs are connected successfully
        console.log("data channel opened successfully");
        console.log(dataChannel);
    });


    // ----------- PEER 2 Connections --------------------------------


    //creating another connection for peer2
    const peerConnection2 = new RTCPeerConnection(null);
    //accept the data channel from peerConnection1
    peerConnection2.addEventListener("datachannel",function(event){

        const recieverDataChannel = event.channel;
        console.log("Reciever data channel received");
        console.log(recieverDataChannel);


    });


   
   


}

call();