
const Laptop = require('../models/Laptop');
const LaptopType = require('../models/laptopType');
const Comment = require('../models/Comment');
const Plugin = require('../models/Plugin');
const { default: mongoose } = require('mongoose');
const { response } = require('express');
const { ObjectId } = require('mongodb');
const { crossOriginOpenerPolicy } = require('helmet');
const ObjectID = require('mongodb').ObjectID;
const keywords = [
    { g: "laptop-gaming", keyword: "Laptop gaming" },
    { g: "hoc-tap-van-phong", keyword: "Học tập văn phòng" },
    { g: "do-hoa-ky-thuat", keyword: "Đồ họa kĩ thuật" },
    { g: "mong-nhe-thoi-trang", keyword: "Mỏng nhẹ" },
    { g: "cao-cap-sang-trong", keyword: "Cao cấp sang trọng" }
]



class SiteController {
    // [GET] /laptop-ldp
    showListLaptop = async (req, res, next) => {
        LaptopType.find({}).populate({ path: 'laptops', options: { limit: 16 } }).then(async (laptopTypes) => {
            req.laptopTypes = laptopTypes;
            next();
        })
    }
    // [GET] /laptop
    getLaptopByType = async (req, res, next) => {

        const { g } = req.query;
        const keyword = keywords.filter(keyword => {
            return keyword.g === g;
        })
        if (keyword) {
            try {
                const result = await findLaptopsByType(keyword[0].keyword, 0);
                req.result = result;
                next();
            }
            catch (err) {
                res.status(500).send({ err: "Not found" });
            }
        }
        else {
            res.status(500).send({ err: "Invalid laptop type" });
        }


    }
    // [POST] /laptop
    async findMoreLaptop(req, res, next) {
        const { g, pageNumber } = req.body;
        const result = findLaptopsByType(g, parseInt(pageNumber));
        next();
    }
    // [GET] /laptop-apple-macbook
    async getMacbook(req, res, next) {
        const result = await findLaptopsByType("Macbook", 0);
        req.result = result;
        next();
    }

    // [GET] /Common/SuggestSearch
    async suggestSearch(req, res, next) {
        const { keywords } = req.query;
        if (!keywords || keywords == "") {
            req.result({ laptopTypes: [], laptops: [] });
        }
        else {
            try {
                const regex = new RegExp(keywords, 'i');
                const laptopTypes = await LaptopType.find({ name: regex }, { 'name': 1, 'g': 1 });
                const laptops = await Laptop.find({ $or: [{ laptopName: regex }, { laptopType: regex }] }, { 'laptopName': 1, 'thumnail': 1, 'installment': 1, 'onlinePrice': 1, 'price': 1, 'gift': 1, 'slug': 1 }).sort({ "updatedAt": -1 }).sort({ "createdAt": -1 }).limit(5);
                req.result = { laptopTypes, laptops };

            } catch (err) {
                ;
                return res.send({});
            }
        }
        next();
    }


    // [GET] /tim-kiem
    async searchLaptop(req, res, next) {
        const { keyword } = req.query;
        if (keyword) {
            try {
                const regex = new RegExp(keyword, 'i');
                const laptops = await Laptop.find({ $or: [{ laptopName: regex }, { laptopType: regex }] }, { 'laptopName': 1, 'thumnail': 1, 'installment': 1, 'configuration': 1, 'onlinePrice': 1, 'price': 1, 'gift': 1, 'rate': 1, 'shortName': 1, 'isBusiness': 1, 'slug': 1 }).sort({ "updatedAt": -1 }).sort({ "createdAt": -1 });
                const total = laptops.length;
                req.result = { laptops: laptops.splice(0, 16), total, remain: total >= 16 ? (total - 1 * 16) : 0 };
                next();
            } catch (err) {
                return res.status(500).send({ error: 'not found' });
            }
        }
    }

    // [POST] /Search/Product
    postSearchProduct(req, res, next) {
        searchLaptop(req, res, next);
    }

    // [GET] /laptop/:slug
    showLaptopDetail(req, res, next) {
        const { slug } = req.params;
        Laptop.findOne({ slug })
            .populate('plugin')
            .populate({ path: 'comments', options: { limit: 2 }, populate: { path: 'user' } })
            .exec(function (err, laptop) {
                if (err) console.log(err);
                else {
                    req.laptop = laptop;
                    next();
                }
            })
    }
    // [POST] /product/comment
    async postComment(req, res, next) {
        const user = req.user._id;
        const { content, laptop } = req.body;
        const newComment = await new Comment({ user, content, laptop });
        try {
            await Laptop.findOneAndUpdate({ _id: laptop }, { $addToSet: { comments: newComment._id } }, { new: true });
            newComment.save();
            Comment.populate(newComment, { path: "user", select: ["userName", "photo"] }, function (err, comment) {
                if (err) console.log(err);
                else if (comment) {
                    req.comment = comment;
                    next();
                }
            })
        } catch (err) {
            console.log(err);
        }
    }
}

async function searchLaptop(req, res, next) {
    const pageSize = 16;
    let { pageIndex, keyword } = req.body;
    if (!pageIndex) pageIndex = 0;
    if (keyword) {
        try {
            const regex = new RegExp(keywords, 'i');
            const laptops = await Laptop.find({ $or: [{ laptopName: regex }, { laptopType: regex }] }, { 'laptopName': 1, 'thumnail': 1, 'installment': 1, 'configuration': 1, 'onlinePrice': 1, 'price': 1, 'gift': 1, 'rate': 1, 'shortName': 1, 'isBusiness': 1, 'slug': 1 }).sort({ "updatedAt": -1 }).sort({ "createdAt": -1 });
            const total = laptops.length;
            req.result = { laptops: laptops.splice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total };
            next();
        } catch (err) {
            console.log(err);
            return res.status(500).send({ error: 'not found' });
        }
    }
}

async function findLaptopsByType(laptopType, numberPage) {
    const laptops = await Laptop.find({ laptopType }, { 'laptopName': 1, 'thumnail': 1, 'installment': 1, 'configuration': 1, 'onlinePrice': 1, 'price': 1, 'gift': 1, 'rate': 1, 'shortName': 1, 'isBusiness': 1, 'slug': 1 }).sort({ "updatedAt": -1 }).sort({ "createdAt": -1 });
    const total = laptops.length;
    return { laptopType, laptops: laptops.splice(numberPage, (numberPage + 1) * 16), total, remain: total >= 16 ? (total - (numberPage + 1) * 16) : 0 };
}

module.exports = new SiteController();