import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';





   userSchema.pre("save",async function(next){
    if(this.isModified("password"))   
   this.password=await bcrypt.hash(this.password,12);
   })
   
    
   //Method to compare the Password
   userSchema.methods.isPasswordCorrect=async function(password)
   {
       return await bcrypt.compare(password,this.password);
   }
   
   
   //Generate Access Token
   userSchema.methods.generateAccessToken=function(){
        
       const token =jwt.sign({_id:this._id , username:this.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
       return token;
   }
   
   //Method to generate Refresh Token
   userSchema.methods.generateRefreshToken=function(){
        
       const token =jwt.sign({_id:this._id },process.env.REFRESH_TOKEN_SECRET,{expiresIn:'10d'})
       return token;
   }
   
   

export const User=mongoose.model("User",userSchema);


