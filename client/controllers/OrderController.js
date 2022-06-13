const Order = require('../models/Order');
const { default: mongoose } = require('mongoose');
const { response } = require('express');
const { ObjectId } = require('mongodb');

class CartController {


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

