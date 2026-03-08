// ========== Navbar Active Link Highlight ==========

// Get current page name from URL
const currentPage = window.location.pathname.split("/").pop();

// Select all nav links
const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

// Loop through and set 'active' class for the matching link
navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});
