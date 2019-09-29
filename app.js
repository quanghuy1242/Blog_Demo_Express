const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const setupPassport = require('./setupPassport');
const dotenv = require('dotenv');

dotenv.config();

const indexRoute = require('./routers/index.route');
const userRoute = require('./routers/user.route');
const blogRoute = require('./routers/blog.route');
const apiRoute = require('./routers/api.route');
const categoryRoute = require('./routers/category.route');

const app = express();

mongoose.connect(process.env.MONGODB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: true
});
setupPassport();

app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.resolve(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true 
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  if (!req.user) {
    res.clearCookie('jwt'); // Nếu server bị sập, lần tới xoá
  }
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

app.use('/', indexRoute);
app.use('/users', userRoute);
app.use('/blog', blogRoute);
app.use('/api', apiRoute);
app.use('/category', categoryRoute);

app.use(function (req, res) {
  res.status(404).render('404', {
    title: 'Không tìm thấy'
  })
});

app.listen(app.get('port'), function() {
  console.log(`Server is running under port ${app.get('port')}`);
});