const mongoose = require('mongoose')

const dbConnect = () => {
    try {
        mongoose.connect(process.env.MOMGODB_URL)
        console.log("Database connected successfully");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = dbConnect