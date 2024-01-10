const mongoose = require('mongoose');

mongoose
   .connect('mongodb://127.0.0.1:27017/categories')
   .then(() => console.log('Connected to MongoDB'))
   .catch((e) => console.error('Error connecting to MongoDB:', e));

const categorySchema = new mongoose.Schema({
   _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
   },
   name: {
      type: String,
      required: true,
   },
   desc: {
      type: String,
      required: true,
   },
   //? specialization
   parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
   },
   // first step add depth field to your collection schema
   depth: {
      type: Number,
   },
});

const Category = mongoose.model('Category', categorySchema);

// Insert categories into MongoDB
// Uncomment the next code block to insert categories
// const categories = require('./categories.json');
// Category.insertMany(categories)
//    .then(() => console.log('Inserted categories'))
//    .catch((error) => console.error(error))
//    .finally(() => mongoose.disconnect());

Category.find()
   .sort({ depth: 1 }) // if u change the sort sort sequence it will still work idk WHY!!!
   .lean()
   .exec()
   .then((categories) => {
      // create map for faster search
      const categoryMap = new Map(categories.map((category) => [category._id.toString(), category]));

      const result = [];

      categories.forEach((category) => {
         if (category.depth === 0) {
            // top parent category
            result.push(category);
         } else {
            // get the parenCategory id and add it to the appropriate parent subCatogories array
            const parentCategory = categoryMap.get(category.parentCategory.toString());
            if (parentCategory) {
               // if no parent then it's invalid subCategory also it can added as parent category in else condition
               if (!parentCategory.subCategories) {
                  // if subCategory is the first subCategory to be added the subCategories of parent will be undefined so we create it
                  parentCategory.subCategories = [];
               }
               // push the category to subCateogries of his parent
               parentCategory.subCategories.push(category);
            }
         }
      });

      console.log(JSON.stringify(result, null, 2));
   })
   .catch((error) => console.error(error))
   .finally(() => mongoose.disconnect());
