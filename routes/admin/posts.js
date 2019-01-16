const express = require('express');
const router = express.Router(); 
const Post = require('../../models/Post'); 
const {isEmpty, uploadDir} = require("../../helpers/upload-helper"); 
const fs = require('fs');
const path = require("path");
const Category = require("../../models/Category");
const {userAuthenticated} = require("../../helpers/authentication");
const {adminAuthenticated} = require("../../helpers/adminAuth");
router.all('/*', userAuthenticated, (req, res, next)=>{

    req.app.locals.layout = 'admin'; 
    next(); 

}); 


router.get("/", (req, res)=>{

    Post.find({}).populate('category').then(posts=>{

        res.render("admin/posts", {posts: posts});

    });

}); 

router.get("/my-posts", (req,res)=>{

    Post.find({user: req.user.id})
    .populate('category')
    .then(posts=>{

        res.render('admin/posts/my-posts', {posts: posts}); 
    });

});

router.get("/my-postsTry", (req,res)=>{

    Post.find({user: req.user.id})
    .populate('category')
    .then(posts=>{

        res.render('admin/posts/my-postsTry', {posts: posts}); 
    });

});


router.get('/create', (req, res)=>{

    Category.find({}).then(categories=>{

        res.render('admin/posts/create', {categories: categories});

    })
}); 

router.post('/create', (req, res)=>{

    let filename = "1.jpg"; 

    if(!isEmpty(req.files)){

        let file = req.files.file; 
        filename = Date.now() + '-' + file.name; 

        file.mv('./public/uploads/' + filename, (err)=> {

        if(err) throw err; 

    });

    }
    
    const newPost = new Post ({

    
        user: req.user.id, 
        title: req.body.title,
        status: req.body.status,
        body: req.body.body, 
        category: req.body.category,
        file: filename,
        DirectCause: req.body.DirectCause,
        SubDirectCause: req.body.SubDirectCause,
        IncidentRating : req.body.IncidentRating,
        IncidentType : req.body.IncidentType,
        AssignedTo : req.body.AssignedTo

    }); 

    newPost.save().then(savedPost =>{

        req.flash('success_message', `Post ${savedPost.title} was created successfully`); 

        res.redirect('/admin/posts'); 

    })
    
    }); 

    router.get('/edit/:id', (req, res)=>{

        Post.findOne({_id: req.params.id}).then(post=>{
            Category.find({}).then(categories=>{

                res.render('admin/posts/edit', {post: post, categories: categories});
        
            })
    
        });

    }); 

    router.put('/edit/:id', (req, res)=> {


        
        Post.findOne({_id: req.params.id}).then(post=>{
           
            post.user = req.user.id,
            post.title = req.body.title;
            post.status = req.body.status;
            post.body = req.body.body;
            post.category = req.body.category;
            post.DirectCause = req.body.DirectCause; 
            post.SubDirectCause = req.body.SubDirectCause; 
            post.IncidentRating =req.body.IncidentRating; 
            post.IncidentType =req.body.IncidentType; 
            post.AssignedTo =req.body.AssignedTo; 

            if(!isEmpty(req.files)){

                let file = req.files.file;
                filename = Date.now() + '-' + file.name;
                post.file = filename;

                file.mv('./public/uploads/' + filename, (err)=>{

                    if(err) throw err;

                });

            }
            
            post.save().then(updatedPost =>{

                req.flash('success_message', "Post was successfully updated")

              res.redirect("/admin/posts/my-posts"); 

            });
        });
    });


    router.delete('/:id', (req,res)=>{

        Post.findOne({_id: req.params.id})
        
        .then(post=>{
            fs.unlink(uploadDir + post.file, (err)=>{

                post.remove().then(postRemoved=>{
                req.flash('success_message', "Post was successfully deleted")
                res.redirect('/admin/posts/my-posts');

            })
            

        });


    });

});


module.exports = router; 