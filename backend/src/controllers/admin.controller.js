import {Organizer} from "../models/organizer.model.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/AsyncHandler.js";

const getPendingOrganizers = asyncHandler( async (req,res)=>{
    const organizers= await Organizer.find({isVerified:false}).populate("userId","name email")
    if (organizers.length==0){
        return res.status(200).json(
            new ApiResponse(200,[],"No pending requests")
        )
    }
    return res.status(200).json(
        new ApiResponse(200,organizers,"Pending requests are fetched")
    )

})

const approveOrganizer = asyncHandler( async (req,res) => {
    const { organizerId } =  req.params
    const organizer = await Organizer.findById(organizerId)

    if(!organizer){
        throw new ApiError(404,"Organizer not found")
    }

    if(organizer.isVerified){
        throw new ApiError(400,"Organizer already Approved")
    }

    organizer.isVerified=true
    organizer.organizerStatus="APPROVED"
    await organizer.save()

    return res.status(200).json(
        new ApiResponse(200,organizer,"Organizer approved")
    )
})

export {getPendingOrganizers,approveOrganizer}