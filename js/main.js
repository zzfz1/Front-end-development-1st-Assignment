import "../scss/style.scss";
import { getJSON } from "./utils/getJSON";
import * as bootstrap from "bootstrap";

let books,
  filteredBooks,
  currentFilter = "category",
  chosenCategoryFilter = "all",
  chosenAuthorFilter = "all",
  maxPrice = 0,
  minPrice = 200,
  chosenPriceSpanFilter = [0, 200],
  chosenSortOption = "Author",
  chosenSortOrder = -1,
  categories = [],
  cart = {},
  authors = [];

async function initial() {
  books = await getJSON("/json/books.json");
  filteredBooks = books;
  getCategories();
  getAuthors();
  getPriceRange();
  addFilters();
  addSortingOptions();
  addSortingOrders();
  addModal();
  addCart();
  displayBooks();
}

function sortByAuthor(books, order) {
  // Technically, sorting by author should be alphabetical.
  books.sort(({ author: aAuthor }, { author: bAuthor }) =>
    aAuthor > bAuthor ? order : -order
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
    <option selected>Descending</option>
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
    </label>
  `;
  document.querySelector(".filter").addEventListener("change", (event) => {
    // get the selected category
    currentFilter = event.target.value;
    filteredBooks = books;
    if (currentFilter === "category") {
      document.querySelector(".filteringCondition").innerHTML = `
        <option>all</option>
        ${categories
          .map((category) => `<option>${category}</option>`)
          .join("")}`;
    } else if (currentFilter === "author") {
      document.querySelector(".filteringCondition").innerHTML = `
        <option>all</option>
        ${authors.map((author) => `<option>${author}</option>`).join("")}`;
    } else if (currentFilter === "price") {
      document.querySelector(".filteringCondition").innerHTML = `
          <option>all</option>;
          ${range(minPrice, maxPrice, 40)
            .map(
              (minPrice) =>
                `<option>${minPrice} - ${
                  minPrice + 39 > maxPrice ? maxPrice : minPrice + 39
                }</option>`
            )
            .join("")}
        `;
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
        filteredBooks = books.filter(
          ({ category }) =>
            chosenCategoryFilter === "all" || chosenCategoryFilter === category
        );
      } else if (currentFilter === "author") {
        chosenAuthorFilter = event.target.value;
        filteredBooks = books.filter(
          ({ author }) =>
            chosenAuthorFilter === "all" || chosenAuthorFilter === author
        );
      } else if (currentFilter === "price") {
        chosenPriceSpanFilter =
          event.target.value === "all"
            ? [minPrice, maxPrice]
            : event.target.value.split(" - ");
        filteredBooks = books.filter(
          ({ price }) =>
            (chosenPriceSpanFilter[0] === minPrice &&
              chosenPriceSpanFilter[1] === maxPrice) ||
            (price >= chosenPriceSpanFilter[0] &&
              price <= chosenPriceSpanFilter[1])
        );
      }
      displayBooks();
    });
}

function range(start, stop, step = 1) {
  return Array(Math.ceil((stop - start) / step))
    .fill(start)
    .map((x, y) => x + y * step);
}
function removeOne(bookID) {
  cart[bookID] = cart[bookID] - 1;
  let quantity = cart[bookID];
  let book = books.find(({ id }) => id == bookID);
  let tableBody = document.querySelector(`.cartContent`);
  let row = tableBody.querySelector(`tr[data-id="${bookID}"]`);
  if (quantity === 0) {
    row.remove();
  } else {
    row.querySelector(".quantity").textContent = quantity;
    row.querySelector(".rowSum").textContent =
      quantity * parseInt(book["price"]) + " Kr";
  }
  updateTotal();
}
function addOne(bookID) {
  cart[bookID] = (cart[bookID] || 0) + 1;
  let quantity = cart[bookID];
  let book = books.find(({ id }) => id == bookID);
  let tableBody = document.querySelector(`.cartContent`);
  let row = tableBody.querySelector(`tr[data-id="${bookID}"]`);
  if (row) {
    row.querySelector(".quantity").textContent = quantity;
    row.querySelector(".rowSum").textContent =
      quantity * parseInt(book["price"]) + " Kr";
  }
  updateTotal();
}
function buy(bookID) {
  cart[bookID] = (cart[bookID] || 0) + 1;
  let quantity = cart[bookID];
  let book = books.find(({ id }) => id == bookID);
  let tableBody = document.querySelector(`.cartContent`);
  let row = tableBody.querySelector(`tr[data-id="${bookID}"]`);
  if (row) {
    row.querySelector(".quantity").textContent = quantity;
    row.querySelector(".rowSum").textContent =
      quantity * parseInt(book["price"]) + " Kr";
  } else {
    row = document.createElement("tr");
    row.setAttribute("data-id", bookID);
    row.innerHTML = /*HTML*/ `
        <td>${book.title}</td>
        <td><button class="minus button-sm">-</button><span class="quantity">1</span><button class="plus button-sm">+</button></td>
        <td>${book.price}</td>
        <td class="rowSum">${book.price} Kr</td>
    `;
    tableBody.append(row);
    row
      .querySelector(".minus")
      .addEventListener("click", () => removeOne(bookID));
    row.querySelector(".plus").addEventListener("click", () => addOne(bookID));
  }

  updateTotal();
}

function updateTotal() {
  let tableBody = document.querySelector(`.cartContent`);
  let total = 0;
  let rowSums = tableBody.querySelectorAll(".rowSum");
  rowSums.forEach((element) => {
    total += parseInt(element.textContent);
  });
  document.querySelector(".total").textContent = total;
}

function displayBooks() {
  if (chosenSortOption === "Author") {
    sortByAuthor(filteredBooks, chosenSortOrder);
  }
  if (chosenSortOption === "Price") {
    sortByPrice(filteredBooks, chosenSortOrder);
  }
  let htmlArray = filteredBooks.map(
    ({ id, title, author, description, category, price }) => /*html*/ `
    <div class="col">
        <div class="books card" data-id=${id}>
          <a data-bs-toggle="modal" data-bs-target="#modal" data-title="${title}" data-id="${id}" data-author="${author}" data-description="${description}" data-category="${category}" data-price="${price}">
            <h3 class="card-header">${title}</h3>
            <div class="card-body py-0">
              <table class="table table-borderless my-0">
                <tr><th>id</th><td>${id}</td></tr>  
                <tr><th>Author</th><td>${author}</td></tr>
                <tr><th>Description</th><td class="text-truncate" style="max-width: 100px; max-height:25px;">${description.substring(
                  0,
                  40
                )}</td></tr>
                <tr><th>Category</th><td>${category}</td></tr>
                <tr><th>Price</th><td>${price} Kr</td></tr>
              </table>
            </div>
            </a>
          <div class="card-footer">
            <button class="btn btn-primary">Buy</button>
          </div>  
        </div>
    </div>
  `
  );
  document.querySelector("#bookList").innerHTML = htmlArray.join("");
  document.querySelectorAll(".books").forEach((element) =>
    element.addEventListener("click", (event) => {
      let target = event.target;
      while (!target.dataset.id) {
        target = target.parentNode;
      }
      document.querySelector("#title").textContent = target.dataset.title;
      document.querySelector("#id").textContent = target.dataset.id;
      document.querySelector("#author").textContent = target.dataset.author;
      document.querySelector("#description").innerHTML =
        target.dataset.description;
      document.querySelector("#category").textContent = target.dataset.category;
      document.querySelector("#price").textContent = target.dataset.price;
      document
        .querySelector("#cover")
        .setAttribute("src", `/images/${target.dataset.id}.jpg`);
      document.querySelector("#buy").addEventListener("click", (event) => {
        let bookID = target.dataset.id;
        buy(bookID);
      });
    })
  );
  document.querySelectorAll(".card-footer .btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      let target = event.target;
      while (!target.dataset.id) {
        target = target.parentNode;
      }
      let bookID = target.dataset.id;
      buy(bookID);
    });
  });
}

function addModal() {
  document.querySelector(".mod").innerHTML = /*HTML*/ `
    <!-- Modal -->
    <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="title"></h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <table class="table table-bordered text-center">
              <tr><th>id</th><td id="id"></td></tr>  
              <tr><th>Author</th><td id="author"></td></tr>
              <tr><th>Description</th><td class="text-start" id="description"></td></tr>
              <tr><th>Category</th><td id="category"></td></tr>
              <tr><th>Price</th><td id="price"></td></tr>
            </table>
            <h3>Book Cover</h3>
            <img id="cover" src="" class="rounded img-thumbnail">
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="buy">Buy</button>
          </div>
        </div>
      </div>
    </div>
    `;
}

function addCart() {
  document.querySelector(".cart").innerHTML = /*HTML*/ `
  <div
    class="offcanvas offcanvas-end"
    tabindex="-1"
    id="offcanvas"
    aria-labelledby="offcanvasLabel"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasLabel">
        Shopping Cart
      </h5>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body">
     <table class="table text-center">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody class="cartContent">
            </tbody>
        </table> 
      <h5>In total: <span class="total">0</span> Kr</h5>
    </div>
  </div>`;
  let cartButton = document.querySelector("#cartButton");
  cartButton.innerHTML = `
    <img
      src="/icons/shopping-cart-outline.svg"
      alt="cart"
      style="min-height: 25px; max-height: 50px; height: 80%"
    />
  `;
  cartButton.setAttribute("data-bs-toggle", "offcanvas");
  cartButton.setAttribute("data-bs-target", "#offcanvas");
  cartButton.setAttribute("aria-controls", "offcanvas");
}

initial();
