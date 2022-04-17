
const Laptop = require('../models/Laptop');
const LaptopType = require('../models/laptopType');
const Plugin = require('../models/Plugin');
const Comment = require('../models/Comment');
const { default: mongoose } = require('mongoose');
const { response } = require('express');



class SiteController {
    // [GET] /laptop-ldp
    showListLaptop = async(req, res, next) => {
        LaptopType.find({}).populate('laptops').then(async (laptopTypes) => {
            req.laptopTypes = laptopTypes
            next();
        })
        
        
    }

    // [GET] /laptop/:slug
    showLaptopDetail(req, res, next) {
        const { slug } = req.params;
        Laptop.findOne({ slug })
            .populate('plugin')
            .populate('comments')
            .exec(function(err, laptop) {
                if(err) console.log(err);
                else {
                    req.laptop = laptop;
                    next();
                }
            })
    }
    

}


module.exports = new SiteController();