// Function to check if the user is authenticated
function checkAuth() {
    let loggedInUser = localStorage.getItem("loggedInUser");

    // If the user is not logged in, redirect to login.html (unless already there)
    if (!loggedInUser && !window.location.pathname.includes("login.html")) {
        window.location.href = "login.html";
    }
}

// Function to log out the user
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html"; // Redirect to login page
}

// Run checkAuth on page load to protect all pages
document.addEventListener("DOMContentLoaded", checkAuth);

// Attach logout function to button if it exists
document.getElementById("logoutBtn")?.addEventListener("click", logout);
