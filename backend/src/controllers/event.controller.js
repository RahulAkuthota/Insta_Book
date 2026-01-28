import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, date, location, startTime } = req.body;

  if (!title || !description || !category || !date || !location || !startTime) {
    throw new ApiError(400, "All fields are mandatory");
  }

  const organizer = req.organizer;
  if (!organizer) {
    throw new ApiError(401, "Organizer not found");
  }

  const existingEvent = await Event.findOne({
    organizerId: organizer._id,
    title,
    description,
    category,
    date,
    location,
    startTime,
  });

  if (existingEvent) {
    throw new ApiError(409, "Event already exists");
  }

  const createdEvent = await Event.create({
    organizerId: organizer._id,
    title,
    description,
    category,
    date,
    startTime,
    location,
    isPublished: false,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdEvent, "Event created successfully")
    );
});


const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    throw new ApiError(400, "Event ID is required");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  //  Ownership check
  if (event.organizerId.toString() !== req.organizer._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this event");
  }

  const { title, description, category, date, location, startTime } = req.body;


  if (title) event.title = title;
  if (description) event.description = description;
  if (category) event.category = category;
  if (date) event.date = date;
  if (location) event.location = location;
  if (startTime) event.startTime = startTime;


   const duplicateEvent = await Event.findOne({
    organizerId: req.organizer._id,
    title:event.title,
    description:event.description,
    date:event.date,
    category:event.category,
    location:event.location,
    startTime:event.startTime,
    _id: { $ne: eventId },
  });

  if (duplicateEvent) {
    throw new ApiError(409, "Event already exists with same details");
  }

  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event updated successfully"));
});



const deleteEvent= asyncHandler(async (req,res)=>{
    const {eventId} = req.params

    const event = await Event.findById(eventId)

    if(!event){
        throw new ApiError(404,"There is no such Event")
    }

    if(req.organizer._id.toString()!=event.organizerId.toString()){
        throw new ApiError(403,"Organizer Access needed")
    }

   await event.deleteOne();

    return res.status(200).json(
        new ApiResponse(200,null,"Event deleted Succesfully")
    )
})

const getEventById = asyncHandler( async (req,res)=>{

  const { eventId } = req.params

  const event = await Event.findById(eventId)

  if(!event){
    throw new ApiError(404,"Event not Found")
  }

  if(req.organizer._id.toString()!==event.organizerId.toString()){
    throw new ApiError(403,"Organizer access needed")
  }

  return res.status(200).json(
    new ApiResponse(200,event,"Event Fetched Succesfully")
  )
  
})



const listOrganizerEvents = asyncHandler( async (req,res)=>{
  
  const events = await Event.find({organizerId:req.organizer._id}).sort({ createdAt: -1 });

  if(events.length===0){
    return res.status(200).json(
      new ApiResponse(200,[],"No Orgainzed Events"))
  }

  return res.status(200).json(
    new ApiResponse(200,events,"Organized Events fetched Succesfully ")
  )

})


export { createEvent,updateEvent,deleteEvent,getEventById,listOrganizerEvents};
