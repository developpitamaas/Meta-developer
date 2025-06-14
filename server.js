

// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const Story = require("./routes/facebook/stroy");
// const connectDb = require("./config/database");
// const cors = require('cors');
// const AI = require("./routes/AI");
// const uploadRoutes = require('./routes/yt.js');


// dotenv.config();

// // Initialize database connection
// connectDb();

// const { schedulePosts } = require("./controller/INFB/allposting");

// app.get("/", (req, res) => {
//     res.send("Hello vaibhav Meta Developer is working");
// });

// // Enable CORS
// app.use(cors());   

// // middleware
// app.use(express.json());

// // Initial scheduling when server starts
// schedulePosts();

// // Set up interval to check for new posts periodically (every hour)
// setInterval(schedulePosts, 60 * 60 * 1000);

// // routes
// app.use("/api", Story, AI,uploadRoutes);

// // Start server
// app.listen(5003, () => {
//     console.log(`Server started on port 5003`);
// });


// const dotenv = require("dotenv");
// const path = require("path");
// // Load environment variables from .env file
// const envPath = path.resolve(__dirname, '.env');
// const envResult = dotenv.config({ path: envPath });
// const express = require("express");
// const app = express();
// const Story = require("./routes/facebook/stroy");
// const connectDb = require("./config/database");
// const cors = require('cors');
// const AI = require("./routes/AI");
// const uploadRoutes = require('./routes/yt.js');



// // Check if .env file was loaded correctly
// if (envResult.error) {
//     console.error('⚠️  Error loading .env file:', envResult.error);
//     process.exit(1); // Exit if no .env file
// } else {
//     console.log('✅ Environment variables loaded successfully');
// }

// // Initialize database connection
// connectDb().catch(err => {
//     console.error('❌ Database connection failed:', err);
//     process.exit(1);
// });

// const { schedulePosts } = require("./controller/INFB/allposting");

// app.get("/", (req, res) => {
//     res.send("Hello vaibhav Meta Developer is working");
// });

// // Enable CORS
// app.use(cors());   

// // middleware
// app.use(express.json());

// // Initial scheduling when server starts
// schedulePosts().catch(err => {
//     console.error('❌ Initial scheduling failed:', err);
// });

// // Set up interval to check for new posts periodically (every hour)
// setInterval(() => {
//     schedulePosts().catch(err => {
//         console.error('❌ Scheduled posting failed:', err);
//     });
// }, 60 * 60 * 1000);

// // routes

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('🔥 Server error:', err);
//     res.status(500).json({ error: 'Internal server error' });
// });

// app.use("/api", Story, AI, uploadRoutes);
// // Start server
// console.log("process.env.ACC1CLIENT_ID:", process.env.TEST);

// const PORT = process.env.PORT || 5003;
// app.listen(PORT, () => {
//     console.log(`🚀 Server started on port ${PORT}`);
//     console.log(`🔌 Database URL: ${process.env.TEST}`);
// });


const dotenv = require("dotenv");
const path = require("path");
const envPath = path.resolve(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });
const express = require("express");
const Story = require("./routes/facebook/stroy");
const connectDb = require("./config/database");
const cors = require('cors');
const AI = require("./routes/AI");
const uploadRoutes = require('./routes/yt.js');
const { schedulePosts } = require("./controller/INFB/allposting");

const app = express();


if (envResult.error) {
    console.error('Error loading .env file:', envResult.error);
    process.exit(1);
} else {
    console.log('Environment variables loaded successfully');
}

connectDb().catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});

app.get("/", (req, res) => {
    res.send("Hello vaibhav Meta Developer is working");
});

app.use(cors());
app.use(express.json());

schedulePosts().catch(err => {
    console.error('Initial scheduling failed:', err);
});

setInterval(() => {
    schedulePosts().catch(err => {
        console.error('Scheduled posting failed:', err);
    });
}, 60 * 60 * 1000);

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use("/api", Story, AI, uploadRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`vaibhav Server started on port ${PORT}`);
});
