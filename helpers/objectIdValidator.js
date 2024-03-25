const mongoose = require('mongoose')
async function validateId(id){
    return mongoose.Types.ObjectId.isValid(id);
}


module.exports = {validateId};