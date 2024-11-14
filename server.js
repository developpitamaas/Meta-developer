const express = require("express");
const app = express();
const dotenv = require("dotenv");
const Story = require("./routes/facebook/stroy")
const connectDb = require("./config/database");
const cors = require('cors');
const AI = require("./routes/AI");

dotenv.config();

const {schedulePosts}  = require("./controller/INFB/allposting")




// Enable CORS
app.use(cors());   

// middleware
app.use(express.json());
connectDb()

schedulePosts()  
// routes
app.use("/api", Story,AI);
// Start server
app.listen(4005, () => {
    console.log(`Server started on port 7002`);
})
