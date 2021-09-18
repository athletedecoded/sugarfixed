require('dotenv').config();
var express = require("express");
var router = express.Router();
var Controllers = require("../controllers");

var { v4: uuidv4 } = require('uuid');
var mime = require('mime-types');
var path = require('path');

const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/uploads'))
    },
    filename: function (req, file, cb) {
      uid = uuidv4();
      cb(null, uid + '.' + mime.extension(file.mimetype))
    }
});
   
var upload = multer({ storage: storage })

router.post('/', upload.single('label'), (req, res) => {
	console.log(req.file);
	let img = req.file
	Controllers.visionController.processLabel(img.path, res)
	res.json({
		statusCode:200,
		message: "Success - label processed"
	})
})

router.post('/test', (req, res) => {
  url = process.env.TEST_URL
  Controllers.visionController.processLabel(url, res)
})

module.exports = router;