let localStream;
const express = require('express');
const app = express();


app.listen(3400,()=>{

    console.log("listening on PORT 3400");

});

app.post('/camera-in',(req,res)=>{

    




})

var btn = document.getElementById('buttton')

btn.addEventListener('click', function(){

    localStream = navigator.mediaDevices.getUserMedia({video:true});

    //convert the stream to recording 
    const  mediaRecorder = new MediaRecorder(localStream);
    let chunks = [];
    mediaRecorder.ondataavailable = function(event){

        chunks.push(event.data);

    }

    mediaRecorder.onstop = async function() {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await sendBlobToServer(blob);
    };

    // Start recording
    mediaRecorder.start();

});

async function sendBlobToServer(blob) {

    const formData = new FormData();
    formData.append('file', blob, 'video.webm');



}