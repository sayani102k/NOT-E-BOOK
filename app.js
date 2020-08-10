require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app=express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:"Notebook",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/ProjectNotebookDB", { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userSchema=mongoose.Schema({
  email:String,
  password:String
});
const scienceSchema=mongoose.Schema({
  title:String,
  content:String
});
const mathsSchema=mongoose.Schema({
  title:String,
  content:String
});
const socialstudiesSchema=mongoose.Schema({
  title:String,
  content:String
});

userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model("User",userSchema);
const Science=new mongoose.model("Science",scienceSchema);
const Maths=new mongoose.model("Maths",mathsSchema);
const Socialstudies=new mongoose.model("Socialstudies",socialstudiesSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/subject",function(req,res){
  if (req.isAuthenticated()){
  res.render("subject");
} else {
  res.redirect("/login");
}
});
//////////////////////////COMPOSING POSTS//////////////////////////////

app.get("/composescience", function(req, res){
  res.render("composescience");
});

app.post("/composescience", function(req, res){

  const science=new Science({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  science.save(function(err){
    if(!err){
      res.redirect("/composescience");
    }
  });
});
app.get("/composemaths", function(req, res){
  res.render("composemaths");
});

app.post("/composemaths", function(req, res){

  const maths = new Maths({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  maths.save(function(err){
    if(!err){
      res.redirect("/composemaths");
    }
  });
});
app.get("/composeSSt", function(req, res){
  res.render("composeSSt");
});

app.post("/composeSSt", function(req, res){

  const socialstudies=new Socialstudies({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  socialstudies.save(function(err){
    if(!err){
      res.redirect("/composeSSt");
    }
  });
});
/////////////////////////////////////////////////////////////////////

app.get("/subject/:subjectName",function(req,res){
  if(req.params.subjectName==="science"){
    Science.find({},function(err,foundUser){
      if(err){
    console.log(err);
  }else{
    if(foundUser){
        res.render("science",{posts:foundUser});
      }
    }
    })
  }
  if(req.params.subjectName==="maths"){
    Maths.find({},function(err,foundUser){
      if(err){
    console.log(err);
  }else{
    if(foundUser){
        res.render("maths",{posts:foundUser});
      }
    }
    })
  }

  if(req.params.subjectName==="socialstudies"){
    Socialstudies.find({},function(err,foundUser){
      if(err){
    console.log(err);
  }else{
    if(foundUser){
        res.render("socialstudies",{posts:foundUser});
      }
    }
    });
  }
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/subject");
      });
    }
  });
});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/subject");
      });
    }
  });
});

app.post("/subject",function(req,res){
  res.render("subject");
});

var aboutContent1="Hi this is a website made with love for you!";
var aboutContent2="We are here to provide you with amazing facts!";
var aboutContent3="THANKS FOR JOINING US!";
var contactContent="Contact us:abcd@gmail.com"
app.get("/about", function(req, res){
  res.render("about", {aboutContent1: aboutContent1,aboutContent2: aboutContent2,aboutContent3: aboutContent3});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

// app.get("/posts/:postId", function(req, res){
//
//   const requestedPostId =req.params.postId;
//
//   Science.findOne({_id: requestedPostId}, function(err, post){
//       res.render("science",{
//         title: post.title,
//         content: post.content
//       });
//   });
// });


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.listen(3000,function(){
  console.log("Server running on port 3000");
});
