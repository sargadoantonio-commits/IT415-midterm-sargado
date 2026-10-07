const state = {
  reservations: [
    {
      id: 1,
      guestName: 'Sandra Lee',
      guestEmail: 'sandra@example.com',
      reservationDate: '2026-10-15',
      reservationTime: '19:00',
      partySize: 4,
      tableNumber: 12,
      notes: 'Window table preferred',
      status: 'pending',
    },
    {
      id: 2,
      guestName: 'Marcus Hill',
      guestEmail: 'marcus@example.com',
      reservationDate: '2026-10-16',
      reservationTime: '18:30',
      partySize: 2,
      tableNumber: 7,
      notes: 'Anniversary dinner',
      status: 'approved',
    },
  ],
};

const form = document.getElementById('reservationForm');
const formMessage = document.getElementById('formMessage');
const tableBody = document.getElementById('reservationTableBody');

function formatReservationDate(dateString) {
  if (!dateString) return '—';

  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function showFormMessage(message, type) {
  if (!formMessage) return;

  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function validateReservation(reservation) {
  const errors = [];

  if (!reservation.guestName.trim()) {
    errors.push('Guest name is required.');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(reservation.guestEmail)) {
    errors.push('Please provide a valid email address.');
  }

  if (!reservation.reservationDate) {
    errors.push('Reservation date is required.');
  }

  if (!reservation.reservationTime) {
    errors.push('Reservation time is required.');
  }

  const partySize = Number(reservation.partySize);
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
    errors.push('Party size must be between 1 and 20 guests.');
  }

  const tableNumber = Number(reservation.tableNumber);
  if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 50) {
    errors.push('Table number must be between 1 and 50.');
  }

  if (reservation.reservationDate && reservation.reservationTime) {
    const reservationDate = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
    const now = new Date();

    if (Number.isNaN(reservationDate.getTime())) {
      errors.push('Please choose a valid date and time.');
    } else if (reservationDate < now) {
      errors.push('Reservation date and time cannot be in the past.');
    }
  }

  const duplicate = state.reservations.some((entry) => {
    return (
      entry.guestEmail.toLowerCase() === reservation.guestEmail.toLowerCase() &&
      entry.reservationDate === reservation.reservationDate &&
      entry.reservationTime === reservation.reservationTime
    );
  });

  if (duplicate) {
    errors.push('A reservation already exists for this guest at that time.');
  }

  return errors;
}

function updateSummary() {
  const totalReservations = document.getElementById('totalReservations');
  const pendingCount = document.getElementById('pendingCount');
  const approvedCount = document.getElementById('approvedCount');
  const rejectedCount = document.getElementById('rejectedCount');

  if (!totalReservations || !pendingCount || !approvedCount || !rejectedCount) return;

  totalReservations.textContent = String(state.reservations.length);
  pendingCount.textContent = String(state.reservations.filter((item) => item.status === 'pending').length);
  approvedCount.textContent = String(state.reservations.filter((item) => item.status === 'approved').length);
  rejectedCount.textContent = String(state.reservations.filter((item) => item.status === 'rejected').length);
}

function renderReservationTable() {
  if (!tableBody) return;

  if (state.reservations.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No reservations available yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = state.reservations
    .map((reservation) => {
      return `
        <tr>
          <td>
            <strong>${reservation.guestName}</strong><br />
            <span>${reservation.guestEmail}</span>
          </td>
          <td>${formatReservationDate(reservation.reservationDate)}</td>
          <td>${reservation.reservationTime}</td>
          <td>${reservation.partySize}</td>
          <td>${reservation.tableNumber}</td>
          <td>
            <span class="status-badge status-${reservation.status}">${reservation.status}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button type="button" class="action-btn approve-btn">Approve</button>
              <button type="button" class="action-btn reject-btn">Reject</button>
              <button type="button" class="action-btn cancel-btn">Cancel</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function handleReservationSubmit(event) {
  event.preventDefault();

  const reservation = {
    guestName: document.getElementById('guestName').value.trim(),
    guestEmail: document.getElementById('guestEmail').value.trim(),
    reservationDate: document.getElementById('reservationDate').value,
    reservationTime: document.getElementById('reservationTime').value,
    partySize: document.getElementById('partySize').value,
    tableNumber: document.getElementById('tableNumber').value,
    notes: document.getElementById('reservationNotes').value.trim(),
    status: 'pending',
  };

  const errors = validateReservation(reservation);
  if (errors.length > 0) {
    showFormMessage(errors[0], 'error');
    return;
  }

  state.reservations.push({
    ...reservation,
    id: Date.now(),
  });

  form.reset();
  showFormMessage('Reservation created successfully.', 'success');
  updateSummary();
  renderReservationTable();
}

if (form) {
  form.addEventListener('submit', handleReservationSubmit);
}

updateSummary();
renderReservationTable();
