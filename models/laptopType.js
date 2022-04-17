const { default: mongoose } = require('mongoose');



const laptopTypeSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true },
    laptops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Laptop', default: [] }]
});

const LaptopType = mongoose.model('LaptopType', laptopTypeSchema);



// LaptopType.find({}, function(err, laptopTypes) {
//     laptopTypes.forEach(type => {
//         type.laptops = type.laptopswap;
//         type.save();
//     })
// })

// LaptopType.updateMany({}, { $unset: { laptopswap: 1 } }, function(err){
//    if(err)console.log(err); 
// })

module.exports = LaptopType;