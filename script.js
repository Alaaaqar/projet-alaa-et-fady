let films = JSON.parse(localStorage.getItem("films")) || [];
let realisateurs = JSON.parse(localStorage.getItem("reals")) || [];

function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

const filmForm = document.getElementById('filmForm');
if (filmForm) {
    filmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newFilm = {
            titre: document.getElementById('titre').value,
            annee: document.getElementById('annee').value,
            genre: document.getElementById('genre').value
        };
        films.push(newFilm);
        localStorage.setItem("films", JSON.stringify(films));
        renderFilms();
        if (typeof updateDashboard === "function") updateDashboard();
        filmForm.reset();
    });
}

function renderFilms() {
    const table = document.getElementById('filmsTable');
    if (!table) return;
    table.innerHTML = "";
    films.forEach((f, i) => {
        table.innerHTML += `
            <tr>
                <td>${f.titre}</td>
                <td>${f.annee}</td>
                <td>${f.genre}</td>
                <td><button style="background:#444" onclick="deleteFilm(${i})">Supprimer</button></td>
            </tr>`;
    });
}

function deleteFilm(i) {
    films.splice(i, 1);
    localStorage.setItem("films", JSON.stringify(films));
    renderFilms();
    if (typeof updateDashboard === "function") updateDashboard();
}

const searchFilm = document.getElementById('searchFilm');
if (searchFilm) {
    searchFilm.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = films.filter(f => 
            f.titre.toLowerCase().includes(term) || 
            f.genre.toLowerCase().includes(term)
        );
        const table = document.getElementById('filmsTable');
        table.innerHTML = "";
        filtered.forEach((f, i) => {
            table.innerHTML += `<tr><td>${f.titre}</td><td>${f.annee}</td><td>${f.genre}</td><td><button onclick="deleteFilm(${i})">X</button></td></tr>`;
        });
    });
}

const realForm = document.getElementById('realForm');
if (realForm) {
    realForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nom = document.getElementById('nomReal').value;
        if (nom) {
            realisateurs.push(nom);
            localStorage.setItem("reals", JSON.stringify(realisateurs));
            renderReals();
            if (typeof updateDashboard === "function") updateDashboard();
            realForm.reset();
        }
    });
}

function renderReals() {
    const list = document.getElementById('realList');
    if (!list) return;
    list.innerHTML = "";
    realisateurs.forEach((r, i) => {
        list.innerHTML += `
            <li style="display:flex; justify-content:space-between; margin-bottom:10px; background:#161618; padding:10px; border-radius:8px;">
                <span>🎬 ${r}</span>
                <button style="background:#444" onclick="deleteReal(${i})">X</button>
            </li>`;
    });
}

function deleteReal(i) {
    realisateurs.splice(i, 1);
    localStorage.setItem("reals", JSON.stringify(realisateurs));
    renderReals();
    if (typeof updateDashboard === "function") updateDashboard();
}

window.onload = () => {
    renderFilms();
    renderReals();
    if (typeof updateDashboard === "function") updateDashboard();
};