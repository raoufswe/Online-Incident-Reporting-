const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require("mongoose-url-slugs");

const PostSchema = new Schema ({

        user: {

        type: Schema.Types.ObjectId,
        ref: "users"
         },

        category: {

            type: Schema.Types.ObjectId, 
            ref: "categories"

        },

        title: {
            type: String,
            require: true
        },

        floor: {
            type: String,
            default: 'F1'
        },

        status: {
            type: String,
            default: 'open'
        },

        DirectCause: {
            type: String,
            default: 'Nature'               
        },

        SubDirectCause: {
            type: String,
            default: 'Struck/Hit By'               
        },
        IncidentRating: {
            type: String,
            default: 'R1'               
        },

        IncidentType: {
            type: String,
            default: 'Fire/Explosion'               
        },

        AssignedTo: {
            type: String,
            default: 'Raouf'               
        },
        body: {
            type: String,
            require: true
        },
        file: {
          type: String  
        }, 

        date: {
            type: Date, 
            default: Date.now()

        },
        slug: {

            type: String
        }

}, {usePushEach: true}); 

PostSchema.plugin(URLSlugs('title', {field: 'slug' }));

module.exports = mongoose.model('posts', PostSchema);

