const button = document.getElementById('connectButton');




//Establish connection on button click
button.addEventListener('click', function(){

    const offer = document.getElementById("offer").value;

    //creating a new webRTC connection
    const RemoteConnection = new RTCPeerConnection();
    RemoteConnection.onicecandidate = (event) =>{

        //send the ice candidate to another peer
        console.log("Ice candidate: "+ event.candidate);
    };

    RemoteConnection.ondatachannel  = (event) =>{

        //this returns the data channel that is present on the connection as event
        RemoteConnection.        


    }

});
