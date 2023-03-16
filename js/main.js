import "../scss/style.scss";
import { getJSON } from "./utils/getJSON";
import * as bootstrap from "bootstrap";

let books,
  currentFilter = "category",
  chosenCategoryFilter = "all",
  maxPrice = 0,
  minPrice = 200,
  chosenPriceSpanFilter = [0, 200],
  chosenSortOption,
  chosenSortOrder = 1,
  categories = [],
  authors = [];

async function initial() {
  books = await getJSON("/json/books.json");
  getCategories();
  getAuthors();
  getPriceRange();
  addFilters();
  addPriceFilters();
  addSortingOptions();
  addSortingOrders();
  sortByAuthor(books);
  displayBooks();
}

function sortByAuthor(books, order) {
  books.sort(({ author: aAuthor }, { author: bAuthor }) =>
    aAuthor.replace("Author", "") > bAuthor.replace("Author", "")
      ? order
      : -order
  );
}

function sortByPrice(books, order) {
  books.sort(({ price: aPrice }, { price: bPrice }) =>
    aPrice > bPrice ? order : -order
  );
}

function addSortingOptions() {
  // create and display html
  document.querySelector(".sortingOptions").innerHTML = /*html*/ `
    <label><span>Sort by:</span>
      <select class="sortOption">
        <option>Author</option>
        <option>Price</option>
      </select>
    </label>
  `;
  // add an event listener
  document.querySelector(".sortOption").addEventListener("change", (event) => {
    chosenSortOption = event.target.value;
    displayBooks();
  });
}

function addSortingOrders() {
  document.querySelector(".sortingOrders").innerHTML = /*html*/ `
  <label><span>Sort Order:</span>
  <select class="sortOrder">
    <option>Ascending</option>
    <option>Descending</option>
  </select>
  `;
  document.querySelector(".sortOrder").addEventListener("change", (event) => {
    chosenSortOrder = event.target.value === "Ascending" ? 1 : -1;
    displayBooks();
  });
}

function getCategories() {
  // create an array of all categories that books have
  let withDuplicates = books.map((book) => book.category);
  // remove duplicates by creating a set
  // that we then spread into an array to cast it to an array
  categories = [...new Set(withDuplicates)];
  // sort the categories
  categories.sort();
}

function getAuthors() {
  // create an array of all categories that books have
  let withDuplicates = books.map((book) => book.author);
  // remove duplicates by creating a set
  // that we then spread into an array to cast it to an array
  authors = [...new Set(withDuplicates)];
  // sort the categories
  authors.sort();
}

function getPriceRange() {
  for (const book of books) {
    maxPrice = book.price > maxPrice ? book.price : maxPrice;
    minPrice = book.price < minPrice ? book.price : minPrice;
  }
}

function addFilters() {
  // create and display html
  // document.querySelector(".filters").innerHTML = /*html*/ `
  //   <label><span>Filter by categories:</span>
  //     <select class="categoryFilter">
  //       <option>all</option>
  //       ${categories.map((category) => `<option>${category}</option>`).join("")}
  //     </select>
  //   </label>
  // `;
  document.querySelector(".filters").innerHTML = /*html*/ `
    <label><span>Filter by </span>
      <select class="filter">
        <option>category</option>
        <option>author</option>
        <option>price</option>
      </select> :
      <select class="filteringCondition">
      <option>all</option>
      ${categories.map((category) => `<option>${category}</option>`).join("")}
      </select>
      </select>
    </label>
  `;
  document.querySelector(".filter").addEventListener("change", (event) => {
    // get the selected category
    currentFilter = event.target.value;
    if (currentFilter === "category") {
      document.querySelector(".filteringCondition").innerHTML = `
      <option>all</option>
      ${categories.map((category) => `<option>${category}</option>`).join("")}`;
    } else if (currentFilter === "author") {
      document.querySelector(".filteringCondition").innerHTML = `
      <option>all</option>
      ${authors.map((author) => `<option>${author}</option>`).join("")}`;
    } else if (currentFilter === "price") {
    }
    displayBooks();
  });
  // add an event listener
  document
    .querySelector(".filteringCondition")
    .addEventListener("change", (event) => {
      if (currentFilter === "category") {
        // get the selected category
        chosenCategoryFilter = event.target.value;
      }
      displayBooks();
    });
}

function range(start, stop, step = 1) {
  return Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);
}

function addPriceFilters() {
  // create and display html
  document.querySelector(".priceSpanFilters").innerHTML = /*html*/ `
    <label><span>Filter by price span:</span>
      <select class="priceFilter">
        <option>all</option>
        ${range(minPrice, maxPrice, 40)
          .map(
            (minPrice) =>
              `<option>${minPrice} - ${
                minPrice + 39 > maxPrice ? maxPrice : minPrice + 39
              }</option>`
          )
          .join("")}
      </select>
    </label>
  `;
  // add an event listener
  document
    .querySelector(".priceSpanFilters")
    .addEventListener("change", (event) => {
      // get the selected category
      chosenPriceSpanFilter =
        event.target.value === "all"
          ? [minPrice, maxPrice]
          : event.target.value.split(" - ");
      displayBooks();
    });
}

function displayBooks() {
  // filter according to category and call displayBooks
  let filteredBooks = books
    .filter(
      ({ category }) =>
        chosenCategoryFilter === "all" || chosenCategoryFilter === category
    )
    .filter(
      ({ price }) =>
        (chosenPriceSpanFilter[0] === minPrice &&
          chosenPriceSpanFilter[1] === maxPrice) ||
        (price >= chosenPriceSpanFilter[0] && price <= chosenPriceSpanFilter[1])
    );
  if (chosenSortOption === "Author") {
    sortByAuthor(filteredBooks, chosenSortOrder);
  }
  if (chosenSortOption === "Price") {
    sortByPrice(filteredBooks, chosenSortOrder);
  }
  let htmlArray = filteredBooks.map(
    ({ id, title, author, description, category, price }) => /*html*/ `
    <div class="col">
      <a data-bs-toggle="modal" data-bs-target="#modal" data-title=${title} data-id=${id} data-author=${author} data-description=${description} data-category=${category} data-price=${price}>
        <div class="books card">
          <h3 class="card-header">${title}</h3>
          <div class="card-body">
            <table class="table table-borderless">
              <tr><th>id</th><td>${id}</td></tr>  
              <tr><th>Author</th><td>${author}</td></tr>
              <tr><th>Description</th><td>${description}</td></tr>
              <tr><th>Category</th><td>${category}</td></tr>
              <tr><th>Price</th><td>${price}</td></tr>
            </table>
          </div>
        </div>
      </a>
    </div>
  `
  );
  document.querySelector("#bookList").innerHTML = htmlArray.join("");
  document.querySelector("main").innerHTML += `
  <!-- Modal -->
  <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="title"</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <table class="table table-bordered text-center">
            <tr><th>id</th><td id="id"></td></tr>  
            <tr><th>Author</th><td id="author"></td></tr>
            <tr><th>Description</th><td id="description"></td></tr>
            <tr><th>Category</th><td id="category"}></td></tr>
            <tr><th>Price</th><td id="price"></td></tr>
          </table>
          <h3>Book Cover</h3>
          <image id="cover" src="" class="rounded img-thumbnail">
        </div>
      </div>
    </div>
  </div>
  `;
  document.querySelectorAll(".books").forEach((element) =>
    element.addEventListener("click", (event) => {
      let target = event.target;
      while (!target.dataset.id) {
        target = target.parentNode;
      }
      document.querySelector("#title").textContent = target.dataset.title;
      document.querySelector("#id").textContent = target.dataset.id;
      document.querySelector("#author").textContent = target.dataset.author;
      document.querySelector("#description").textContent =
        target.dataset.description;
      document.querySelector("#category").textContent = target.dataset.category;
      document.querySelector("#price").textContent = target.dataset.price;
      document
        .querySelector("#cover")
        .setAttribute("src", `/images/${target.dataset.id}.jpg`);
    })
  );
}

initial();
