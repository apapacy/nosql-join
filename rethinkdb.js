r = require('rethinkdb')

void async function() {
  const conn = await r.connect({ host: 'localhost', port: 28015 });
  try {
    await r.db('test').tableDrop('author').run(conn);
    await r.db('test').tableDrop('book').run(conn);
    await r.db('test').tableDrop('bookauthor').run(conn);
  } catch (ex) {
    console.log(ex)
  }
  await r.db('test').tableCreate('author').run(conn);
  await r.db('test').tableCreate('book').run(conn);
  await r.db('test').tableCreate('bookauthor').run(conn);
  await r.db('test').table('bookauthor').indexCreate('author').run(conn);
  await r.db('test').table('bookauthor').indexCreate('book').run(conn);
  await r.db('test').table('bookauthor').indexWait('author', 'book').run(conn);
  ['Joe', 'John', 'Jack', 'Jeremy'].map(async (name) =>
    await r.db('test').table('author').insert({ name }).run(conn)
  );
  ['Art', 'Paint'].map(async (title) =>
    await r.db('test').table('book').insert({ title }).run(conn)
  );
  let Author = await  r.db('test').table('author').filter({ name: 'Joe' }).run(conn).then(authors => authors.next());
  let Book = await  r.db('test').table('book').filter({ title: 'Paint' }).run(conn).then(books => books.next());
  await r.db('test').table('bookauthor').insert({author: Author.id, book: Book.id}).run(conn);
  Author = await  r.db('test').table('author').filter({ name: 'John' }).run(conn).then(authors => authors.next());
  await r.db('test').table('bookauthor').insert({author: Author.id, book: Book.id}).run(conn);
  Book = await  r.db('test').table('book').filter({ title: 'Art' }).run(conn).then(books => books.next());
  await r.db('test').table('bookauthor').insert({author: Author.id, book: Book.id}).run(conn);
  const cursor = await r.db('test').table('author')
    .eqJoin('id', r.db('test').table('bookauthor'), {index: 'author'}).zip()
    .eqJoin('book', r.db('test').table('book')).zip().run(conn)
  console.log(await cursor.toArray())
}();
