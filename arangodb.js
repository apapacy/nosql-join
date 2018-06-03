const { Database, aql } = require('arangojs');
const db = new Database({
  url: "http://localhost:8529"
});
db.useDatabase("test");
db.useBasicAuth("test", "test");
const author = db.collection('author')
const book = db.collection('book')
const bookauthor = db.collection('bookauthor')

void async function() {
  await author.truncate();
  await book.truncate();
  await bookauthor.truncate();
  ['Joe', 'John', 'Jack', 'Jeremy'].map(async (name) =>
    await author.save({name})
  );
  ['Art', 'Paint'].map(async (title) =>
    await book.save({title})
  );
  let Author = await  author.firstExample({ name: 'Joe' });
  let Book = await  book.firstExample({ title: 'Paint' });
  await bookauthor.save({author: Author._id, book: Book._id})
  Author = await  author.firstExample({ name: 'John' });
  await bookauthor.save({author: Author._id, book: Book._id})
  Book = await  book.firstExample({ title: 'Art' });
  await bookauthor.save({author: Author._id, book: Book._id})
  const cursor = await db.query(aql`
    FOR a IN author
      FOR ba IN bookauthor
      FILTER a._id == ba.author
        LET books = (FOR b IN book
        FILTER b._id == ba.book
        COLLECT author = a._id INTO books0
        RETURN {author,books0})
        SORT a.name
    RETURN {a, books}
  `);
  const all = await cursor.all()
  console.log(JSON.stringify(all, '', 2))
}();
