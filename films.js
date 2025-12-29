let films = JSON.parse(localStorage.getItem("films")) || [];

const table = document.getElementById("filmsTable");

function saveFilms() {
  localStorage.setItem("films", JSON.stringify(films));
  renderFilms();
  updateDashboard();
}

function renderFilms() {
  table.innerHTML = "";
  films.forEach((f, i) => {
    table.innerHTML += `
      <tr>
        <td>${f.titre}</td>
        <td>${f.annee}</td>
        <td>${f.genre}</td>
        <td>
          <button onclick="deleteFilm(${i})">❌</button>
        </td>
      </tr>
    `;
  });
}

function deleteFilm(index) {
  if (confirm("Supprimer ce film ?")) {
    films.splice(index, 1);
    saveFilms();
  }
}

document.getElementById("filmForm").addEventListener("submit", e => {
  e.preventDefault();
  films.push({
    titre: titre.value,
    annee: annee.value,
    genre: genre.value
  });
  e.target.reset();
  saveFilms();
});

document.getElementById("searchFilm").addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  document.querySelectorAll("#filmsTable tr").forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
  });
});

renderFilms();