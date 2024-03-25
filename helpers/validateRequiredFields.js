async function validateRequiredFields(req, res, ...requiredFields) {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw { status: 400, message: field+' is required' };
      }
    }
    return true;
}
module.exports = {validateRequiredFields};