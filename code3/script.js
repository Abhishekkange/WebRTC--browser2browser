const senderButton = document.getElementById("peer1Submit");
const senderInput = document.getElementById("peer1Input");

//------------------------MAIN function HERE ------

function call() {

    // console.log("function called")


    //connection and calling will start


    //  ---------- PEER 1 Connection --------------------

    //create a new connection for peer1 ( Parameters:STUN and TURN info. in place of NULL)
    const peerConnection1 = new RTCPeerConnection(null);

     //creating a data channel 
     const senderDataChannel = peerConnection1.createDataChannel("datachannel");

    // ----------- PEER 2 Connections --------------------------------

    //creating another connection for peer2
    const peerConnection2 = new RTCPeerConnection(null);
    //accept the data channel from peerConnection1


    //--------------Handeling the ICE Candidate --------------------------------

        // ICE Candidate for PEER 1 Connection created successfully (EVENT)
        peerConnection1.addEventListener('icecandidate', function (data) {

            //ice candidate is updated or created. Now send this to remote Peer
            console.log("sender Ice Candidate");
            console.log(data.candidate);

            //exchange the ice candidate with Peer 2
            peerConnection2.addIceCandidate(data.candidate).then(()=>{

                console.log("Peer 1 ICE shared to Peer 2");

            }); 

    
        });

        //ICE Candidate for PEER 2 Connection created successfully (Event)
        peerConnection2.addEventListener('icecandidate', function (data) {

            console.log("reciever Ice Candidate");
            console.log(data.candidate);

            //exchange the ice candidate with Peer 1
            peerConnection1.addIceCandidate(data.candidate).then(()=>{

                console.log("Peer 2 ICE shared to Peer 1");
            });
        });
   

    // ------------------------------------------------------------
    //create a Offer (SenderOfer)
    peerConnection1.createOffer().then((desc) => {

        console.log("Offer created successfully");
        //promise returns a SDP object
        console.log("SDP : " + desc.sdp);

        //set desc as LocalDescription for peerConnection1 and RemoteDescription 
        // for peerConnection2 (DON'T KNOW WHY ?)
        return peerConnection1.setLocalDescription(desc)
    }
    ).then(() => {

        //setting the offer as remote description for connection 2. This remote
        //description is set using the signaling process.
        return peerConnection2.setRemoteDescription(peerConnection1.localDescription);

    })
        .then(() => {

            //setting the offer as remote description for connection 2. This remote
            //description is set using the signaling process.

            return peerConnection2.createAnswer();

        }).then((answer) => {

            console.log("Reciever's SDP " + answer.sdp);
            return answer;
            //Now set this reciever SDP as local for PEER 1 and Remote for Peer 1.

        }).then((answer) => {

            //set SDP as local for PEER 1 and Remote for PEER 2
            peerConnection2.setLocalDescription(answer);
            peerConnection1.setRemoteDescription(answer);
            console.log("Peer 1 & 2 bot local and remote has been set successfully");


        });

    //-------------------- DATA CHANNEL CREATION -----------------



   
    // create datachannel function doesnot have a callback so use open event for it


    //Event fired when data channel is opened
    senderDataChannel.addEventListener("open", function (dataChannel) {

        //data channel will open when both pairs are connected successfully
        console.log("data channel opened successfully");
        console.log(dataChannel);

       
    });

    //sender button to send messages
    senderButton.addEventListener("click", function(){

       
        const data = senderInput.value;
        senderDataChannel.send(data);
       


    });

    peerConnection2.addEventListener("datachannel", function (event) {

        const recieverDataChannel = event.channel;
        console.log("Reciever data channel received");
        console.log(recieverDataChannel);

        recieverDataChannel.addEventListener("message", function (event){

            console.log(event.data);
            alert("message from Peer 1 :"+event.data);


        });



    });

    //------------------------ DATA SHARING --------------------------------

    

  














}

call();