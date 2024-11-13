const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const Message = require("../Models/messageModel");
const generateToken = require("../Config/generateToken");

//Controller functions handle the logic for each route.
//They interact with the database and send responses back to the client.

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

//  /api/users?search=deepanshi
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});


const cleanupGuestUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (user.email === "guest@example.com") {
      // Delete groups where guest is admin
      await Chat.deleteMany({ 
        groupAdmin: userId,
        isGroupChat: true 
      });

      // Remove guest from other groups
      await Chat.updateMany(
        { 
          users: userId,
          isGroupChat: true,
          groupAdmin: { $ne: userId }
        },
        { $pull: { users: userId } }
      );

      // Delete one-on-one chats
      await Chat.deleteMany({
        isGroupChat: false,
        users: userId
      });

      // Delete guest user messages
      await Message.deleteMany({ sender: userId });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Error in cleanup:", error);
    throw error;
  }
};





module.exports = { registerUser, authUser, allUsers, cleanupGuestUser};
