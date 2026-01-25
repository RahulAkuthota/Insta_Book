import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";



const dbConnect=async()=>
{
      try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODBCONNECTION_URI}/${DB_NAME}`);
        console.log(`✅ Successfully connected to DB: ${connectionInstance.connection.name}`);
        console.log(`📍 Host: ${connectionInstance.connection.host}`);
      } catch (error) {
        console.log("❌ Error occurred while connecting to MongoDB:", error);
        process.exit(1);
      }
}


export {dbConnect}