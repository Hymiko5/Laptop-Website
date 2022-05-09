const main = require('../config/db/connection').main;
const { default: mongoose } = require('mongoose');
const laptopSchema = new mongoose.Schema({
    laptopName: { type: String, required: true, unique: true },
    shortName: {type: String, required: true, unique: true},
    thumnail: { type: Array, required: true },
    policy: { type: Object },
    price: { type: Number, get: getPrice },
    installment: { type: String },
    configuration: { type: Object, required: true },
    onlinePrice: { type: Number, required: true, get: getPrice },
    gift: { type: Object },
    laptopDetail: { type: Object, required: true },
    rate: { type: Object },
    plugin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plugin', default: [] }],
    relateProduct: { type: Array, default: [] },
    laptopType: { type: String },
    brand: { type: String, require: true },
    isBusiness: { type: Boolean, required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    quantity: { type: Number, required: true, min: 0 },
    slug: { type: String, slug: 'shortName', unique: true },
}, { timestamps: true })


laptopSchema.index({ laptopName: 'text' })
const Laptop = mongoose.model('Laptop', laptopSchema);




module.exports = Laptop;

function getPrice(money) {
    return (Math.round(money * 100) / 100).toLocaleString().replace(/,/g,'.');
}
// const array = ['i3', 'i5', 'i7', 'R5', 'R6', 'R7'];
// const regex = /(?:(?:18|19|20|21)[0-9]{2})/g;
// function handleName(name) {
    
//     var regExp = /\(([^)]+)\)/;
//     if(name.includes('MacBook')&&regExp.test(name)){
//         const r = name.match(/\b\d{4}\b/);
//         return (name.split(r)[0] + r+ " " + name.match(regExp)[1]);
//     }
    
//     for(let i = 0; i< array.length;i++){
//          if(name.includes(array[i])){
//              if(/\./g.test(name.match(regExp)[1])){
//                 return (name.split(array[i])[0] + name.split(array[i])[1].split('/')[0] + " " + array[i]);
//              }
//              else{
                 
//                 return (name.split(array[i])[0] + array[i] +  name.split(array[i])[1].split('/')[0]+ " " + name.match(regExp)[0]);
//              }
              
//              } 
//             }

// }
