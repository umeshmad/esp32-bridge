const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://2003kckrcnavinda_db_user:200332512178@shoppingtime.ytdzibq.mongodb.net/shoppingtime?retryWrites=true&w=majority&appName=shoppingtime";

const productSchema = new mongoose.Schema({
    barcode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB Atlas!');

        const seedProducts = [
            { barcode: '5901234123457', name: 'Samaposha', price: 200, weight: 200 },
            { barcode: '4006381333931', name: 'Cereal Multi-Grain', price: 850, weight: 500 },
            { barcode: '8710398519306', name: 'Milk Biscuits Pack', price: 120, weight: 150 }
        ];

        for (const product of seedProducts) {
            await Product.findOneAndUpdate(
                { barcode: product.barcode },
                product,
                { upsert: true, new: true }
            );
            console.log(`Upserted: ${product.name} (${product.barcode})`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
