//googlebucket.js
/*
	This javascript file is used to abstract the google bucket management away from
	the main processing code.
*/

const storage = require('@google-cloud/storage');

// Uploads a file to a bucket
async function uploadFile(bucketName, filePath, destinationPath, bucket_provider) {
	// file pass the actual file
	// bucket_provider takes the form {projectID, keyFileName}

	const bucket = storage(bucket_provider);
	const options = {destination: destinationPath};

	await storage.bucket(bucketName).upload(filePath, options);
	console.log(`File ${filePath} uploaded to bucket ${bucketName} as ${destinationPath}.`);
}