const express = require("express"); //import express
const { chats } = require("./data/data"); //for testing
const dotenv = require("dotenv"); //for loading environment variables
const connectDB = require("./Config/db");
const colors = require("colors"); //for console text coloring
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

dotenv.config(); //Loads environment variables from .env file

connectDB(); //To connect to mongodb
const app = express(); //create express app

app.use(express.json()); //to accept json data

app.use("/api/user", userRoutes); //Route handlers for user and chat related endpoints
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//----------------------------Deployment ----------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => res.send("API is running successfully"));
}

//----------------------------Deployment ----------------------------------

app.get("/chats", (req, res) => {
  res.send(chats);
});

// app.get("/chats/:id", (req, res) => {
//   const singleChat = chats.find((c) => c._id.toString() === req.params.id);
//   if (singleChat) {
//     res.send(singleChat);
//   } else {
//     res.status(404).send({ message: "Chat not found" });
//   }
// });

app.use(notFound); //Custom middleware for error handling
app.use(errorHandler);

const Port = process.env.PORT || 5000;

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

server.listen(
  //server start
  Port,
  console.log(`Server running on port ${Port}`.yellow.bold)
);
