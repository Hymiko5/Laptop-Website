const config = require('../config/stripe');
const stripe = require('stripe')(config.secretKey);
const Order = require('../models/Order');
const Cart = require('../models/Cart')

class PaymentController {
    // [POST] /payment
    async payCredit(req, res) {
        const transaction = req.body;
        const expiration = new Date(transaction.expiration);
        try {
            const cart = await getCart(req.user._id);
            const token = await stripe.tokens.create({
                card: {
                    "number": transaction.cardNumber,
                    "exp_month": expiration.getMonth() + 1,
                    "exp_year": expiration.getFullYear(),
                    "cvc": transaction.cvc
                }
            })
            const customer = await stripe.customers.create({
                source: token.id,
                description: transaction.conditions ? transaction.conditions.join(', ') : null,
                coupon: transaction.coupon
            });

            stripe.charges.create({
                amount: cart[0].total,
                currency: 'vnd',
                customer: customer.id
            }, async (stripeErr, stripeRes) => {
                if (stripeErr) {
                    res.status(500).send(stripeErr)
                }
                else {
                    const newOrder = new Order();
                    newOrder.userId = req.user._id;
                    newOrder.userName = transaction.userName;
                    newOrder.gender = transaction.gender;
                    cart[0].products.forEach(product => {
                        const productObject = { productId: product.productDetail._id, purchasedQuantity: product.quantity }
                        newOrder.products.push(productObject);
                    })
                    newOrder.deliverWay = transaction.deliverWay;
                    if (transaction.deliverWay == "shipping") {
                        newOrder.deliverAddress = { provincial: transaction.provincial, district: transaction.district, ward: transaction.ward, address: transaction.address };
                    }

                    if (transaction.coupon) {
                        newOrder.coupon = transaction.coupon;
                    }
                    await Cart.deleteOne({ userId: req.user._id });
                    await newOrder.save();
                    res.send({ message: "Your order is successful created!" })
                }
            })

        } catch (err) {
            res.status(403).send(err);
        }


    }

    async getIncome(req, res) {
        const date = new Date();
        const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
        const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

        try {
            const income = await Order.aggregate([
                { $match: { createdAt: { $gte: previousMonth } } },
                {
                    $project: {
                        month: { $month: "$createdAt" },
                        sales: "$amount",
                    }
                },
                {
                    $group: {
                        _id: "$month",
                        total: { $sum: "$sales" },
                    }
                }
            ]);
            res.status(200).send(income);
        } catch (err) {
            res.status(500).send(err);
        }
    }


}
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
                    "products": {
                        "$map": {
                            input: "$products",
                            as: "product",
                            in: {
                                "productDetail": "$$product.productId",
                                "quantity": "$$product.quantity",
                                "totalPrice": {
                                    "$cond": [{ "$and": [{ "$ne": ["$$product.productId.onlinePrice", undefined] }, { "$ne": ["$$product.productId.onlinePrice", 0] }] }, { "$multiply": ["$$product.productId.onlinePrice", "$$product.quantity"] }, { "$multiply": ["$$product.productId.price", "$$product.quantity"] }]
                                }
                            }
                        }
                    }

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



module.exports = new PaymentController();