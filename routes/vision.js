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
	if (req.body.product) {
		let productData = {
			imgPath: req.file.path,
			productName: req.body.product,
			userID: req._passport['session']['user']
		};
		Controllers.visionController.processLabel(productData, res);
	}
	else {
		res.json({
			statusCode: 400,
			message: "Failed: Missing data"
		});
	}
});

router.post('/test', (req, res) => {
	let productData = {
		imgPath: process.env.TEST_IMG,
		productName: "TEST PRODUCT",
		userID: "TEST ID"
	};
	Controllers.visionController.processLabel(productData, res);
});

module.exports = router;