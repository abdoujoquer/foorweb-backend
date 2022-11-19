// Load dependencies
const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');

const app = express();
aws.config.loadFromPath('./config.json');
// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});

// Change bucket property to your Space name
let imageName = ""; 
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'foorweb-backend',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, cb) {
      imageName = Date.now() + file.originalname;
      cb(null, imageName);
    }
  })
}).array('upload', 1);

// Views in public directory
app.use(express.static('public'));

// Main, error and success views
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get("/success", function (request, response) {
  response.sendFile(__dirname + '/public/success.html');
});

app.get("/error", function (request, response) {
  response.sendFile(__dirname + '/public/error.html');
});

app.post('/upload', function (request, response, next) {
  request.header("Access-Control-Allow-Origin", "*");
  upload(request, response, function (error) {
    if (error) {
      console.log(error);
      return response.redirect("/error");
    }
    return response.status(201).json({ url: "https://foorweb-backend.sfo3.digitaloceanspaces.com/" + imageName }); 
  });
});

app.listen(3001, function () {
  console.log('Server listening on port 3001.');
});
