document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("openAddBookPopup").addEventListener("click", function () {
        document.getElementById("addBookPopup").classList.remove("hidden");
    });
});

// Hardcoded admin credentials (Replace with secure authentication method in backend)
const ADMIN_CREDENTIALS = {
    "admin1": "securecode123",
    "admin2": "anothercode456"
};

function verifyAdmin() {
    const adminName = document.getElementById("adminName").value.trim();
    const adminCode = document.getElementById("adminCode").value.trim();

    if (ADMIN_CREDENTIALS[adminName] && ADMIN_CREDENTIALS[adminName] === adminCode) {
        // Store admin session
        localStorage.setItem("adminLoggedIn", JSON.stringify({ name: adminName }));

        // Show dashboard and hide login popup
        document.getElementById("adminLoginPopup").classList.add("hidden");
        document.getElementById("adminDashboard").classList.remove("hidden");

        loadUsers();
        loadBooks();
    } else {
        alert("Invalid Admin Name or Unique Code!");
    }
}


function closeAddBookPopup() {
    document.getElementById("addBookPopup").classList.add("hidden");
}

function checkAdminAccess() {
    const adminSession = JSON.parse(localStorage.getItem("adminLoggedIn"));

    if (!adminSession) {
        // ✅ Force logout: Show login popup and hide dashboard
        document.getElementById("adminLoginPopup").classList.remove("hidden");
        document.getElementById("adminDashboard").classList.add("hidden");
    } else {
        // ✅ Allow access: Hide login popup and show dashboard
        document.getElementById("adminLoginPopup").classList.add("hidden");
        document.getElementById("adminDashboard").classList.remove("hidden");

        // ✅ Reload data only if admin is logged in
        loadUsers();
        loadBooks();
    }
}

// ✅ Ensure the check runs when the page loads
document.addEventListener("DOMContentLoaded", () => {
    checkAdminAccess();
});




function logout() {
    localStorage.removeItem("adminLoggedIn"); // ✅ Ensure admin session is removed
    alert("Logged out successfully!");
    window.location.href = "LoginPage.html"; // ✅ Redirect to login page
}


async function loadUsers() {
    try {
        const response = await fetch("http://192.168.100.117:4000/users");//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
        const users = await response.json();
        
        const table = document.getElementById("usersTable");

        // Clear previous rows (except the header)
        table.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>LRN / Employee ID</th>
                <th>Action</th>
            </tr>`;

        users.forEach(user => {
            let row = table.insertRow();
            row.innerHTML = `
                <td>${user.full_name || "N/A"}</td>
                <td>${user.email}</td>
                <td>${user.role || "User"}</td>
                <td>${user.role === "student" ? user.lrn || "N/A" : user.employee_id || "N/A"}</td>
                <td><button onclick="deleteUser('${user.email}')">Delete</button></td>
            `;
        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}


async function deleteUser(email) {
    if (!confirm("Delete this user?")) return;

    try {
        const response = await fetch(`http://192.168.100.117:4000/delete-user/${email}`, { method: "DELETE" });//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);

        // ✅ Instead of reloading, refresh only the user list
        loadUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Check console for details.");
    }
}


async function loadBooks() {
    try {
        const response = await fetch("http://192.168.100.117:4000/books");//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
        const books = await response.json();
        const table = document.getElementById("booksTable");

        // ✅ Clear existing table rows except the header
        table.innerHTML = `
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Year</th>
                <th>Actions</th>
            </tr>`;

        books.forEach(book => {
            let row = table.insertRow();
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td>
                    <button onclick="openEditBookPopup(${book.id}, '${book.title}', '${book.author}', ${book.year})">✏️ Edit</button>
                    <button onclick="deleteBook(${book.id})">🗑 Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error("Error loading books:", error);
    }
}

async function updateBook() {
    const bookId = document.getElementById("editBookId").value;
    const title = document.getElementById("editBookName").value.trim();
    const author = document.getElementById("editBookAuthor").value.trim();
    const year = document.getElementById("editBookYear").value.trim();
    const fileInput = document.getElementById("editBookFile").files[0];

    if (!title || !author || !year) {
        alert("All fields are required!");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("year", year);
    if (fileInput) {
        formData.append("file", fileInput); // Attach file only if a new one is selected
    }

    try {
        const response = await fetch(`http://192.168.100.117:4000/edit-book/${bookId}`, {//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
            method: "PUT",
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            closeEditBookPopup();
            loadBooks(); // Refresh book list
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Error updating book:", error);
        alert("Failed to update book.");
    }
}


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
        loadBooks(); // ✅ Refresh books without logging out
    } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book. Check console for details.");
    }
}

function openEditBookPopup(id, title, author, year) {
    const popup = document.getElementById("editBookPopup");
    if (!popup) {
        console.error("Edit Book popup element not found!");
        return;
    }

    document.getElementById("editBookId").value = id;
    document.getElementById("editBookName").value = title;
    document.getElementById("editBookAuthor").value = author;
    document.getElementById("editBookYear").value = year;

    popup.classList.remove("hidden"); // Ensure this works
    popup.style.display = "flex"; // Force display
}


function closeEditBookPopup() {
    document.getElementById("editBookPopup").classList.add("hidden");
}



function logout() {
    localStorage.removeItem("adminLoggedIn"); // ✅ Remove admin session
    sessionStorage.clear(); // ✅ Clear all session storage (if any)
    alert("Logged out successfully!");

    // ✅ Redirect to the admin login page
    window.location.href = "LoginPage.html";
}


// Load users and books on page load
document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    loadBooks();
});

async function addBook() {
    const title = document.getElementById("bookName").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const year = document.getElementById("bookYear").value.trim();
    const fileInput = document.getElementById("bookFile").files[0];

    if (!title || !author || !year || !fileInput) {
        alert("All fields and file upload are required!");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("year", year);
    formData.append("file", fileInput);

    const response = await fetch("http://192.168.100.117:4000/upload-book", {//eto rin  IPv4 Address nyo lalagay  Ex-http://192.168.100.117:4000
        method: "POST",
        body: formData
    });

    const result = await response.json();
    if (result.error) {
        alert(result.error);
    } else {
        alert("Book uploaded successfully!");
        loadBooks();
    }
}



function openAddBookPopup() {
    const popup = document.getElementById("addBookPopup");
    if (!popup) {
        console.error("Add Book popup element not found");
        return;
    }
    popup.classList.remove("hidden");
}

function closeAddBookPopup() {
    document.getElementById("addBookPopup").classList.add("hidden");
}

