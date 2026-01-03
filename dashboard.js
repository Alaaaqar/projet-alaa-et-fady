let chart;

function updateDashboard() {
    const films = JSON.parse(localStorage.getItem("films")) || [];
    const reals = JSON.parse(localStorage.getItem("reals")) || [];
    
    if(document.getElementById("kpiFilms")) document.getElementById("kpiFilms").innerText = films.length;
    if(document.getElementById("kpiRealisateurs")) document.getElementById("kpiRealisateurs").innerText = reals.length;
    
    renderChart(films);
}

function renderChart(films) {
    const ctx = document.getElementById('filmsChart');
    if (!ctx) return;
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: films.map(f => f.titre),
            datasets: [{
                label: 'Année',
                data: films.map(f => f.annee),
                backgroundColor: '#e50914'
            }]
        }
    });
}

window.onload = () => {
    if(typeof renderFilms === "function") renderFilms();
    updateDashboard();
};