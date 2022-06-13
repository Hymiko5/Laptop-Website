const Cart = require('../models/Cart');
module.exports = async function caculateQuantity(req, res, next) {
  if (req.user) {
    const pineline =
      // Pipeline
      [
        // Stage 1
        {
          $match: {
            "userId": req.user._id
          }
        },
        {
          $addFields: {
            "totalQuantity": { "$sum": "$products.quantity" },
          }
        }

      ];
    const cart = await Cart.aggregate(pineline);
    let totalQuantity = 0;
    if (cart.length > 0) {
      console.log(cart);
      totalQuantity = cart[0].totalQuantity;
    }
    res.locals.totalQuantity = totalQuantity;
  }
  else res.locals.totalQuantity = 0;

  next();

}