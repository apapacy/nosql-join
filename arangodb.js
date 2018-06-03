const { Database, aql } = require('arangojs');
const db = new Database({
  url: "http://localhost:8529"
});
db.useDatabase("test");
db.useBasicAuth("test", "test");
const author = db.collection('author')
const book = db.collection('book')
const bookauthor = db.edgeCollection('bookauthor')

void async function() {
  try {
    await author.drop();
    await book.drop();
    await bookauthor.drop();
  } catch (ex) {
    console.log(ex)
  }
  await author.create();
  await book.create();
  await bookauthor.create();
  ['Joe', 'John', 'Jack', 'Jeremy'].map(async (name) =>
    await author.save({name})
  );
  ['Art', 'Paint'].map(async (title) =>
    await book.save({title})
  );
  let Author = await  author.firstExample({ name: 'Joe' });
  let Book = await  book.firstExample({ title: 'Paint' });
  await bookauthor.save({date: 'Some data'}, Author._id, Book._id)
  Author = await  author.firstExample({ name: 'John' });
  await bookauthor.save({date: 'Some data'}, Author._id, Book._id)
  Book = await  book.firstExample({ title: 'Art' });
  await bookauthor.save({date: 'Some data'}, Author._id, Book._id)
  let cursor = await db.query(aql`
    FOR a IN author
    LET books = (
      FOR book_vertex, book_edge IN OUTBOUND a bookauthor
      RETURN book_vertex
    )
    RETURN {author: a, books}
  `);
  let all = await cursor.all()
  console.log(JSON.stringify(all, '', 2))
  cursor = await db.query(aql`
    FOR a IN author
      FOR book_vertex, book_edge IN OUTBOUND a bookauthor
      COLLECT a1 = a INTO b1
    RETURN {author: a1, books: b1[*].book_vertex}
  `);
  all = await cursor.all()
  console.log(JSON.stringify(all, '', 2))

}();
