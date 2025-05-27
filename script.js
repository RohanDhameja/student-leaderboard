let studentData = [];

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    studentData = data; // store full data globally

    const leaderboard = data.map((student, idx) => {
      const totalHours = student.records.reduce((sum, record) => sum + record.projectHours, 0);
      const sessions = student.records.length;
      return {
        index: idx,            // add index for position sorting
        student: student.name,
        totalHours,
        sessions
      };
    });

    // Sort descending by totalHours initially
    leaderboard.sort((a, b) => b.totalHours - a.totalHours);

    window.leaderboardData = leaderboard;

    renderTable(leaderboard);
  })
  .catch(error => {
    console.error('Error loading data:', error);
    alert('Failed to load data.');
  });

// Render function to update table body
function renderTable(data) {
  const tbody = document.querySelector('#leaderboard tbody');
  tbody.innerHTML = ''; // Clear existing rows

  data.forEach((entry, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <button class="student-name-btn" style="
          background:none;
          border:none;
          color:#007bff;
          cursor:pointer;
          text-decoration:underline;
          padding:0;
          font-size:inherit;
          ">
          ${entry.student}
        </button>
      </td>
      <td>${entry.totalHours.toFixed(1)}</td>
      <td>${entry.sessions}</td>
    `;

    tbody.appendChild(tr);

    // Add click listener on student name button
    tr.querySelector('.student-name-btn').addEventListener('click', () => {
      showStudentDetails(entry.student);
    });
  });
}

// Search functionality
document.getElementById('searchBox').addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  const filtered = window.leaderboardData.filter(entry =>
    entry.student.toLowerCase().includes(term)
  );
  renderTable(filtered);
});

// Sorting functionality
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const sortKey = th.getAttribute('data-sort');
    let sortedData = [...window.leaderboardData];

    const currentSort = th.getAttribute('aria-sort');
    const ascending = currentSort === 'ascending' ? false : true;

    sortedData.sort((a, b) => {
      if (sortKey === 'position') {
        return ascending ? a.index - b.index : b.index - a.index;
      } else if (sortKey === 'name') {
        return ascending
          ? a.student.localeCompare(b.student)
          : b.student.localeCompare(a.student);
      } else if (sortKey === 'hours') {
        return ascending ? a.totalHours - b.totalHours : b.totalHours - a.totalHours;
      } else if (sortKey === 'sessions') {
        return ascending ? a.sessions - b.sessions : b.sessions - a.sessions;
      }
    });

    // Update aria-sort indicators
    document.querySelectorAll('th[data-sort]').forEach(header => {
      header.setAttribute('aria-sort', 'none');
      const arrow = header.querySelector('.sort-arrow');
      if (arrow) arrow.textContent = '';
    });

    th.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.textContent = ascending ? '▲' : '▼';

    renderTable(sortedData);
  });
});

// Function to show student details below the table
function showStudentDetails(studentName) {
  const student = studentData.find(s => s.name === studentName);
  if (!student) {
    alert('Student details not found.');
    return;
  }

  const tbody = document.getElementById('detailsTableBody');
  tbody.innerHTML = ''; // Clear previous rows

  student.records.forEach((record) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td style="padding:8px; border:1px solid #ddd;">${record.timeIn || 'N/A'}</td>
      <td style="padding:8px; border:1px solid #ddd;">${record.timeOut || 'N/A'}</td>
      <td style="padding:8px; border:1px solid #ddd;">${record.projectHours != null ? record.projectHours : '0'}</td>
      <td style="padding:8px; border:1px solid #ddd;">${record.signedOutBy || 'N/A'}</td>
      <td style="padding:8px; border:1px solid #ddd;">${record.excludedFromTotal ? 'Yes' : 'No'}</td>
      <td style="padding:8px; border:1px solid #ddd;">${record.notes || 'N/A'}</td>
    `;

    tbody.appendChild(tr);
  });

  // Show the modal
  const modal = document.getElementById('detailsModal');
  modal.style.display = 'flex';

  // Focus for accessibility
  modal.focus();
}

// Close modal event
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('detailsModal').style.display = 'none';
});

// Also close modal when clicking outside the modal content
document.getElementById('detailsModal').addEventListener('click', (event) => {
  if (event.target.id === 'detailsModal') {
    document.getElementById('detailsModal').style.display = 'none';
  }
});
