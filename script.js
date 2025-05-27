// Define the function globally
async function showRepresentatives(number = null, searchTerm = "") {
  try {
    const response = await fetch("representatives.json");
    const data = await response.json();
    data.sort((a, b) => a.Surname.localeCompare(b.Surname));
    let filtered = number ? data.filter((rep) => rep.Number == number) : data;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (rep) =>
          rep.Name.toLowerCase().includes(term) ||
          rep.Surname.toLowerCase().includes(term) ||
          (rep.Email && rep.Email.toLowerCase().includes(term)) ||
          (rep.Email2 && rep.Email2.toLowerCase().includes(term))
      );
    }
    const container = document.getElementById("representatives");
    container.innerHTML = "";

    if (filtered.length === 0) {
      container.innerHTML = `<p class="text-muted">No representatives found${
        number ? ` for number ${number}` : ""
      }.</p>`;
      return;
    }

    filtered.forEach((rep) => {
      const repCard = document.createElement("div");
      repCard.className = "card mb-3 shadow-sm";

      let email2HTML = rep.Email2
        ? `<p class="card-text"><strong>Email 2:</strong> <a href="mailto:${rep.Email2}">${rep.Email2}</a></p>`
        : "";

      repCard.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${rep.Name}</h5>
          <p class="card-text mb-1"><strong>Email:</strong> <a href="mailto:${rep.Email}">${rep.Email}</a></p>
          ${email2HTML}
          <span class="badge bg-primary">Region ${rep.Number}</span>
        </div>
      `;

      container.appendChild(repCard);
    });
  } catch (error) {
    console.error("Error loading representatives:", error);
    document.getElementById(
      "representatives"
    ).innerHTML = `<p class="text-danger">Failed to load representatives.</p>`;
  }
}

// Load all reps on page load
document.addEventListener("DOMContentLoaded", () => {
  // Show all representatives initially
  showRepresentatives();

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      showRepresentatives(null, e.target.value);
    });
  }

  const svgObject = document.getElementById("svgObject");

  svgObject.addEventListener("load", () => {
    const svgWindow = svgObject.contentWindow; // Expose the function to the SVG's window context

    //connect the SVG elements to the showRepresentatives function
    if (svgWindow) {
      svgWindow.showRepresentatives = showRepresentatives;
    }
  });

  //Make the numbers red and bigger on hover and restore on mouse leave
  svgObject.addEventListener("load", () => {
    const svgDoc = svgObject.contentDocument;

    const clickableElements = svgDoc.querySelectorAll(".clickable-text");

    clickableElements.forEach((el) => {
      // If the element is a <text>, use it directly
      // If it's a container, find the <text> inside
      const text =
        el.tagName.toLowerCase() === "text" ? el : el.querySelector("text");
      if (!text) return;

      text.style.cursor = "pointer";
      text.style.transition = "all 0.2s ease";

      // Get computed font size (fallback to 16px if not set)
      const computedStyle = window.getComputedStyle(text);
      const originalFontSize = parseFloat(computedStyle.fontSize) || 16;
      const enlargedFontSize = originalFontSize * 1.2;

      text.addEventListener("mouseenter", () => {
        text.style.fill = "red";
        text.style.fontSize = `${enlargedFontSize}px`;
        text.style.textShadow = "4px 4px 6px white, -4px -4px 6px white";
        text.style.margin = "0 50px"; // Optional: add some margin for better visibility
      });
      text.addEventListener("mouseleave", () => {
        text.style.fill = "black";
        text.style.fontSize = `${originalFontSize}px`;
        text.style.textShadow = "none";
        text.style.margin = "0"; // Reset margin
      });
    });

    text.addEventListener("click", () => {
      // Optional: toggle styles or trigger actions
      text.style.fill = "red";
      text.style.fontSize = `${enlargedFontSize}px`; // You can also call showRepresentatives or any other function here
    });
  });

  // Clear Selection button
  const clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", () => {
    showRepresentatives(); // Reset to show all
  });
});
