const express = require("express");
const app = express();
// const {schedulePost} = require("./controller/Story/story");
const Story = require("./routes/facebook/stroy")
const connectDb = require("./config/database");
const cors = require('cors');
const {schedulePosts}  = require("./controller/INFB/allposting")




// Enable CORS
app.use(cors());

// middleware
app.use(express.json());
connectDb()

schedulePosts()
// routes
app.use("/api", Story);
// Start server
app.listen(7000, () => {
    console.log(`Server started on port 7000`);
})
