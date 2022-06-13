const Laptop = require('../models/Laptop');
const LaptopType = require('../models/laptopType');
const Comment = require('../models/Comment');
const Plugin = require('../models/Plugin');
const Cart = require('../models/Cart');
const { default: mongoose } = require('mongoose');
const { response } = require('express');
const { ObjectId } = require('mongodb');

class CartController {
    // [GET] /cart
    displayUserCart(req, res, next) {
      getCart(req.user._id).exec(function(err, cart) {
        if(err) console.log(err);
        else if(cart.length > 0)req.cart = cart[0];
        else req.cart = { status: "empty" }
        next();
      })

    }

    // [POST] /cart/api/product/GetProduct
    async getProduct(req, res) {
      if(req.status === 302)return res.send({ status: 302 });
      const { productId } = req.body;
      const userId = req.user._id;
      try {
        let cart = await Cart.findOne({ userId });
        if(cart) {
          let itemIndex = cart.products.findIndex(p => p.productId == productId );
          if (itemIndex > -1) {
            //product exists in the cart, update the quantity
            let productItem = cart.products[itemIndex];
            if(productItem.quantity >= 5){
              return res.send({ status: "full cart" });
            }
          }
          else {
            return res.send({ status: "passed" });
          }
        }
        return res.send({ status: "passed" })
        
      }
      catch(err) {
        console.log(err);
      }
    }

    // [POST] /cart/api/cart/AddProduct
    async addProduct(req, res) {
      const { productId } = req.body;
      const userId = req.user._id;
      try {
        let cart = await Cart.findOne({ userId });
        let product = await Laptop.findById(productId);
        if(product) {
          if(product.quantity > 0){
            product.quantity--;
            product.save();
          }
          else {
            return res.status(500).send({ status: "not enough products" })
          }
        }
        else {
          return res.status(500).send({ status: "not found" });
        }
        if (cart) {
          //cart exists for user
          let itemIndex = cart.products.findIndex(p => p.productId == productId );
          
          if (itemIndex > -1) {
            //product exists in the cart, update the quantity
            let productItem = cart.products[itemIndex];
            productItem.quantity++;
            cart.products[itemIndex] = productItem;
          } else {
            //product does not exists in cart, add new item
            cart.products.push({ productId, quantity: 1 });
          }
          cart = await cart.save();
          res.send({ status: "Success" })
        } else {
          //no cart for user, create new cart
          const newCart = await Cart.create({
            userId,
            products: [{ productId, quantity: 1 }]
          });
          res.send({ status: "Success" })
        }
      } catch (err) {
        console.log(err);
      }

    }

    // [PATCH] /cart/api/cart/UpdateProduct
    async updateProduct(req, res) {
      const { productId, quantity } = req.body;
      const userId = req.user._id;
      let quantityChanged;
      if(quantity > 5)return res.status(500).send("Something went wrong");
      try{
      let cart = await Cart.findOne({ userId });
      let product = await Laptop.findById(productId, ['_id', 'onlinePrice', 'price', 'quantity']);
      let itemIndex;
      if(cart && product) {
        itemIndex = cart.products.findIndex(p => p.productId == productId);
      }
      else {
        return res.status(500).send({ status: "not found" });
      } 
      if(itemIndex > -1) {
        quantityChanged = quantity - cart.products[itemIndex].quantity;
        if(product.quantity > quantityChanged){
          product.quantity -= quantityChanged;
          cart.products[itemIndex].quantity = quantity;
          await product.save();
          await cart.save();
        }
        else {
          return res.status(500).send({ status: "not enough products" });
        }
      }
      else {
        return res.status(500).send({ status: "not found" });
      }

      getCart(userId).exec(function(err, cart) {
        if(err) console.log(err);
        else if(cart)return res.send(cart[0]);
      })
      }
      catch(err) {
        console.log(err);
      }

      // transaction(req, res);


    }
    // [DELETE] /cart/api/cart/UpdateProduct
    async deleteProduct(req, res) {
      const { productId } = req.body;
      const userId = req.user._id;
      try{
        const cart = await Cart.findOneAndUpdate({ userId }, 
          {
            $pull: { 'products': { 'productId': productId } }
          });
          if(cart) {

            const itemIndex = cart.products.findIndex(p => p.productId == productId);
            const removedQuantity = cart.products[itemIndex].quantity;
            await Laptop.findByIdAndUpdate(productId, { $inc: { quantity: removedQuantity } })
            
          }
          getCart(userId).exec(function(err, cart) {
            if(err) console.log(err);
            else if(cart.length != 0){
              return res.send(cart[0])
            }
            else if(cart.length == 0)
            {
              return res.send({empty: true});
            }
          })
          
      } catch(err) {
        return res.status(500).send({ status: 'something went wrong' });
      }

      
    }


}

// const cartSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laptop', required: true }, quantity: { type: Number, required: true } }]
// }, { timestamps: true  })

function getCart(userId) {
  const pineline = 

        // Pipeline
        [
            // Stage 1
            {
                $match: {
                    "userId": userId
                }
            },
            // Stage 2
            {
                $unwind: "$products"
            },
    
            // Stage 3
            {
                $lookup: {
                    from: "laptops",
                            as: "products.productId",
                            let: { productId: "$products.productId" },
                            pipeline: [{
                              $match: {
                                $expr: { $eq: ["$$productId", "$_id"] }
                              }
                            },
                            {
                              $project: {
                                _id: 1,
                                laptopName: 1,
                                thumnail: { "$first": "$thumnail" },
                                price: 1,
                                onlinePrice: 1,
                                policy: 1,
                                slug: 1
                              }
                            }
                          ]
                }
            },
    
            // Stage 4
            {
                $unwind: {
                    path: "$products.productId"
                }
            },
    
            // Stage 5
            {
                $group: {
                    "_id": "$_id",
                    "products": { "$push": "$products" },
                }
            },
    
            // Stage 6
            {
                $project: {
                    // specifications
                    "_id": 1,
                    "products": { "$map": {
                        input: "$products",
                        as: "product",
                        in: {
                            "productDetail": "$$product.productId",
                            "quantity": "$$product.quantity",
                            "totalPrice": {
                                "$cond": [ {"$and":[{"$ne": ["$$product.productId.onlinePrice", undefined]}, {"$ne": ["$$product.productId.onlinePrice", 0]}]}, {"$multiply": ["$$product.productId.onlinePrice", "$$product.quantity"]} , {"$multiply": ["$$product.productId.price", "$$product.quantity"]} ]          
                            }
                        }
                    } }

                }
            },
            {
              $addFields: {
                "totalQuantity": { "$sum": "$products.quantity" },
                "total": { "$sum": "$products.totalPrice" }
              }
            }

        ];




      return Cart.aggregate(pineline);
}


async function transaction(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  let quantityChanged = -2;
  const session = await mongoose.startSession();
  // let cart = await Cart.findOne({ userId });
  // let product = await Laptop.findById(productId, ['_id', 'onlinePrice', 'price', 'quantity']);
  
  try{
      session.startTransaction();
      await Cart.findOneAndUpdate({ userId, 'products.productId': productId }, { $inc: { "products.$.quantity": 1 } } );
      // Laptop.findOneAndUpdate({ _id: productId, quantity: { $gt: quantityChanged } }, { $set: { quantity: { $substract: [ "quantity", quantityChanged ] } } }, 
      // function(err, doc){
      //   console.log(doc);
      // }
      // )
    //   Cart.updateOne({ userId }, [ {$set: {$cond: {
    //       $and: [
    //         { $eq: [ "$products.productId", productId ] },
    //         { "$products.quantity": { $lte: 5 } }
    //       ],
    //        "$products.quantity": { $sum: [ "$products.quantity", quantityChanged ] } ,
    //        "$products.quantity": "$product.quantity"
    //   }
    // }
    //    } ])


      await session.commitTransaction();
      res.send('success');
  }
  catch(err) {
    console.log(err);
    await session.abortTransaction();
  }
  
}




module.exports = new CartController();

