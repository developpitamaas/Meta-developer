// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const Story = require("./routes/facebook/stroy")
// const connectDb = require("./config/database");
// const cors = require('cors');
// const AI = require("./routes/AI");

// dotenv.config();

// const {schedulePosts}  = require("./controller/INFB/allposting")


// app.get("/", (req, res) => {
//     res.send("Hello vaibhav Meta Developer is working");
// })


// // Enable CORS
// app.use(cors());   

// // middleware
// app.use(express.json());
// connectDb()

// schedulePosts()  
// // routes
// app.use("/api", Story,AI);
// // Start server
// app.listen(5003, () => {
//     console.log(`Server started on port 5003`);
// })



const express = require("express");
const app = express();
const dotenv = require("dotenv");
const Story = require("./routes/facebook/stroy");
const connectDb = require("./config/database");
const cors = require('cors');
const AI = require("./routes/AI");

dotenv.config();

// Initialize database connection
connectDb();

const { schedulePosts } = require("./controller/INFB/allposting");

app.get("/", (req, res) => {
    res.send("Hello vaibhav Meta Developer is working");
});

// Enable CORS
app.use(cors());   

// middleware
app.use(express.json());

// Initial scheduling when server starts
schedulePosts();

// Set up interval to check for new posts periodically (every hour)
setInterval(schedulePosts, 60 * 60 * 1000);

// routes
app.use("/api", Story, AI);

// Start server
app.listen(5003, () => {
    console.log(`Server started on port 5003`);
});