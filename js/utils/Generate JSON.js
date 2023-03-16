const categories = ["HTML", "CSS", "UX", "JavaScript"];
const booksPerCategory = 8;
let idCounter = 1;
const books = [];

for (let i = 0; i < categories.length; i++) {
  for (let j = 0; j < booksPerCategory; j++) {
    const book = {
      id: idCounter,
      title: `Book${idCounter} Title`,
      author: `Author${idCounter}`,
      description: "Lorem ipsum",
      category: categories[i],
      price: Math.ceil(Math.random() * 200) + 100,
    };
    books.push(book);
    idCounter++;
  }
}

console.log(JSON.stringify(books));
