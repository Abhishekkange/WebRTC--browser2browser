const express = require('express');
const app = express();





app.get('/camera', function(req,res){

    const localStream = req.body.file;
    

    






});



app.listen(3000,()=>{


    console.log('server streaming');
   

})