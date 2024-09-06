var express = require('express');
var router = express.Router();

const multer = require('multer');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

function checkFileUpload(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Bạn chỉ được upload file ảnh'));
  }
  cb(null, true);
}

let upload = multer({ storage: storage, fileFilter: checkFileUpload });

const connectDb = require('../models/db');

router.get('/', async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('category');
  const categories = await categoryCollection.find().toArray();
  res.render('category', { categories });
});

router.get('/add', function (req, res, next) {
  res.render('addCat');
});

router.post('/add', upload.single('image'), async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('category');
  let { name, categoryId, description } = req.body;
  let image = req.file.originalname;
  let lastCategory = await categoryCollection.find().sort({ id: -1 }).limit(1).toArray();
  let id = lastCategory[0] ? lastCategory[0].id + 1 : 1;
  let newCategory = { id, name, categoryId, image, description };
  await categoryCollection.insertOne(newCategory);
  res.redirect('/categories');
});

router.get('/edit/:id', async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('category');
  let id = req.params.id;
  const category = await categoryCollection.findOne({ id: parseInt(id) });
  res.render('editCat', { category });
});

router.post('/edit', upload.single('image'), async (req, res, next) => {
  const db = await connectDb();
  const categoryCollection = db.collection('category');
  let { id, name, category, description } = req.body;
  let image = req.file ? req.file.originalname : req.body.imageOld;
  let editCategory = { name, categoryId: category, image, description };
  await categoryCollection.updateOne({ id: parseInt(id) }, { $set: editCategory });
  res.redirect('/categories');
});

router.get('/delete/:id', async (req, res) => {
  let id = req.params.id;
  const db = await connectDb();
  const categoryCollection = db.collection('category');
  await categoryCollection.deleteOne({ id: parseInt(id) });
  res.redirect('/categories');
});

module.exports = router;