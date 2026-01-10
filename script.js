let movies = JSON.parse(localStorage.getItem('emsi_cinetech_v3')) || [];
let reals = JSON.parse(localStorage.getItem('emsi_reals_v3')) || [];

function showSection(id) {
    document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + id).classList.add('active');
    document.getElementById('section-title').innerText = id;
    if(id === 'dashboard') initDashboard();
}

document.getElementById('movie-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('m-title').value;
    const year = document.getElementById('m-year').value;
    const genre = document.getElementById('m-genre').value;

    if(id) {
        const idx = movies.findIndex(m => m.id == id);
        movies[idx] = { id: Number(id), title, year, genre };
        resetForm();
    } else {
        movies.push({ id: Date.now(), title, year, genre });
    }
    
    save();
    renderMovies();
});

function renderMovies() {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = movies.map(m => `
        <div class="movie-card group">
            <div class="flex justify-between items-start mb-6">
                <span class="text-[9px] font-black bg-white/5 text-indigo-400 px-4 py-1.5 rounded-full uppercase italic tracking-widest">${m.genre}</span>
                <div class="flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="editMovie(${m.id})" class="text-indigo-400 hover:text-white"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteMovie(${m.id})" class="text-slate-600 hover:text-red-500"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <h4 class="text-xl font-bold text-white mb-2">${m.title}</h4>
            <div class="text-slate-500 text-xs font-bold italic"><i class="far fa-calendar-alt mr-2 text-indigo-500"></i> ${m.year}</div>
        </div>
    `).join('');
}

function deleteMovie(id) {
    if(confirm("Confirmer la suppression ?")) {
        movies = movies.filter(m => m.id !== id);
        save();
        renderMovies();
    }
}

function editMovie(id) {
    const m = movies.find(m => m.id == id);
    document.getElementById('edit-id').value = m.id;
    document.getElementById('m-title').value = m.title;
    document.getElementById('m-year').value = m.year;
    document.getElementById('m-genre').value = m.genre;
    document.getElementById('form-title').innerText = "ÉDITION : " + m.title;
    document.getElementById('btn-save').innerText = "Mettre à jour";
    showSection('films');
}

function resetForm() {
    document.getElementById('edit-id').value = "";
    document.getElementById('movie-form').reset();
    document.getElementById('form-title').innerText = "# GESTION DU CATALOGUE";
    document.getElementById('btn-save').innerText = "Enregistrer";
}

function addReal() {
    const name = document.getElementById('r-name').value;
    if(name) {
        reals.push({ id: Date.now(), name });
        save();
        renderReals();
        document.getElementById('r-name').value = '';
    }
}

function renderReals() {
    document.getElementById('real-list').innerHTML = reals.map(r => `
        <li class="bg-white/2 p-5 rounded-3xl flex justify-between items-center border border-white/5">
            <span class="font-bold text-slate-300 text-sm uppercase italic tracking-tighter">${r.name}</span>
            <button onclick="deleteReal(${r.id})" class="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i class="fas fa-times"></i></button>
        </li>
    `).join('');
}

function deleteReal(id) {
    reals = reals.filter(r => r.id !== id);
    save();
    renderReals();
}

async function initDashboard() {
    document.getElementById('kpi-movies').innerText = movies.length;
    try {
        const res = await fetch('https://jsonplaceholder.typicode.com/todos/1'); // Fetch API asynchrone [cite: 93]
        document.getElementById('api-trend').innerHTML = `<i class="fas fa-fire mr-3 text-orange-500"></i> Trend: Alien: Romulus`;
    } catch (e) { document.getElementById('api-trend').innerText = "API Offline"; }
    renderChart();
}

let chart = null;
function renderChart() {
    const ctx = document.getElementById('movieChart').getContext('2d');
    if(chart) chart.destroy();
    
    const genres = ['Action', 'Drame', 'SF', 'Horreur']; // Liste mise à jour
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: genres,
            datasets: [{
                label: 'Nombre de films',
                data: genres.map(g => movies.filter(m => m.genre === g).length),
                backgroundColor: ['#6366f1', '#f472b6', '#34d399', '#f87171'],
                borderRadius: 15
            }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function save() { 
    localStorage.setItem('emsi_cinetech_v3', JSON.stringify(movies)); 
    localStorage.setItem('emsi_reals_v3', JSON.stringify(reals)); 
}

renderMovies();
renderReals();
initDashboard();