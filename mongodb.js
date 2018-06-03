var mongo = require('mongodb-bluebird');
//open connection to the database
mongo.connect("mongodb://localhost:27017/test").then(function(db) {
    //close connection to the database
    return db.close().then(function() {
        console.log('success');
    });
}).catch(function(err) {
  console.error("something went wrong");
});

//find users
mongo.connect("mongodb://localhost:27017/test").then(async function(db) {
    //get the user collection
    var author = db.collection('author');
    var book = db.collection('book');
    var bookauthor = db.collection('bookauthor');
    await author.remove({});
    await book.remove({});
    await bookauthor.remove({});
    ['Joe', 'John', 'Jack', 'Jeremy'].map(async (name) =>
      await author.insert({name})
    );
    ['Art', 'Paint'].map(async (title) =>
      await book.insert({title})
    );
    let Author = await  author.findOne({ name: 'Joe' });
    let Book = await  book.findOne({ title: 'Paint' });
    await bookauthor.insert({author: Author._id, book: Book._id})
    Author = await  author.findOne({ name: 'John' });
    await bookauthor.insert({author: Author._id, book: Book._id})
    Book = await  book.findOne({ title: 'Art' });
    await bookauthor.insert({author: Author._id, book: Book._id})
    const result = await author.aggregate([{
      $lookup:{
        from: 'bookauthor',
        localField: '_id',
        foreignField: 'author',
        as: 'ba'
      }}, {
        $lookup: {
          from: 'book',
          localField: 'ba.book',
          foreignField: '_id',
          as: 'books'
      }}],{
      })
    console.log(JSON.stringify(result, '', 2))
});
