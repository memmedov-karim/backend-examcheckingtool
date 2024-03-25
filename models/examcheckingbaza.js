const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examcheckingbazaSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    name:{
        type:String,
        required:true
    },
    txtfile:{
        type:String,
        default:null
    },
    incorrectanswer:{
        type:Number,
        default:0.25
    },
    studentprivateinfodetails:[{
        fieldName:{
            type:String,
            required:true
        },
        interval:{
            type:Array,
            required:true
        }
    }],
    allcorrectanswers:[
        {
            class: {
                type: String,
                default:""
            },
            sector: {
                type: String,
                default:""
            },
            variant:{
                type:String,
                default:""
            },
            subject:{
                type:String,
                default:""
            },
            corretanswerseachvariant:[
                {
                    subject:{
                        type:String,
                        required:true
                    },
                    interval:{
                        type:Array
                    },
                    correctanswerseachsubject:[
                        {
                            correctanswer:{
                                type:String,
                                required: function() {
                                    return !this.isopenquestion;
                                }
                            },
                            mark:{
                                type:Number,
                                required:true,
                                default:1
                            },
                            isopenquestion:{
                                type:Boolean,
                                required:true,
                                default:false
                            }
                        }
                    ]
                }
            ]
        }
    ]
},{timestamps:true})



const Examcheckingbaza = mongoose.model('examcheckingbazas',examcheckingbazaSchema);

module.exports = {Examcheckingbaza};