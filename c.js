const API_KEY = 'ZbmyHLwqTAgej82KaZYZCsM2I2FXd1VoPFLVQIm3'; // NASA API anahtarınızı buraya ekleyin
const asteroidList = document.getElementById('asteroid-list');
const dateInput = document.getElementById('date-input');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.getElementsByClassName('close')[0];
const canvas = document.getElementById('orbit-animation');
const ctx = canvas.getContext('2d');

async function getAsteroids(date) {
    const API_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${API_KEY}`;
    asteroidList.innerHTML = '<div class="loading">Yükleniyor...</div>';
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        displayAsteroids(data.near_earth_objects[date]);
    } catch (error) {
        console.error('Veri alınırken hata oluştu:', error);
        asteroidList.innerHTML = '<div class="loading">Veri alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</div>';
    }
}

function displayAsteroids(asteroids) {
    asteroidList.innerHTML = '';
    asteroids.forEach(asteroid => {
        const listItem = document.createElement('li');
        listItem.className = 'asteroid-item';
        const diameter = asteroid.estimated_diameter.kilometers;
        const size = (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2;
        listItem.innerHTML = `
            <div class="asteroid-name">${asteroid.name}</div>
            <div class="asteroid-data">
                Çap: ${diameter.estimated_diameter_min.toFixed(2)} - 
                ${diameter.estimated_diameter_max.toFixed(2)} km
            </div>
            <div class="asteroid-data">
                Dünya'ya Yakınlık: ${Number(asteroid.close_approach_data[0].miss_distance.kilometers).toFixed(0)} km
            </div>
            <div class="asteroid-data ${asteroid.is_potentially_hazardous_asteroid ? 'hazardous' : ''}">
                Tehlikeli mi: ${asteroid.is_potentially_hazardous_asteroid ? 'Evet' : 'Hayır'}
            </div>
            <div class="asteroid-size" style="width: ${Math.min(size * 10, 100)}px; height: ${Math.min(size * 10, 100)}px;"></div>
        `;
        listItem.addEventListener('click', () => showAsteroidDetails(asteroid));
        asteroidList.appendChild(listItem);
    });
}

function showAsteroidDetails(asteroid) {
    modalTitle.textContent = asteroid.name;
    modalBody.innerHTML = `
        <p>Çap: ${asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(2)} - 
        ${asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km</p>
        <p>Dünya'ya Yakınlık: ${Number(asteroid.close_approach_data[0].miss_distance.kilometers).toFixed(0)} km</p>
        <p>Bağıl Hız: ${Number(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)} km/s</p>
        <p>Tehlikeli mi: ${asteroid.is_potentially_hazardous_asteroid ? 'Evet' : 'Hayır'}</p>
    `;
    modal.style.display = 'block';
    animateOrbit(asteroid);
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

function animateOrbit(asteroid) {
    const centerX = 200;
    const centerY = 200;
    const orbitRadius = 150;
    let angle = 0;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dünya
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();

        // Yörünge
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();

        // Asteroid
        const x = centerX + orbitRadius * Math.cos(angle);
        const y = centerY + orbitRadius * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = asteroid.is_potentially_hazardous_asteroid ? 'red' : 'gray';
        ctx.fill();

        angle += 0.02;
        requestAnimationFrame(draw);
    }

    draw();
}

dateInput.valueAsDate = new Date();
dateInput.addEventListener('change', (e) => getAsteroids(e.target.value));
getAsteroids(dateInput.value);