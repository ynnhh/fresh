var express = require('express');
const { route } = require('.');
var router = express.Router();
const connectDb = require('../models/db');


router.get('/login', async(req, res, next) => {
  const db = await connectDb();
  const usersCollection = db.collection('users')
  const user = await usersCollection.find().toArray();
  res.render('login', {user, logerror: null});
});

router.post('/login', async(req,res,next) => {
  const db = await connectDb();
  const usersCollection = db.collection('users')
  const  {email, password } = req.body;
  
  const user = await usersCollection.findOne({ email: email, password: password});
  if(!user){
    res.render('login', {logerror: 'Tên tài khoản hoặc mật khẩu không đúng'});
  }else if( user.trangthai === 'block'){
    res.render('login', {user, logerror: 'Tài khoản bạn đã bị khóa'});
  }else{
    res.redirect('/users');
  }
})

router.get('/register', async(req, res, next) => {
  res.render('register')
});

router.post('/register', async(req, res, next) => {
  const db = await connectDb();
  const usersCollection = db.collection('users');
  let {firstname, email, password} = req.body;
  console.log(req.body);
  let lastUser = await usersCollection.find().sort({ id: -1 }).limit(1).toArray();
  let id = lastUser[0] ? lastUser[0].id + 1 : 1;
  let role = 1;
  let trangthai = 'active';
  let newUser = {id, firstname, email, password, trangthai, role};
  await usersCollection.insertOne(newUser);
  res.redirect('/users');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

router.get('/', async(req, res, next) => {
  const db = await connectDb();
  const usersCollection = db.collection('users');
  const users = await usersCollection.find().toArray();
  res.render('user', {users});
})

router.get('/block/:id', async(req, res, next) => {
  const id = req.params.id;
  const db = await connectDb();
  const usersCollection = db.collection('users');
  await usersCollection.updateOne({ id: parseInt(id) }, {$set: {trangthai: 'block'} });
  res.redirect('/users');
});

router.get('/active/:id', async(req, res, next) => {
  const id = req.params.id;
  const db = await connectDb();
  const usersCollection = db.collection('users');
  await usersCollection.updateOne({ id: parseInt(id) }, {$set: {trangthai: 'active'} });
  res.redirect('/users');
});

module.exports = router;
