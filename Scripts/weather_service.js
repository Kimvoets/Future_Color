/**
 * Handles all weather-related functionality and updates
 */
class WeatherService {
    constructor() {
        this.apiKey = WEATHER_CONFIG.API_KEY;
        this.city = localStorage.getItem('weatherCity') || WEATHER_CONFIG.CITY;
        this.weather = null;
        this.initAutocomplete();
        this.startWeatherUpdates();
        this.initForm();
    }

    /**
     * Initializes city search autocomplete functionality
     */
    initAutocomplete() {
        const input = document.getElementById('cityInput');
        let debounceTimer;

        // Add input listener with debounce for better performance
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const container = document.querySelector('.location-suggestions');
            container.style.display = 'none';

            debounceTimer = setTimeout(() => {
                if (e.target.value.length >= 2) {
                    this.searchCities(e.target.value);
                }
            }, 300);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                document.querySelector('.location-suggestions').style.display = 'none';
            }
        });
    }

    async searchCities(query) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${this.apiKey}`
            );
            const cities = await response.json();
            this.showSuggestions(cities);
        } catch (error) {
            console.error('Error searching cities:', error);
        }
    }

    showSuggestions(cities) {
        const container = document.querySelector('.location-suggestions');
        container.innerHTML = '';
        container.style.display = cities.length ? 'block' : 'none';

        cities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'location-suggestion';
            div.textContent = `${city.name}, ${city.country}`;
            div.addEventListener('click', () => {
                this.selectCity(city);
            });
            container.appendChild(div);
        });
    }

    selectCity(city) {
        this.city = city.name;
        document.getElementById('cityInput').value = `${city.name}, ${city.country}`;
        document.querySelector('.location-suggestions').style.display = 'none';
        localStorage.setItem('weatherCity', city.name);
        this.fetchWeather();
    }

    initForm() {
        const form = document.getElementById('locationForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cityInput = document.getElementById('cityInput');
            if (cityInput.value.trim()) {
                this.city = cityInput.value.split(',')[0];
                localStorage.setItem('weatherCity', this.city);
                await this.fetchWeather();
            }
        });
    }

    updateWeatherDisplay() {
        const weather = this.weather;
        if (!weather) return;

        const currentWeather = document.querySelector('.current-weather');
        const effects = document.querySelector('.weather-effects');
        
        currentWeather.innerHTML = `
            <div class="weather-main">
                <span class="temperature">${weather.temperature}°C</span>
                <span class="condition">${weather.condition}</span>
            </div>
            <div class="location">Locatie: ${this.city}</div>
        `;

        let effectsText = [];
        if (['Rain', 'Snow'].includes(weather.condition)) {
            effectsText.push({
                text: 'Mengtijd +10% (Regen/Sneeuw)',
                warning: false
            });
        }
        if (weather.temperature < 10) {
            effectsText.push({
                text: 'Mengtijd +15% (Lage temperatuur)',
                warning: false
            });
        }
        if (weather.temperature > 35) {
            effectsText.push({
                text: 'Maximaal 1 machine per hal (Hoge temperatuur)',
                warning: true
            });
        }

        effects.innerHTML = effectsText.length 
            ? `<div class="effects-title">Actieve weer effecten:</div>
               ${effectsText.map(effect => 
                   `<div class="effect ${effect.warning ? 'warning' : ''}">${effect.text}</div>`
               ).join('')}`
            : '<div class="no-effects">Geen actieve weer effecten</div>';

        // Trigger weather update event
        document.dispatchEvent(new CustomEvent('weatherUpdate'));
    }

    async fetchWeather() {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&appid=${this.apiKey}`
            );
            const data = await response.json();
            
            this.weather = {
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main
            };

            // Update the display after fetching new weather data
            this.updateWeatherDisplay();

            document.dispatchEvent(new CustomEvent('weatherUpdate', { 
                detail: this.weather 
            }));
        } catch (error) {
            console.error('Weather API error:', error);
            alert('Kon het weer niet ophalen. Controleer de stadsnaam.');
        }
    }

    getWeather() {
        return this.weather;
    }

    startWeatherUpdates() {
        // Initial fetch
        this.fetchWeather();
        // Update every 5 minutes
        setInterval(() => this.fetchWeather(), 300000);
    }

    calculateMixTimeModifier() {
        if (!this.weather) return 1;
        
        let modifier = 1;
        const { temperature, condition } = this.weather;

        // Rain/Snow: +10% mixing time
        if (['Rain', 'Snow'].includes(condition)) {
            modifier *= 1.1;
        }

        // Cold weather: +15% mixing time
        if (temperature < 10) {
            modifier *= 1.15;
        }

        return modifier;
    }
}