const express = require("express");
const YT = express.Router();
const ytController = require("../controller/YT/createpost");
const accountcontroller = require("../controller/YT/accountcontroller");


YT.route("/post").post(ytController.postYouTubeVideo);
YT.route("/callback/:accountId").get(ytController.handleAuthCallback);


// account
YT.route("/createaccount").post(accountcontroller.createAccount);
YT.route("/updateaccount/:id").put(accountcontroller.updateaccount);
YT.route("/deleteaccount/:id").delete(accountcontroller.deleteaccount);
YT.route("/getaccountbyname/:name").get(accountcontroller.getaccountbyname);



module.exports = YT;   