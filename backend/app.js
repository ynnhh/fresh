var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');
// var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var shopRouter = require('./routes/shop');
var detailRouter = require('./routes/detail');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var categoriesRouter = require('./routes/categories');
var loginRouter = require('./routes/login');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
var app = express();
app.use(cors());
var apiRouter=require('./routes/api');
app.use('/api',apiRouter);

/// xử lý lỗi email. res.body undefined

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu form-encoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/shop', shopRouter);
app.use('/detail', detailRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/login', loginRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.listen(3000, () => {
//   console.log('Máy chủ đang lắng nghe trên cổng 3000');
// });

module.exports = app;
