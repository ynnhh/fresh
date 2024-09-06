const express = require('express');
const { route } = require('.');
const router = express.Router();
const multer = require('multer');

//Thiết lập nơi lưu trữ và tên file
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//Kiểm tra file upload
function checkFileUpLoad(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error('Bạn chỉ được upload file ảnh'));
  }
  cb(null, true);
}

//Upload file
let upload = multer({ storage: storage, fileFilter: checkFileUpLoad });

//Thực hiện gọi đến model db
const connectDb = require('../models/db');

// Hàm formatCurrency
function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
  return formatter.format(amount);
}

//Hiển thị trang sản phẩm
router.get('/', async (req, res, next) => {
  const db = await connectDb();
  const productsCollection = db.collection('product');
  const products = await productsCollection.find().toArray();
  res.render('product', { products, formatCurrency }); // Truyền hàm formatCurrency vào template
});

/* GET home page. */
router.get('/', (req, res) => {
  res.render('product', { products });
});

//Get trang thêm sản phẩm
router.get('/add', function (req, res, next) {
  res.render('addPro');
});

//Post thêm sản phẩm
router.post('/add', upload.single('image'), async (req, res, next) => {
  const db = await connectDb();
  const productsCollection = db.collection('product');
  let { name, price, categoryId, description } = req.body;
  let image = req.file.originalname;
  let lastProduct = await productsCollection.find().sort({ id: -1 }).limit(1).toArray();
  let id = lastProduct[0] ? lastProduct[0].id + 1 : 1;
  let newProduct = { id, name, price, categoryId, image, description };
  await productsCollection.insertOne(newProduct);
  res.redirect('/products');
});

// Get trang sửa sản phẩm
router.get('/edit/:id', async (req, res, next) => {
  const db = await connectDb();
  const productsCollection = db.collection('product');

  let id = req.params.id; // Lấy id
  const product = await productsCollection.findOne({ id: parseInt(id) });
  res.render('editPro', { product });
});

// Post sửa sản phẩm từ form
router.post('/edit', upload.single('image'), async (req, res, next) => {
  const db = await connectDb();
  const productsCollection = db.collection('product');
  let { id, name, price, category, description } = req.body;
  let image = req.file ? req.file.originalname : req.body.imageOld;
  let editProduct = { name, price, categoryId: category, image, description };
  await productsCollection.updateOne({ id: parseInt(id) }, { $set: editProduct });
  res.redirect('/products');
});

//
router.get('/delete/:id', async (req, res) => {
  let id = req.params.id;
  const db = await connectDb();
  const productsCollection = db.collection('product');
  await productsCollection.deleteOne({ id: parseInt(id) });
  res.redirect('/products');
});



// router.get('/:id', function (req, res, next) {
//   //let id = req.params.id;
//   let product = products.find(p => p.id == id);
//   if (product) {
//   res.send(`
//       <h3>${product.name}</h3>
//       <h4>${product.price}</h4>
//        <img src="../images/${product.img}" width="200px">
//       <p>${product.description}</p>
//      `);
//   } else {
//     res.send('Không tìm thấy sản phẩm');
//   };
//  });

/* router.get('/add', function (req, res, next) {
  res.render('addPro');
});

router.post('/add', upload.single('img'), function(req, res, next) {
  let{name, price, categoryId, description} = req.body;
  let img=req.file.originalname;
  let id = products[products.length-1].id+1;
  products.push({id, name, price, categoryId, img, description});
  res.redirect('/products');
})


router.get('/edit/:id', function (req, res, next) {
  let id  = req.params.id;
  let product = products.find(p=>p.id==id)
  res.render('editPro',{product});
});

router.post('/edit', upload.single('img'), function(req, res, next) {
  let{id,name, price, categoryId, description} = req.body;
  let img=req.file ? req.file.originalname : req.body.imgOld;
  let index = products.findIndex(p => p.id== id)
  products[index]={id, name, price, categoryId, img, description};
  res.redirect('/products');
})

router.get('/delete/:id', (req, res) => {
  let id = req.params.id;
  let index = products.findIndex(p => p.id == id);
  products.splice(index, 1);
  res.redirect('/products');
}); */


module.exports = router;
