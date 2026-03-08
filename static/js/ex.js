let students = [
  { name: "Alice", class: "C", gender: "F" }, { name: "Bob", class: "C", gender: "M" },
  { name: "Charlie", class: "C", gender: "M" }, { name: "David", class: "C", gender: "M" },
  { name: "Eva", class: "C", gender: "F" }, { name: "Frank", class: "C", gender: "M" },
  { name: "Grace", class: "C", gender: "F" }, { name: "Henry", class: "C", gender: "M" },
  { name: "Irene", class: "C", gender: "F" }, { name: "Jack", class: "C", gender: "M" },
  { name: "Karen", class: "C", gender: "F" }, { name: "Leo", class: "C", gender: "M" },
  { name: "Mia", class: "C", gender: "F" }, { name: "Noah", class: "C", gender: "M" },
  { name: "Olivia", class: "C", gender: "F" }, { name: "Paul", class: "C", gender: "M" },
  { name: "Quinn", class: "C", gender: "F" }, { name: "Rachel", class: "C", gender: "F" },
  { name: "Sam", class: "C", gender: "M" }, { name: "Tina", class: "C", gender: "F" },
  { name: "Umar", class: "C", gender: "M" }, { name: "Vera", class: "C", gender: "F" },
  { name: "Will", class: "C", gender: "M" }, { name: "Xena", class: "C", gender: "F" },
  { name: "Yuri", class: "C", gender: "M" }
];

const tbody = document.querySelector('#studentTable tbody');
let currentPage = 1;
const rowsPerPage = 10;

function renderStudents() {
  tbody.innerHTML = '';

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageStudents = students.slice(start, end);

  pageStudents.forEach((student, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="ID">${start + idx + 1}</td>
      <td data-label="Name">${student.name}</td>
      <td data-label="Class">${student.class}</td>
      <td data-label="Gender">${student.gender}</td>
      <td data-label="Actions">
        <button class="edit-btn" onclick="editStudent(${start + idx})">Edit</button>
        <button class="delete-btn" onclick="deleteStudent(${start + idx})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination();
}

function editStudent(index) {
  const newName = prompt('Edit student name:', students[index].name);
  if (newName && newName.trim() !== '') {
    students[index].name = newName.trim();
    renderStudents();
  }
}

function deleteStudent(index) {
  if (confirm(`Are you sure you want to delete ${students[index].name}?`)) {
    students.splice(index, 1);
    if ((currentPage - 1) * rowsPerPage >= students.length) currentPage--;
    renderStudents();
  }
}

function addStudent() {
  const newName = prompt('Enter new student name:');
  if (newName && newName.trim() !== '') {
    students.push({ name: newName.trim(), class: "C", gender: "M" });
    renderStudents();
  }
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  const pageCount = Math.ceil(students.length / rowsPerPage);

  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.onclick = () => { currentPage--; renderStudents(); };
    pagination.appendChild(prevBtn);
  }

  for (let i = 1; i <= pageCount; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = (i === currentPage) ? 'active' : '';
    pageBtn.onclick = () => { currentPage = i; renderStudents(); };
    pagination.appendChild(pageBtn);
  }

  if (currentPage < pageCount) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => { currentPage++; renderStudents(); };
    pagination.appendChild(nextBtn);
  }
}

renderStudents();
