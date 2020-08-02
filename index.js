const express = require('express');
const app = express();
const path = require('path');
const hbjs = require('handbrake-js')
const fileUpload = require('express-fileupload')
const cors = require('cors');
const mongoose = require('mongoose');
const uuid = require('uuid');


// Importing Models

const ProcessedModel = require('./Models/Processing');

app.use(cors())
app.use(fileUpload());
app.use(express.static('static'))

mongoose.connect('mongodb+srv://dbuser:qBg8xRROddpUfxya@coderkill-3vlzw.mongodb.net/press?retryWrites=true&w=majority',{ useUnifiedTopology: true ,useNewUrlParser: true })
.then(() => {console.log('Connected to Mongodb Database')})
.catch(() => { console.log('Error in Connecting') })


app.get("/",(req,res) => {
  res.sendFile(path.join(__dirname,'build/index.html'))
})


app.post('/upload', function(req, res) {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  var video = req.files.foo;
  var fileName = req.body.fileName;
  // Use the mv() method to place the file somewhere on your server
  video.mv('static/uploads/' + fileName + '.mp4' , function(err) {
  if(err){
    console.log(err);
  }else{
    const id = uuid.v4();
    console.log("uploaded");
    res.send({type:'Uploaded',uuid:id})

    ProcessedModel.create({
      id,
      processed:0
    })
    .then(() => {
      console.log('Created')
      hbjs.spawn({
        'preset-import-file': "./presets.json",
        'preset': 'one',
        input: `./static/uploads/${fileName}.mp4`,
        output: `./static/uploads/${fileName}-processed.mp4`
      })
      .on('error', err => {
          console.log('err');
          console.log(err)
      })
      .on('progress', progress => {
        console.log(`Percent complete: ${progress.percentComplete}, ETA: ${progress.eta}`)
        const percent = Math.round(progress.percentComplete);
        if (percent % 2 === 0){
          ProcessedModel.findOneAndUpdate({id:id,processed:percent})
          .then(() => {
          })
          .catch(err => console.log(err))
        }
      })
    })
    .catch(err => console.log(err))
  
  }
 });
});

app.get('/processed-info/:id',(req,res) => {
  ProcessedModel.findOne({id:req.params.id})
  .then((foundInfo) => res.send({percent:foundInfo.processed}))
})

app.listen(process.env.PORT || 5000)
