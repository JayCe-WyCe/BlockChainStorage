//filesyscontrol.js
/*
	This javascript file is used to abstract the metadata management away from
	the main processing code.
*/

const fs = require('fs');

const filename_metatree = "metatree.json";

function load_tree(){
	var metatreejson = fs.readFileSync(filename_metatree)
	var metatree = JSON.parse(metatreejson);
	return metatree;
}

function create_file_entry(id, filename, diskpath){
	// we may wish to create more args after discussion...
	var metatree = load_tree();
	var users_total = metatree.length;
	var file_obj = {"filename": filename,
					"diskpath": diskpath,
					"collaborators": []};
	for(let i=0; i<users_total; i++){
		if(metatree[i]["id"]===id){
			console.log(`Found the user ${id}, attempting to update metatree...`);
			metatree[i]["id"]["files"].push(file_obj);
			console.log(`Metatree now takes the form ${JSON.stringify(metatree)}`);
			fs.writeFileSync(filename_metatree, JSON.stringify(metatree));
			break;
		}
	}
}

function create_user_entry(id){
	// create the basic user
	var metatree = load_tree();
	var user = {"id":id, "files":[]};
	metatree.push(user);
	fs.writeFileSync(filename_metatree, JSON.stringify(metatree));
}

// export all the necessary functions.
module.exports = {"create_user_entry":create_user_entry,
				  "create_file_entry":create_file_entry};