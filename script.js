// Initialisation des données (LocalStorage)
let movies = JSON.parse(localStorage.getItem('cinetech_db')) || [];
let reals = JSON.parse(localStorage.getItem('reals_db')) || [];
let chart = null;
let currentPoster = "";
let currentPlot = "";

const FALLBACK_IMG = "https://via.placeholder.com/500x750?text=Image+Non+Disponible";

// --- NAVIGATION SPA ---
function showSection(id) {
    // Masquer toutes les sections
    document.querySelectorAll('.spa-section').forEach(s => s.classList.add('hidden'));
    // Afficher la section cible
    const section = document.getElementById(id);
    if(section) section.classList.remove('hidden');

    // Mise à jour visuelle des boutons sidebar
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('nav-active'));
    const activeBtn = document.getElementById('btn-' + id);
    if(activeBtn) activeBtn.classList.add('nav-active');

    document.getElementById('page-title').innerText = id === 'films' ? 'Catalogue' : 'Dashboard';
    
    if(id === 'dashboard') updateDashboard();
}

// --- GESTION API OMDB ---
async function fetchSuggestions() {
    const query = document.getElementById('m-title').value;
    const box = document.getElementById('suggestions');
    if (query.length < 3) { box.classList.add('hidden'); return; }

    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=ef71e952`);
        const data = await res.json();
        if (data.Search) {
            box.innerHTML = data.Search.slice(0, 5).map(m => `
                <div class="p-4 hover:bg-white/5 cursor-pointer flex items-center gap-4 border-b border-white/5 transition-colors" onclick="selectMovie('${m.imdbID}')">
                    <img src="${m.Poster !== 'N/A' ? m.Poster.replace('http:', 'https:') : FALLBACK_IMG}" class="w-12 h-16 object-cover rounded-lg">
                    <div>
                        <p class="text-sm font-bold text-white">${m.Title}</p>
                        <p class="text-[10px] text-gray-500 font-bold">${m.Year}</p>
                    </div>
                </div>
            `).join('');
            box.classList.remove('hidden');
        }
    } catch (e) { console.error("Erreur API:", e); }
}

async function selectMovie(id) {
    document.getElementById('suggestions').classList.add('hidden');
    try {
        const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=ef71e952`);
        const data = await res.json();
        
        document.getElementById('m-title').value = data.Title;
        
        // SÉCURITÉ ANNÉE (Évite le NaN)
        const yearCleaned = data.Year.match(/\d+/);
        document.getElementById('m-year').value = yearCleaned ? yearCleaned[0] : "";
        
        // SÉCURITÉ IMAGE (HTTPS)
        currentPoster = data.Poster !== "N/A" ? data.Poster.replace('http:', 'https:') : FALLBACK_IMG;
        currentPlot = data.Plot !== "N/A" ? data.Plot : "Pas de description.";
        
        document.getElementById('m-preview').innerHTML = `<img src="${currentPoster}" class="w-full h-full object-cover rounded-[30px] animate-in">`;
    } catch (e) { console.error(e); }
}

// --- CRUD FILMS ---
document.getElementById('movie-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('edit-id').value;
    const movieData = {
        id: editId ? parseInt(editId) : Date.now(),
        title: document.getElementById('m-title').value,
        year: parseInt(document.getElementById('m-year').value),
        genre: document.getElementById('m-genre').value,
        poster: currentPoster || FALLBACK_IMG,
        desc: currentPlot || "Pas de description."
    };

    if (editId) movies = movies.map(m => m.id === movieData.id ? movieData : m);
    else movies.push(movieData);

    saveData();
    resetForm();
});

function saveData() {
    localStorage.setItem('cinetech_db', JSON.stringify(movies));
    renderMovies();
    updateDashboard();
}

function renderMovies() {
    const grid = document.getElementById('movie-grid');
    const search = document.getElementById('search-input').value.toLowerCase();
    const sort = document.getElementById('sort-select').value;

    let filtered = movies.filter(m => m.title.toLowerCase().includes(search));

    if(sort === "az") filtered.sort((a,b) => a.title.localeCompare(b.title));
    else if(sort === "newest") filtered.sort((a,b) => b.year - a.year);
    else if(sort === "oldest") filtered.sort((a,b) => a.year - b.year);

    grid.innerHTML = filtered.map(m => `
        <div class="movie-card group glass p-5 rounded-[40px] hover:border-[#7c66ff]/50 transition-all cursor-pointer" onclick="openModal(${m.id})">
            <div class="relative overflow-hidden rounded-[30px] mb-6 aspect-[2/3]">
                <img src="${m.poster}" class="w-full h-full object-cover" onerror="this.src='${FALLBACK_IMG}'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <div class="flex gap-2 w-full">
                        <button onclick="event.stopPropagation(); editMovie(${m.id})" class="flex-1 bg-white text-black p-3 rounded-xl text-[10px] font-black uppercase">Éditer</button>
                        <button onclick="event.stopPropagation(); deleteMovie(${m.id})" class="w-12 bg-red-500/20 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
            <h4 class="font-bold text-sm truncate uppercase italic tracking-tighter">${m.title}</h4>
            <div class="flex justify-between items-center mt-2">
                <span class="text-[#7c66ff] text-[9px] font-black uppercase tracking-widest">${m.genre}</span>
                <span class="text-gray-600 text-[9px] font-bold">${m.year}</span>
            </div>
        </div>
    `).join('');
}

function deleteMovie(id) {
    if(confirm("Supprimer ce film ?")) {
        movies = movies.filter(m => m.id !== id);
        saveData();
    }
}

function editMovie(id) {
    const m = movies.find(m => m.id === id);
    document.getElementById('edit-id').value = m.id;
    document.getElementById('m-title').value = m.title;
    document.getElementById('m-year').value = m.year;
    document.getElementById('m-genre').value = m.genre;
    currentPoster = m.poster;
    currentPlot = m.desc;
    document.getElementById('m-preview').innerHTML = `<img src="${m.poster}" class="w-full h-full object-cover rounded-[30px]">`;
    document.getElementById('btn-submit').innerText = "Mettre à jour";
    document.getElementById('btn-cancel').classList.remove('hidden');
    document.getElementById('form-mode').innerHTML = "Modification <span class='text-[#7c66ff]'>.</span>";
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// --- DASHBOARD ANALYTICS ---
function updateDashboard() {
    document.getElementById('kpi-total').innerText = movies.length;
    document.getElementById('kpi-reals').innerText = reals.length;
    
    const ctx = document.getElementById('movieChart');
    if (!ctx) return;
    if(chart) chart.destroy();

    const labels = ['Action', 'Drame', 'SF', 'Horreur', 'Animation'];
    const counts = labels.map(l => movies.filter(m => m.genre === l).length);
    const total = movies.length || 1;

    chart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels.map((l, i) => `${l} (${((counts[i]/total)*100).toFixed(1)}%)`),
            datasets: [{
                data: counts,
                backgroundColor: ['#7c66ff', '#f472b6', '#2dd4bf', '#fb7185', '#fbbf24'],
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '85%',
            plugins: {
                legend: { position: 'right', labels: { color: '#666', font: { weight: 'bold' } } }
            }
        }
    });
}

// --- RÉALISATEURS ---
function addReal() {
    const name = document.getElementById('r-name').value;
    if(name) {
        reals.push({id: Date.now(), name: name});
        localStorage.setItem('reals_db', JSON.stringify(reals));
        document.getElementById('r-name').value = "";
        renderReals();
        updateDashboard();
    }
}
function renderReals() {
    document.getElementById('real-list').innerHTML = reals.map(r => `
        <div class="glass p-4 rounded-2xl flex justify-between items-center group">
            <span class="text-xs font-bold italic text-gray-300">${r.name}</span>
            <button onclick="deleteReal(${r.id})" class="text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><i class="fas fa-times-circle"></i></button>
        </div>
    `).join('');
}
function deleteReal(id) {
    reals = reals.filter(r => r.id !== id);
    localStorage.setItem('reals_db', JSON.stringify(reals));
    renderReals();
    updateDashboard();
}

// --- HELPERS ---
function resetForm() {
    document.getElementById('movie-form').reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('btn-submit').innerText = "Enregistrer le film";
    document.getElementById('btn-cancel').classList.add('hidden');
    document.getElementById('m-preview').innerHTML = `<i class="fas fa-image text-white/5 text-6xl"></i>`;
    currentPoster = ""; currentPlot = "";
}

function openModal(id) {
    const m = movies.find(m => m.id === id);
    document.getElementById('modal-img').src = m.poster;
    document.getElementById('modal-title').innerText = m.title;
    document.getElementById('modal-year').innerText = `Sortie : ${m.year}`;
    document.getElementById('modal-genre').innerText = m.genre;
    document.getElementById('modal-desc').innerText = m.desc;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('modal').classList.add('hidden'); }

// --- INIT ---
renderMovies();
renderReals();
updateDashboard();