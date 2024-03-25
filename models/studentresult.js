const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentresultSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    exam:{
        type:Schema.Types.ObjectId,
        requ:true,
        ref:'Exam'
    },
    results:[
        {
            type:Object,
        }
    ]

},{timestamps:true})
const Studentresult = mongoose.model('studentresults',studentresultSchema);
module.exports = {Studentresult}