const OrientDB = require('orientjs');

const server = OrientDB({
   host: 'localhost',
   port: 2424,
});

void async function() {
  const db = server.use({
    name:'test',
    username: 'test',
    password: 'test'
  });
  await db.open();
  try {
    await db.class.drop('Author UNSAFE');
  } catch(ex) {
    console.log(ex)
  }
  try {
    await db.class.drop('Book UNSAFE');
  } catch(ex) {
    console.log(ex)
  }
  try {
    await db.class.drop('BookAuthor UNSAFE');
  } catch(ex) {
    console.log(ex)
  }
  const author = await db.class.create('Author', 'V');
  const book = await db.class.create('Book', 'V');
  const bookauthor = await db.class.create('BookAuthor', 'E');
  ['Joe', 'John', 'Jack', 'Jeremy'].map(async (name) =>
    await author.create({name})
  );
  ['Art', 'Paint'].map(async (title) =>
    await book.create({title})
  );
  await author.list();
  await book.list();
  let Author = await  db.select().from('Author').where({name: 'Joe'}).one();
  let Book = await db.select().from('book').where({ title: 'Paint' }).one();
  await db.create('EDGE', 'BookAuthor').from(Author['@rid']).to(Book['@rid']).set({date: 'Some data'}).one();
  Author = await  db.select().from('Author').where({name: 'John'}).one();
  await db.create('EDGE', 'BookAuthor').from(Author['@rid']).to(Book['@rid']).set({date: 'Some data'}).one();
  Book = await db.select().from('book').where({ title: 'Art' }).one();
  await db.create('EDGE', 'BookAuthor').from(Author['@rid']).to(Book['@rid']).set({date: 'Some data'}).one();
  const cursor = await db.query(`select name, out('BookAuthor').title as books from Author`).all()
  console.log(JSON.stringify(cursor, ' ', 2))

} ()
