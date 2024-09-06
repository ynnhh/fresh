var express = require('express');
var router = express.Router();
const multer = require('multer');

//const express = require('express');
//const bodyParser = require('body-parser');
//const bcrypt = require('bcrypt');

//const app = express();
//app.use(bodyParser.json());   

//app.use(bodyParser.urlencoded({ extended: true   
 //}));

//Thiết lập nơi lưu trữ và tên file
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

//Kiểm tra file upload
function checkFileUpLoad(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)){
        return cb(new Error('Bạn chỉ được upload file ảnh'));
    }
        cb(null, true);
}

//Upload file
let upload = multer({ storage: storage, fileFilter: checkFileUpLoad });


//Imort model
const connectDb=require('../models/db');

//trả về json danh sách sản phẩm
router.get('/products', async(req, res, next) => {
    const db = await connectDb();
    const productCollection = db.collection('product');
    const products = await productCollection.find().toArray();
    if(products) {
        res.status(200).json(products);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});
// hot
router.get('/products/hot', async(req, res, next) => {
    const db = await connectDb();
    const productCollection = db.collection('product');
   /// const filter = { hot: true };
    const products = await productCollection.find({hot: true}).toArray();
    if(products) {
        res.status(200).json(products);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});
//Trả về json sản phẩm theo id
router.get('/product/:id', async(req, res, next)=> {
    const db = await connectDb();
    const productCollection = db.collection('product');
    let id = req.params.id;
    const product = await productCollection.findOne({id: parseInt(id)});
    if(product) {
        res.status(200).json(product);
    }else{
        res.status(404).json({message: 'Not found'});
    }
});

//Thêm sản phẩm
router.post('/product',upload.single('image'), async(req, res, next)=>{
    let {name, price, categoryId, description} = req.body;
    let image =req.file.originalname;
    const db = await connectDb();
    const productCollection = db.collection('product');
    let lastProduct = await productCollection.find().sort({id:-1}).limit(1).toArray();
    let id = lastProduct [0] ? lastProduct [0].id+1: 1;
    let newProduct={id,name, price, categoryId, image, description};
    //await productCollection.insertOne (newProduct);
    try {
        const result = await productCollection.insertOne(newProduct);
        // Check if insertedId exists (indicates successful insertion)
        if (result.insertedId) {
        res.status(200).json({ message: "Thêm sản phẩm thành công" });
        } else {
        res.status(500).json({ message: "Thêm sản phẩm thất bại" }); // Consider using 500 for unexpected errors
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" }); // Generic error message for user
    }
})

//Sửa sản phẩm trả về json
router.put('/product/:id', upload.single('image'), async(req, res, next) => {
    let id = req.params.id;
    const db = await connectDb();
    const productCollection = db.collection('product');
    let {name, price, categoryId, description} = req.body;
    if (req.file) {
        var image = req.file.originalname;
    } else {
        let product = await productCollection.findOne({ id: parseInt(id) });
        var image = product.image;
    }
    let editProduct = {name, price, categoryId, image, description};
    //product = await productCollection.updateOne({ id: parseInt(id) }, { $set: editProduct });
    try {
        const result = await productCollection.updateOne({ id: parseInt(id) }, { $set: editProduct });
        if (result.matchedCount) {
          res.status(200).json({ message: "Sửa sản phẩm thành công" });
        } else {
          res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
      }
})

//Xóa sản phẩm trả về json
router.delete('/product/:id', async(req, res, next)=>{
    let id = req.params.id;
    const db = await connectDb();
    const productCollection = db.collection('product');
    //let product=await productCollection.deleteOne({id: parseInt(id)});
    try {
        const result = await productCollection.deleteOne({id: parseInt(id)});
        if (result.deletedCount) {
          res.status(200).json({ message: "Xóa sản phẩm thành công" });
        } else {
          res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
      }
})

//Trả về json theo Id danh mục sản phẩm 
router.get('/products/categoryId/:categoryId', async (req, res, next)=> {
    const db = await connectDb();
    const productCollection = db.collection('product');
    let categoryId = req.params.categoryId;
    const product = await productCollection.find({categoryId: categoryId}).toArray();
    if(product) {
        res.status(200).json(product);
    }else{
        res.status(404).json({message: 'Not found'});
    }
})

//Trả về json theo tên danh mục sản phẩm
router.get('/products/category/:categoryname', async (req, res, next)=> {
    const db = await connectDb();
    const productCollection = db.collection('product');
    const categoryCollection = db.collection('category');
    let categoryname = req.params.categoryname;
    const category = await categoryCollection.findOne({ name: categoryname})
    if(category) {
        const product = await productCollection.find({categoryId: category.id}).toArray();
        if(product) {
            res.status(200).json(product);
        }else {
            res.status(404).json({message:"không tìm thấy sản phẩm"})
        }
    }else{
        res.status(404).json({message: 'Not found'});
    }
})



// //pagination end limit
// router.get('/products/page/:page/limit/:limit', async (req, res, next) => {
//     try {
//         const db = await connectDb();
//         const productCollection = db.collection('product');

//         const perPage = parseInt(req.params.limit) || 1; // Số lượng sản phẩm trên mỗi trang
//         const page = parseInt(req.params.page) || 1; // Trang hiện tại, mặc định là 1

//         // const totalProducts = await productCollection.countDocuments(); // tính tổng sp có trong bảng
//         //const totalPages = Math.ceil(totalProducts / perPage); //tính toán tổng số trang dựa trên tổng số sản phẩm

//         const products = await productCollection
//             .find()
//             .skip((page - 1) * perPage) // bỏ qua trang trước
//             .limit(perPage)
//             .toArray();

//         if (products) {
//             res.status(200).json({
//                 products
//                 //totalPages,
//                 //currentPage: page,
//             });
//         } else {
//             res.status(404).json({ message: 'Not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// tìm kiếm sản phẩm theo tên
router.get('/products/search/:name', async(req, res, next)=> {
    const db = await connectDb();
    const productCollection = db.collection('product');

    let name = req.params.name;
    const product = await productCollection.find({name: {$regex: name, $options:'i'}}).toArray();
    if(product) {
        res.status(200).json(product);
    }else{
        res.status(404).json({message: 'Not found'});
    }
});

// sắp xếp giá và giới hạn sản phẩm
    // tăng dần
router.get('/products/sort/asc/limit/:limit', async (req, res, next) => {
    try {
        const db = await connectDb();
        const productCollection = db.collection('product');

        const perPage = parseInt(req.params.limit) || 10; // Số lượng sản phẩm trên mỗi trang
        

        // const totalProducts = await productCollection.countDocuments(); // tính tổng sp có trong bảng
        //const totalPages = Math.ceil(totalProducts / perPage); //tính toán tổng số trang dựa trên tổng số sản phẩm

        const products = await productCollection
            .find()
            .sort({ price: 1 })
            .limit(perPage)
            .toArray();

        if (products) {
            res.status(200).json({
                products
                //totalPages,
                //currentPage: page,
            });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
//    // giảm dần
   router.get('/products/sort/desc/limit/:limit', async (req, res, next) => {
    try {
        const db = await connectDb();
        const productCollection = db.collection('product');

        const perPage = parseInt(req.params.limit) || 10; // Số lượng sản phẩm trên mỗi trang
        

        // const totalProducts = await productCollection.countDocuments(); // tính tổng sp có trong bảng
        //const totalPages = Math.ceil(totalProducts / perPage); //tính toán tổng số trang dựa trên tổng số sản phẩm

        const products = await productCollection
            .find()
            .sort({ price: -1 }) // giảm
            .limit(perPage)
            .toArray();

        if (products) {
            res.status(200).json({
                products
                //totalPages,
                //currentPage: page,
            });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

////////-----------------CATEGORY-----------------------////////
//trả về json danh sách sản phẩm
router.get('/categories', async(req, res, next) => {
    const db = await connectDb();
    const productCollection = db.collection('category');
    const products = await productCollection.find().toArray();
    if(products) {
        res.status(200).json(products);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

//Trả về json sản phẩm theo id
router.get('/categories/:id', async(req, res, next)=> {
    const db = await connectDb();
    const productCollection = db.collection('category');
    let id = req.params.id;
    const categories = await productCollection.findOne({id: parseInt(id)});
    if(categories) {
        res.status(200).json(categories);
    }else{
        res.status(404).json({message: 'Not found'});
    }
});

//Thêm danh mục
router.post('/categories',upload.single('image'), async(req, res, next)=>{
    let {name} = req.body;
    //let image =req.file.originalname;
    const db = await connectDb();
    const categoryCollection = db.collection('category');
    let lastCat = await categoryCollection.find().sort({id:-1}).limit(1).toArray();
    let id = lastCat [0] ? lastCat [0].id+1: 1;
    let newCat={ id, name };
    //await categoryCollection.insertOne (newCat);
    try {
        const result = await categoryCollection.insertOne(newCat);
        // Check if insertedId exists (indicates successful insertion)
        if (result.insertedId) {
        res.status(200).json({ message: "Thêm danh mục thành công" });
        } else {
        res.status(500).json({ message: "Thêm danh mục thất bại" }); // Consider using 500 for unexpected errors
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" }); // Generic error message for user
    }
})

//Sửa danh mục trả về json
router.put('/categories/:id', upload.single('image'), async(req, res, next) => {
    let id = req.params.id;
    const db = await connectDb();
    const categoryCollection = db.collection('category');
    let {name, description} = req.body;
    if (req.file) {
        var image = req.file.originalname;
    } else {
        let category = await categoryCollection.findOne({ id: parseInt(id) });
        var image = category.image;
    }
    let editCat = {name, image, description};
    //category = await categoryCollection.updateOne({ id: parseInt(id) }, { $set: editCat });
    try {
        const result = await categoryCollection.updateOne({ id: parseInt(id) }, { $set: editCat });
        if (result.matchedCount) {
          res.status(200).json({ message: "Sửa danh mục thành công" });
        } else {
          res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
      }
})

//Xóa danh mục trả về json
router.delete('/categories/:id', async(req, res, next)=>{
    let id = req.params.id;
    const db = await connectDb();
    const categoryCollection = db.collection('category');
    //let category=await categoryCollection.deleteOne({id: parseInt(id)});
    try {
        const result = await categoryCollection.deleteOne({id: parseInt(id)});
        if (result.deletedCount) {
          res.status(200).json({ message: "Xóa danh mục thành công" });
        } else {
          res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
    }
})


router.get('/users', async(req, res, next) => {
    const db = await connectDb();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find().toArray();
    if(users) {
        res.status(200).json(users);
    } else {
        res.status(404).json({message: 'Not found'});
    }
});

const bcrypt = require('bcrypt');
// //Chức năng đăng ký tài khoản mã hóa mật khẩu bằng bcrypt
router.post('/user/register', upload.single('image'),  async(req, res, next)=>{
    const db=await connectDb();
    const userCollection=db.collection('users');
    //let image =req.file.originalname;
    // const email = req.params.email;
    // const password = req.params.password;
    let {email, password} = req.body;
    const user = await userCollection.findOne({email: email});
    if(user){
        res.status(409).json({message: "Email đã tồn tại"});
    }else{
        const lastuser= await userCollection.find().sort({id:-1}).limit(1).toArray();
        const id= lastuser[0] ? lastuser[0].id+1 : 1;
        const salt = bcrypt.genSaltSync(10);
        const hashPassword=bcrypt.hashSync(password,salt);
        const newUser={id:id, email, password: hashPassword, role: 1};
        try { 
            const result = await userCollection.insertOne(newUser);
            if(result.insertedId) {
                //console.log(result);
                res.status(200).json({message: "Đăng ký thành công"});
            } else {
                res.status(500).json({message:"Đăng ký thất bại !"});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Lỗi khi thêm người dùng mới"});
        }
    }
})
//Đăng ký tài khoản với mã hóa mật khẩu bcrypt
// const bcrypt = require('bcrypt');
// router.post('/register',upload.single(''), async (req, res, next) => {
//   const db = await connectDb();
//   const userCollection = db.collection('users');
//   const { email, password } = req.body;
//   const user = await userCollection.findOne({ email });
//   if (user) {
//     return res.status(400).json({ message: "Email đã tồn tại" });
//   }else
//   {
//     const hashPassword = await bcrypt.hash(password, 10);
//     const newUser = { email, password: hashPassword , role: '1' };
//     try {
//       const result = await userCollection.insertOne(newUser);
//       if (result.insertedId) {
//         res.status(200).json({ message: "Đăng ký thành công" });
//       } else {
//         res.status(500).json({ message: "Đăng ký thất bại" });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
//     }
//   }
 
// });

//Chức năng đăng nhập có sử dụng token
const jwt = require('jsonwebtoken');
router.post('/user/login', upload.single('img'), async(req, res, next)=> {
    //let {email, password}= req.body;
    const email = req.body.email;
    const password = req.body.password;
    const db=await connectDb();
    const userCollection=db.collection('users');
    const user=await userCollection.findOne({email: email});
    if (user) {
        if(bcrypt.compareSync (password, user.password)){
            const token = jwt.sign({email: user.email, role: user.role}, 'secretkey', {expiresIn: '300s'});
            res.status(200).json({token: token});
        }
        else{
            res.status(403).json({message: "Email hoặc mật khẩu không chính xác"});
        }
    }
    else{
        res.status(403).json({message: "Email hoặc mật khẩu không chính xác"});
    }
}
);





//Kiểm tra token qua Bearer

router.get('/checktoken', async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'secret', (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
      res.status(200).json({ message: "Token hợp lệ" });
    }
    );
  }
  );
  
  
  //lấy thông tin chi tiết user qua token
  router.get('/detailuser', async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'secret', async (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
      const db = await connectDb();
      const userCollection = db.collection('users');
      const userInfo = await userCollection.findOne({ email: user.email });
      if (userInfo) {
        res.status(200).json(userInfo);
      } else {
        res.status(404).json({ message: "Không tìm thấy user" });
      }
    });
  });



  
//Xác thực token
function authenToken(req, res, next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    jwt.verify(req.token, 'secretkey', (err, authData)=>{
    if(err){
    res.status(403).json({message: "Không có quyền truy cập"});
    }else{
    next();
    }
    })
    }else{
    res.status(403).json({message: "Không có quyền truy cập"});
    }
}


module.exports = router;