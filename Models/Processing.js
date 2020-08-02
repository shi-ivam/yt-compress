const Mongoose =  require('mongoose');

const ProcessedModel = new Mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    processed:{
        type:Number
    }
})



module.exports = Mongoose.model('Processed',ProcessedModel)