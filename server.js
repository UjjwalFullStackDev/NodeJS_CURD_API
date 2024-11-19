import express from 'express'
const app = express()
import 'dotenv/config'
import mongoose from 'mongoose'

const port = process.env.PORT || 4000
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// db connect 


async function dbConnection() {
    const dbConnect = process.env.DB
    try {
        if(!dbConnect) {
            console.log("missing connection string");
        }
        const db = await mongoose.connect(dbConnect)
        if(!db) {
            console.log("db not connected");
        }else{
            console.log("DB connected successfully");
        }
    } catch (error) {
        throw new Error(error)
    }
}
dbConnection()


// Create model
const userModel = new mongoose.Schema({
        username: { type: String, required: true },
        useremail: { type: String, required: true, unique: true },
        mobile: { type: String },
        password: { type: String },
},
{timestamps: true})

const User = mongoose.model("data",userModel)


// Create APIs     Post data 
app.post("/createuser/", async (req, res) => {
    const {username, useremail, mobile, password} = req.body
    try {
        const createUser = new User({ username, useremail, mobile, password });
        const saveUser = await createUser.save();
        res.status(201).json({ message: "User created successfully", data: saveUser });
    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
})


// find all user's data
app.get("/user/", async (req, res)=>{
    try {
        const getUser = await User.find()
        if(getUser) {
            return res.status(200).json({message: "user found", user: getUser})
        }else{
            return res.status(404).json({message: "user not found"})
        }
    } catch (error) {
        return res.status(500).json({message: "something went wrong", error: error.message})
    }
})


// find user data by ID
app.get("/user/:id", async (req, res)=>{
    const {id} = req.params
    if(!id) {
        res.status(400).json({message: "user id is required"})
    }
    try {
        const checkID = await User.findById(id)
        if(!checkID) {
            res.status(404).json({message: "Invalid user id"})
        }else{
            res.status(200).json({message: "user fetch successfully", data: checkID})
        }
    } catch (error) {
        res.status(500).json({message: "something went wrong", error: error.message})
    }
})


// delete user by id
app.delete("/deleteuser/:id", async (req, res)=>{
    const {id} = req.params
    if(!id) {
        res.status(400).json({message: "user id is required"})
    }
    try {
        const checkID = await User.findById(id)
        if(!checkID) {
            res.status(404).json({message: "Invalid user id"})
        }
        const deleteUser = await User.findByIdAndDelete(id)
        if(!deleteUser) {
            res.status(400).json({message: "something went wrong while deleting user"})
        }else{
            res.status(200).json({message: "user deleted successfully", data: checkID})
        }
    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error.message})
    }
})


// update user by id
app.put("/updateuser/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Update data is required" });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "Invalid user ID" });
        }
        res.status(200).json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



app.listen(port, ()=> {
    console.log(`server running on http://localhost:${port}`)
})