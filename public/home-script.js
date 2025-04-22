// Function para mag-login gamit ang API
async function loginUser(email, password) {
    const response = await fetch("http://192.168.100.117:4000/login", { //eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    const user = await response.json();
    
    if (user.error) {
        alert(user.error);
    } else {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "home.html";
    }
}

// Function para mag-load ng books mula sa server
async function loadBooks() {
    const response = await fetch("http://192.168.100.117:4000/books");//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
    const books = await response.json();

    const bookGrid = document.querySelector(".book-grid");
    bookGrid.innerHTML = "";

    books.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        bookCard.innerHTML = `
            <div class="book-details">
                <p class="book-name">${book.title}</p>
                <p class="book-author">${book.author}</p>
                <p class="book-year">(${book.year})</p>
                <button onclick="deleteBook(${book.id})" class="delete-btn hidden">🗑 Delete</button>
            </div>
        `;
        bookGrid.appendChild(bookCard);
    });

    checkAdmin();
}

// Function to search books
function searchBooks() {
    const searchInput = document.getElementById("search-input");
    const clearButton = document.getElementById("clearSearch");
    const searchValue = searchInput.value.toLowerCase();
    const bookCards = document.querySelectorAll(".book-card");

    // Show "X" only if there's text
    if (searchValue.length > 0) {
        clearButton.classList.remove("hidden");
    } else {
        clearButton.classList.add("hidden");
    }

    bookCards.forEach(card => {
        const titleElement = card.querySelector(".book-name");
        const authorElement = card.querySelector(".book-author");
        const yearElement = card.querySelector(".book-year");

        const title = titleElement.textContent;
        const author = authorElement.textContent;
        const year = yearElement.textContent;

        // Check if the book matches the search query
        if (title.toLowerCase().includes(searchValue) || 
            author.toLowerCase().includes(searchValue) || 
            year.toLowerCase().includes(searchValue)) {
            card.style.display = "block";

            // Highlight matches
            titleElement.innerHTML = highlightText(title, searchValue);
            authorElement.innerHTML = highlightText(author, searchValue);
            yearElement.innerHTML = highlightText(year, searchValue);
        } else {
            card.style.display = "none";
        }
    });
}

// Function to highlight search matches
function highlightText(text, searchValue) {
    if (!searchValue) return text; // If search is empty, return original text
    const regex = new RegExp(`(${searchValue})`, "gi");
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

// Function to clear search input and reset highlighting
function clearSearch() {
    const searchInput = document.getElementById("search-input");
    searchInput.value = "";
    document.getElementById("clearSearch").classList.add("hidden"); // Hide "X"

    // Reset book list
    const bookCards = document.querySelectorAll(".book-card");
    bookCards.forEach(card => {
        card.style.display = "block";
        // Reset text to remove highlights
        card.querySelector(".book-name").innerHTML = card.querySelector(".book-name").textContent;
        card.querySelector(".book-author").innerHTML = card.querySelector(".book-author").textContent;
        card.querySelector(".book-year").innerHTML = card.querySelector(".book-year").textContent;
    });
}




// Function para i-check kung ang naka-login ay admin
function checkAdmin() {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser && storedUser.role === "admin") {
        document.querySelectorAll(".delete-btn").forEach(btn => btn.classList.remove("hidden"));
    }
}

// Function para mag-delete ng book (admin lamang)
async function deleteBook(bookId) {
    try {
        if (!confirm("Are you sure you want to delete this book?")) return;

        const response = await fetch(`http://192.168.100.117:4000/delete-book/${bookId}`, {//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);
        
        // ✅ Reload books on home page
        window.location.reload(); // ✅ This forces the page to refresh

    } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book. Check console for details.");
    }
}


// Add book (Admin only)
async function addBook() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser || loggedInUser.role !== "admin") {
        alert("Only admins can add books.");
        return;
    }

    const title = document.getElementById("bookName").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const year = document.getElementById("bookYear").value.trim();

    await fetch("http://192.168.100.117:4000/add-book", {//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, year, added_by: loggedInUser.email })
    });

    alert("Book added successfully!");
    loadBooks();
}

async function loadBooks() {
    const response = await fetch("http://192.168.100.117:4000/books"); // Fetch books from the backend //eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
    const books = await response.json();
    const bookGrid = document.querySelector(".book-grid");

    if (!bookGrid) {
        console.error("Error: .book-grid container not found!");
        return;
    }

    bookGrid.innerHTML = ""; // Clear previous books

    books.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.classList.add("book-card");

        // When clicked, open the book in a new tab
        bookCard.onclick = function() {
            if (book.file_path) {
                window.open(`http://192.168.100.117:4000${book.file_path}`, "_blank"); //eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
            } else {
                alert("No file available for this book.");
            }
        };

        bookCard.innerHTML = `
            <div class="book-thumbnail">
                <span class="book-placeholder">📖</span>
            </div>
            <div class="book-details">
                <h3 class="book-name">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <p class="book-year">(${book.year})</p>
            </div>
        `;

        bookGrid.appendChild(bookCard);
    });
}


async function deleteBook(bookId) {
    const response = await fetch(`http://192.168.100.117:4000/delete-book/${bookId}`, { //eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
        method: "DELETE"
    });
    const result = await response.json();
    alert(result.message);
    loadBooks();
}

function loginUser() {
    let user = { username: "sampleUser" }; // Palitan ito ng tunay na data mula sa login
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    updateUI(); // 🟢 Update UI agad pagkatapos mag-login
}

// Function para i-update ang UI batay sa login status
function updateUI() {
    console.log("Running updateUI function");

    // Get user data from localStorage
    const loggedInUser = localStorage.getItem("loggedInUser");

    // Redirect to login page if no user is logged in
    if (!loggedInUser) {
        console.log("No user detected. Redirecting to login page...");
        window.location.href = "LoginPage.html"; // Change to your actual login page filename
        return;
    }

    console.log("Logged in user data:", loggedInUser);
    
    // Select all necessary elements
    const profileLink = document.getElementById("profileLink");
    const logoutLink = document.getElementById("logoutLink");
    const myAccountLink = document.getElementById("showMyAccountChoice");
    const createAccountLink = document.getElementById("showAccountChoice");
    
    // Check if elements exist before manipulating them
    if (!profileLink || !logoutLink || !myAccountLink || !createAccountLink) {
        console.error("One or more menu elements not found!");
        return;
    }
    
    if (loggedInUser) {
        console.log("User is logged in - showing Profile and Logout, hiding My Account and Create Account");
        // User is logged in - show Profile and Logout
        profileLink.classList.remove("hidden");
        logoutLink.classList.remove("hidden");
        myAccountLink.classList.add("hidden");
        createAccountLink.classList.add("hidden");
    } else {
        console.log("No user logged in - showing My Account and Create Account, hiding Profile and Logout");
        // No user logged in - show My Account and Create Account
        profileLink.classList.add("hidden");
        logoutLink.classList.add("hidden");
        myAccountLink.classList.remove("hidden");
        createAccountLink.classList.remove("hidden");
    }
}


// Add this at the end of the file
document.addEventListener('DOMContentLoaded', function() {
    // Check for login parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const justLoggedIn = urlParams.get('loggedin');
    
    if (justLoggedIn === 'true') {
        console.log("User just logged in, updating UI");
    }
    
    updateUI();
    loadBooks();
});

function logout() {
    localStorage.removeItem("loggedInUser");
    alert("You have been logged out");
    updateUI();
    // Optional: redirect to login page
    window.location.href = "LoginPage.html";
}

function showPopup(popupId) {
    let popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.remove("hidden");
    } else {
        console.error("Popup not found: " + popupId);
    }
}

function closePopup(popupId) {
    let popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.add("hidden");
    }
}