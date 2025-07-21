import mongoose from "mongoose"

 const dbConnect = async()=>{
    try {
        const uri = process.env.MONGO_URI
        await  mongoose.connect(uri);
        console.log("MongoDB connection is Successfull..")
    } catch (error) {
        console.log(error)
    }
}

export default dbConnect;