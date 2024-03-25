const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
mongoose.set('strictQuery', true);
const ConnectToDb = async () => {
    try {
        const connection_url = process.env.DB_CONNECTION_URL;
        await mongoose.connect(connection_url);
        console.log("Server connected databese successfully");
    } catch (error) {
        console.log("Server connection to database failed","error:",error.message);
    }
}


module.exports = {ConnectToDb}