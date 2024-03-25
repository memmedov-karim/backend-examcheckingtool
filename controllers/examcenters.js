//MODEL
const {User} = require('../models/user.js');


//HELPERS
const {validateRequiredFields} = require('../helpers/validateRequiredFields.js');
const {validateId} = require('../helpers/objectIdValidator.js');


const addexamcenter = async (req,res,next) => {
    try {
        const {name,code,location} = req.body;
        const {userId} = req.params;
        if(!await validateId(userId)) throw {status:400,message:'Invalid Id format'}
        const user = await User.findById(userId);
        if(!user) throw {status:404,message:'User not found'};
        await validateRequiredFields(req,res,'name','location');
        const exsistingCenter = user.examcenters.find(center=>center.name === name);
        if(exsistingCenter) throw {status:400,message:`${name} already exsist`};
        user.examcenters.push({name,code,location});
        await user.save();
        return res.status(200).json({success:true,message:`${name} added succesfully`});       
    } catch (error) {
        next(error);
    }
}

const updateexamcenter = async (req,res,next) => {
    try {
        const {newname,newcode,newlocation} = req.body;
        const {userId,examcenterId} = req.params;
        if(!await validateId(userId) || !await validateId(examcenterId)) throw {status:400,message:'Invalid Id format'};
        const user = await User.findById(userId);
        if(!user) throw {status:404,message:'User not found'};
        const examcenterindex = user.examcenters?.findIndex(ach=>ach._id.toString()===examcenterId);
        if(examcenterindex === -1) throw {status:404,message:'Examcenter not found'};
        const {name,code,location} = user.examcenters[examcenterindex]
        const updatedexamcenter = await User.findOneAndUpdate(
            {'examcenters._id':examcenterId},
            {
            $set:
            {
                'examcenters.$.name':newname || name,
                'examcenters.$.code':newcode || code,
                'examcenters.$.location':newlocation || location
            }
            },
            {
                new:true
            }
        );
        return res.status(200).json({success:true,message:name + ' updated successfully',data:updatedexamcenter.examcenters[examcenterindex]});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    addexamcenter,
    updateexamcenter
}