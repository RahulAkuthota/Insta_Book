import cron from "node-cron";
import dotenv from "dotenv"
import { dbConnect } from "./db/index.js"
import { app } from "./app.js"
import { startBookingExpiryCron } from "./cron/bookingExpiry.cron.js";


 
dotenv.config({path:"./.env"})


dbConnect()
.then
(
    app.listen(process.env.PORT,()=>
    {
        console.log("server is running at port : ",process.env.PORT)
    })
)
.catch((error)=>
{
    console.log("error occured while connecting to database!!!  ",error)
})

startBookingExpiryCron()



