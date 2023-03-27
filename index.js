//index.js
/*
	This javascript file is meant to be run with node.js.
	The file consists of a server acting as an API. The API will provide interfaces 
	to interact with users for managing files. Users will be able to send and retrieve
	files from the server while providing authentication for access.
*/

const express = require("express")
const body_parser = require('body-parser');
const multer = require("multer");
const util = require("util");
const process = require("./process")

// The app variable will be responsible for all API-related calls.
const app = express();
app.use(body_parser.json());
const upload = multer({dest: 'storage/'});

const server_port = 3000;

// Define API functions

function server_start(){
	console.log(`The server is starting at port ${server_port}`);
}


function add_user(req, res){
	// we will expect the following keys:
	// id: a signed hash of the ethereum address
	// v, r, s: public key
	console.log("Testing add_user function API call");
	var id = req.body["id"];
	var id_hash = req.body["id_hash"];
	var pubkey_v = req.body["pubkey_v"];
	var pubkey_r = req.body["pubkey_r"];
	var pubkey_s = req.body["pubkey_s"];

	// create the new user account extracted from the request
	var identifier = {"id_hash":id_hash, "v":pubkey_v, "r":pubkey_r, "s":pubkey_s };
	console.log(`add_user function called. looking at values from the request:`);
	console.log(`The values from request: ${id} ${id_hash} and ${pubkey_v}, ${pubkey_r}, ${pubkey_s}`);

	var authenticate_valid = process.authenticate(id, identifier);
	var successful_insert = false;
	if(authenticate_valid){
		successful_insert = process.insert_user(id);
	}
	res.send(successful_insert);
}

function upload_file(req, res, next){
	console.log(`\nUpload file API is called.\n`);
	var id = req.body["metadata"]["id"];
	var filename = req.body["metadata"]["filename"];
	var filehash = req.body["metadata"]["filehash"];
	var pubkey_v = req.body["metadata"]["pubkey_v"];
	var pubkey_r = req.body["metadata"]["pubkey_r"];
	var pubkey_s = req.body["metadata"]["pubkey_s"];

	var filecontent = req.body["filecontent"];


	// the user signs the file, and so we check that the user actually owns the file
	var identifier = {"filehash":filehash, "v":pubkey_v, "r":pubkey_r, "s":pubkey_s };
	//var contents = req.file.buffer;
	console.log(`filename ${filename}, filehash ${filehash}, v ${pubkey_v}, r ${pubkey_r}, s ${pubkey_s}`);
	var authenticate_valid = process.authenticate(id, identifier);
	if(authenticate_valid){
		console.log(`The authentication is valid, we can now store the contents: ${filecontent}`);
		try {
			console.log(`This is a test to save a file... replace this with more complex code!`);
			process.manage_upload(id, filename, filecontent);	
		} catch (err) {
			console.log(`This is just a test to save the file! Why did it fail!? ${err}`);
		}
		res.send();
	} else {
		res.send(authenticate_valid);
	}

}

function fin(req, res){
	console.log(`Hi I am just here to give closure`);
	res.send("OK!");
}



// Code to get the server running
app.post("/add_user", add_user);
app.post("/upload_file", upload_file);
app.listen(server_port, server_start);
