//index.js
/*
	This javascript file is meant to be run with node.js.
	The file consists of a server acting as an API. The API will provide interfaces 
	to interact with users for managing files. Users will be able to send and retrieve
	files from the server while providing authentication for access.
*/

const express = require("express")
const multer = require("multer");
const util = require("util");
const process = require("./process")

// The app variable will be responsible for all API-related calls.
const app = express();
app.use(express.json());

const server_port = 3000;

// Define API functions

function server_start(){
	console.log(`The server is starting at port ${server_port}`);
}


function add_user(req, res){
	console.log("Testing add_user function API call");
	var id = req.body["id"];
	var pubkey = req.body["pubkey"];
	var account = {"id":id, "pubkey":pubkey};

	console.log(`The values extracted from request: ${id} and ${pubkey}`);

	var did_it_insert = process.insert_user(account);

	res.send(did_it_insert);
}

/*
function save_file(req, res){
	var token = req.body["token"];
	var message = req.body["message"];
	console.log(`The token you sent me is ${token}`);
	if(process.check_token(token)){
		console.log("Yes, token passed");
		var metadata = {"destination":"./uploads/",
						"filename":"testfilename"
												};
		var disk = multer.diskStorage(metadata);
		var upload = multer({"storage":disk});
		upload.single("what is supposed to go here idk");
	}
	res.send("Good work!");
}
*/

function upload_file(req, res){
	// we assume upload will perform an overwrite. separate function for update file.
	console.log("\n\nEXPOSE ALL YOUR SECRETS TO ME\n");
	console.log(util.inspect(req.body, {depth: null}));
	var id = req.body["id"];
	var signature = req.body["signature"];
	var filename = req.body["filename"];
	var filedata = req.body["filedata"];
	var metafile = {"id":id, "filename":filename};

	var diskpath = "";
	console.log(`The signature sent is ${signature} for id ${id}`);
	if(process.authenticate(id, signature)){
		console.log("The signature has been verified to be authentic.");
		diskpath = process.manage_upload(metafile);
		var metadata = {"destination":diskpath,
						"filename":filename};
		var storage = multer.diskStorage(metadata);
		var upload = multer({"storage":storage});
		upload.single("filedata");

	}

	res.send(diskpath);

}

// Code to get the server running
app.post("/add_user", add_user);
app.post("/upload_file", upload_file);
app.listen(server_port, server_start);