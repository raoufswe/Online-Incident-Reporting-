const express = require('express');
const router = express.Router();
const faker = require('faker'); 
const Post = require('../../models/Post'); 
const Category = require('../../models/Category');
const User = require('../../models/User');  
const {userAuthenticated} = require("../../helpers/authentication");


router.all('/*',userAuthenticated, (req, res, next)=>{

    req.app.locals.layout = 'admin'; 
    next(); 

}); 

router.get('/', (req, res)=>{

    User.count({}).then(userCount=>{

    Category.count({}).then(categoryCount=> {
    
        Post.count({}).then(postCount=> {

            res.render("admin/index", {postCount: postCount, categoryCount: categoryCount, userCount: userCount}); 

    
});
    
});

});
});



router.post('/generate-fake-posts', (req, res)=>{

       
    for(let i = 0; i < req.body.amount; i++ ){
        let post = new Post();

        post.title = faker.name.title(); 
        post.status = "public"; 
        post.body = faker.lorem.sentence();
        
        post.save(function(err){
            if (err) throw err; 
        });
    }
    res.redirect('/admin/posts');
});




module.exports = router; 