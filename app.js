const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const setupPassport = require('./setupPassport');

const indexRoute = require('./routers/index.route');
const userRoute = require('./routers/user.route');
const blogRoute = require('./routers/blog.route');

const app = express();
mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true, useCreateIndex: true });
setupPassport();

app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.resolve(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: "ghvgBYU8*^*^*VYVJ5)_R@_35",
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
})

app.use('/', indexRoute);
app.use('/users', userRoute);
app.use('/blog', blogRoute)

app.listen(app.get('port'), function() {
  console.log(`Server is running under port ${app.get('port')}`);
});