const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkingmodelSchema = new Schema({
    baza:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Examcheckingbaza'
    },
    resultfiles:{
        type:Array,
        required:true
    },
    successcount:{
        type:Number,
        required:true
    },
    errorcount:{
        type:String,
        required:true
    },
    errorfile:{
        type:String,
        default:''
    }
},{timestamps:true})

const Checkingmodel = mongoose.model('checkingmodels',checkingmodelSchema);
module.exports = {Checkingmodel}