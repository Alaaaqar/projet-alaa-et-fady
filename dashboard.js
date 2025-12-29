function updateDashboard() {
  document.getElementById("kpiFilms").innerText = films.length;
  document.getElementById("kpiRealisateurs").innerText = realisateurs.length;
  renderChart();
}

let chart;
function renderChart() {
  const ctx = document.getElementById('filmsChart');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: films.map(f => f.titre),
      datasets: [{
        label: 'Années de sortie',
        data: films.map(f => f.annee)
      }]
    }
  });
}

/* API OMDB */
fetch("https://www.omdbapi.com/?s=batman&apikey=564727fa")
  .then(res => res.json())
  .then(data => {
    console.log("Films OMDB :", data.Search);
  })
  .catch(err => console.error(err));

updateDashboard();