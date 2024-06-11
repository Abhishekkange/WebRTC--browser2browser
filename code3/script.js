


function call(){


    //connection and calling will start

    //create a new connection for peer1
    const peerConnection1 = new RTCPeerConnection(null);
    //creating a data channel 
    peerConnection1.createDataChannel("datachannel",()=>{


        console.log("Data channel created");
    })


    //creating another connection for peer2
    const peerConnection2 = new RTCPeerConnection(null);

    
}