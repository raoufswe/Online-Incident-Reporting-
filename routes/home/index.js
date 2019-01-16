const express = require('express');
const router = express.Router(); 
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const User = require("../../models/User"); 
const bcrypt = require('bcryptjs');
const passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');  
var request = require('request');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

// add your secrete key here 
const RECAPTCHA_SECRET = "";

router.all('/*', (req, res, next)=>{

    req.app.locals.layout = 'home'; 
    next(); 

}); 

router.get('/', (req, res)=>{

    Post.find({}).then(posts => {

        Category.find({}).then(categories=>{

            res.render("home/index", {posts : posts, categories: categories }); 

        })

        
    })
    
});

router.get('/about', (req, res)=>{

    res.render("home/about"); 
});

router.post('/about', (req, res)=>{

    var recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + request.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + request.connection.remoteAddress;
    Request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return response.send({ "message": "Captcha validation failed" });
        }
        response.header("Content-Type", "application/json").send(body);
    });

    res.render("home/about"); 
});


router.get('/login', (req, res)=>{

    res.render("home/login"); 
});

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{

User.findOne({email: email}).then(user=> {

    if(!user) return done(null, false, {message: 'User was not found'}); 

    bcrypt.compare(password, user.password, (err, matched)=>{

        if(err) return err; 
        if(matched) {

            return done(null, user); 
        } else {

            return done(null, false, {message: "Incorrect password. "}); 
        }
    });

});

})); 


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


router.post('/login', (req, res, next)=>{

    passport.authenticate('local', {

        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true 

    })(req, res, next); 
});

router.get("/logout", (req, res)=> {

    req.logOut(); 
    res.redirect("/login"); 
}); 

router.get('/register', (req, res)=>{

    res.render("home/register"); 
});

router.post('/register', (req, res)=>{
   

    let errors = [];

    if(!req.body.firstName) {

        errors.push({message: 'please enter your first name'});

    }


    if(!req.body.lastName) {

        errors.push({message: 'please add a last name'});

    }

    if(!req.body.email) {

        errors.push({message: 'please add an email'});

    }

    if(!req.body.password) {

        errors.push({message: 'please enter a password'});

    }


    if(!req.body.passwordConfirm) {

        errors.push({message: ' The confirm password field cannot be blank'});

    }


    if(req.body.password !== req.body.passwordConfirm) {

        errors.push({message: "Password fields don't match"});

    }


    if(errors.length > 0){

        res.render('home/register', {

            errors: errors,
            firstName: req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email
        })

    } else {

        User.findOne({email: req.body.email}).then(user=>{

        if(!user){

            
            const newUser = new User({

                firstName : req.body.firstName,
                lastName : req.body.lastName,
                email : req.body.email,
                password : req.body.password,
        
            });

                bcrypt.genSalt(10, (err, salt)=>{
    
                    bcrypt.hash(newUser.password, salt, (err,hash)=> {
    
                        newUser.password = hash; 
                        if(req.body.adminCode === 'secret123'){
                            newUser.isAdmin = true;
                        }
    
                        newUser.save().then(savedUser=>{
    
                            req.flash('success_message', "You are registered now, you may login!"); 
                           
                            res.redirect("/login");
                        });
    
                    })
                });
           

        } else {

            req.flash('error_message', 'This email exists in our database!, please login!');
            res.redirect('/login');
        }

        }); 


    }
    
});


router.get('/post/:slug', (req, res)=>{

    Post.findOne({slug: req.params.slug})
    .populate('user')
    .then(post => {

        Category.find({}).then(categories=>{

        res.render("home/post", {post: post, categories: categories}); 

     });

    });
});



module.exports = router; 