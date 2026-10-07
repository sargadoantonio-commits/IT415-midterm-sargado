// =====================================================
// PART 1: DATA, HELPERS
// =====================================================

// Labs and their number of seats
const LABS = {
  "ComLab 1": 40,
  "ComLab 2": 30,
  "AES": 25
};

// Which status changes are allowed (status rules)
const ALLOWED_CHANGES = {
  Pending:   ["Approved", "Rejected", "Cancelled"],
  Approved:  ["Cancelled"],
  Rejected:  [],   // cannot be changed again
  Cancelled: []    // cannot be changed again
};

// Load saved reservations from localStorage (or start with an empty list)
let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

// Save the list to localStorage
function saveReservations() {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

// Show a success or error message at the top of the page
function showMessage(text, type) {
  const box = document.getElementById("message");
  box.textContent = text;
  box.className = "message " + type; // type is "success" or "error"
}

// Create the next reservation ID, e.g. R001, R002
function generateId() {
  let highest = 0;
  reservations.forEach(function (r) {
    const num = parseInt(r.id.replace("R", ""));
    if (num > highest) highest = num;
  });
  return "R" + String(highest + 1).padStart(3, "0");
}

// Stop users from injecting HTML through text fields
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// =====================================================
// PART 2: MAKE A RESERVATION + VALIDATION
// =====================================================

document.getElementById("reservation-form").addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  // Read the form values
  const teacher  = document.getElementById("teacher").value.trim();
  const lab      = document.getElementById("lab").value;
  const date     = document.getElementById("date").value;
  const start    = document.getElementById("start").value;
  const end      = document.getElementById("end").value;
  const purpose  = document.getElementById("purpose").value.trim();
  const students = parseInt(document.getElementById("students").value);

  // All fields are required
  if (!teacher || !lab || !date || !start || !end || !purpose || !students) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  // Number of students must be at least 1
  if (students < 1) {
    showMessage("Number of students must be at least 1.", "error");
    return;
  }

  // End time must be after start time
  if (end <= start) {
    showMessage("End time must be later than start time.", "error");
    return;
  }

  // Students cannot be more than the lab's seats
  if (students > LABS[lab]) {
    showMessage(lab + " only has " + LABS[lab] + " seats. You entered " + students + " students.", "error");
    return;
  }

  // (The double-booking check will be added here on the feature branch)

  // Create the reservation. It always starts as Pending.
  const newReservation = {
    id: generateId(),
    teacher: teacher,
    lab: lab,
    date: date,
    start: start,
    end: end,
    purpose: purpose,
    students: students,
    
    status: "Pending",
    reason: ""
  };

  reservations.push(newReservation);
  saveReservations();
  document.getElementById("reservation-form").reset();
  showMessage("Reservation " + newReservation.id + " created. Status: Pending.", "success");
  refreshAll();
});