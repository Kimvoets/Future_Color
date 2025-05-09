class PotManager {
    /**
     * Initializes the PotManager with weather service and default settings
     */
    constructor() {
        this.potCount = 0;
        this.weatherService = new WeatherService();
        this.initializeAll();
    }

    /**
     * Sets up all initial components and event listeners
     */
    initializeAll() {
        this.initEventListeners();
        // Create default pots in both halls
        this.createDefaultPots('hall1');
        this.createDefaultPots('hall2');
        this.initWeatherDisplay();
        this.weatherService.startWeatherUpdates();
    }

    initEventListeners() {
        // Add hall navigation listeners
        document.getElementById('hall1Button').addEventListener('click', () => this.switchHall('hall1'));
        document.getElementById('hall2Button').addEventListener('click', () => this.switchHall('hall2'));
        
        // Add pot creation listeners
        document.getElementById('addPotButton').addEventListener('click', () => this.createPot('hall1'));
        document.getElementById('addPotButton2').addEventListener('click', () => this.createPot('hall2'));
    }

    createDefaultPots(hallId) {
        // Create two default pots in specified hall
        this.createPot(hallId, 'Pot 1');
        this.createPot(hallId, 'Pot 2');
        this.createPot(hallId, 'Pot 3');
    }

    /**
     * Creates a new pot with specified name in the given hall
     * @param {string} hallId - The ID of the hall ('hall1' or 'hall2')
     * @param {string} [name='Nieuwe Pot'] - Optional name for the pot
     */
    createPot(hallId, name = 'Nieuwe Pot') {
        const pot = document.createElement('div');
        pot.className = 'pot';
        pot.draggable = true;
        pot.innerHTML = `
            <h3>${name}</h3>
            <div class="ingredients-container"></div>
        `;
        
        this.setupPotDragAndDrop(pot);
        document.querySelector(`#${hallId} .pots-container`).appendChild(pot);
    }

    /**
     * Sets up drag and drop functionality for a pot
     * @param {HTMLElement} pot - The pot element to set up
     */
    setupPotDragAndDrop(pot) {
        pot.addEventListener('dragstart', (e) => {
            const ingredients = pot.querySelectorAll('.ingredient');
            const mixTimes = Array.from(ingredients).map(ing => parseInt(ing.dataset.time));
            let maxMixTime = Math.max(...mixTimes, 0);
            
            const potData = {
                html: pot.outerHTML,
                mixTime: maxMixTime,
                ingredients: Array.from(ingredients).map(ing => ({
                    color: ing.dataset.color,
                    structuur: ing.dataset.structuur,
                    speed: ing.dataset.speed
                }))
            };
            e.dataTransfer.setData('application/json', JSON.stringify(potData));
        });

        // Add dragover and drop handlers for ingredients
        pot.addEventListener('dragover', (e) => {
            e.preventDefault();
            const ingredients = pot.querySelectorAll('.ingredient');
            if (ingredients.length < 3) {
                pot.classList.add('dragover');
            }
        });

        pot.addEventListener('dragleave', () => {
            pot.classList.remove('dragover');
        });
    }

    initWeatherDisplay() {
        const weatherDisplay = document.createElement('div');
        weatherDisplay.className = 'weather-display';
        document.querySelector('.hall-controls').appendChild(weatherDisplay);

        this.updateWeatherDisplay();
        document.addEventListener('weatherUpdate', () => {
            this.updateWeatherDisplay();
            this.updateMachineAvailability();
        });
    }

    updateWeatherDisplay() {
        const weather = this.weatherService.getWeather();
        const display = document.querySelector('.weather-display');
        display.innerHTML = `
            <div>Temperature: ${weather.temperature}°C</div>
            <div>Weather: ${weather.condition}</div>
        `;
    }

    updateMachineAvailability() {
        const weather = this.weatherService.getWeather();
        const machines = document.querySelectorAll('.mixing-machine');
        
        if (weather.temperature > 35) {
            machines.forEach((machine, index) => {
                if (index > 0) {
                    machine.classList.add('disabled');
                }
            });
        } else {
            machines.forEach(machine => machine.classList.remove('disabled'));
        }
    }

    createNewPot() {
        this.potCount++;
        const pot = document.createElement('div');
        pot.className = 'pot';
        pot.draggable = true;
        pot.innerHTML = `
            <h3>Pot ${this.potCount}</h3>
            <div class="ingredients-container"></div>
        `;

        this.setupPotDragAndDrop(pot);
        const activeHall = document.querySelector('.mixing-hall.active');
        activeHall.querySelector('.pots-container').appendChild(pot);
    }

    setupPotDragAndDrop(pot) {
        pot.addEventListener('dragstart', (e) => {
            const ingredients = pot.querySelectorAll('.ingredient');
            const mixTimes = Array.from(ingredients).map(ing => parseInt(ing.dataset.time));
            let maxMixTime = Math.max(...mixTimes, 0);
            
            // Apply weather modifier to mixing time
            const weatherModifier = this.weatherService.calculateMixTimeModifier();
            maxMixTime = Math.round(maxMixTime * weatherModifier);
            
            const potData = {
                html: pot.outerHTML,
                mixTime: maxMixTime
            };
            e.dataTransfer.setData('application/json', JSON.stringify(potData));
        });

        pot.addEventListener('dragover', (e) => {
            e.preventDefault();
            const ingredients = pot.querySelectorAll('.ingredient');
            if (ingredients.length < 3) {
                pot.classList.add('dragover');
            }
        });

        pot.addEventListener('drop', (e) => {
            e.preventDefault();
            pot.classList.remove('dragover');

            const ingredients = pot.querySelectorAll('.ingredient');
            if (ingredients.length >= 3) {
                alert('Maximum 3 ingrediënten per pot!');
                return;
            }

            try {
                const newIngredient = JSON.parse(e.dataTransfer.getData('application/json'));
                
                if (ingredients.length > 0) {
                    const existingSpeed = ingredients[0].dataset.speed;
                    if (newIngredient.mixSpeed != existingSpeed) {
                        alert('Ingrediënten moeten dezelfde mengsnelheid hebben!');
                        return;
                    }
                }

                const ingredientEl = createIngredientElement(newIngredient);
                const container = pot.querySelector('.ingredients-container');
                container.appendChild(ingredientEl);
                
                const ingredientCount = container.children.length;
                pot.style.width = ingredientCount > 1 ? '300px' : '180px';
                container.style.gridTemplateColumns = 
                    `repeat(${Math.min(ingredientCount, 3)}, 1fr)`;
                
                const allIngredients = pot.querySelectorAll('.ingredient');
                const maxTime = Math.max(...Array.from(allIngredients)
                    .map(ing => parseInt(ing.dataset.time)));
                pot.dataset.mixTime = maxTime;
            } catch (error) {
                console.error('Error adding ingredient:', error);
            }
        });
    }

    switchHall(hallId) {
        document.querySelectorAll('.mixing-hall').forEach(hall => {
            hall.classList.remove('active');
        });
        document.querySelectorAll('.hall-controls button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(hallId).classList.add('active');
        document.getElementById(`${hallId}Button`).classList.add('active');
    
        // Only disable ingredient creation in Hall 2
        const ingredientForm = document.getElementById('ingredientForm');
        if (hallId === 'hall2') {
            ingredientForm.classList.add('disabled');
            ingredientForm.querySelectorAll('input, select, button').forEach(el => {
                el.disabled = true;
            });
        } else {
            ingredientForm.classList.remove('disabled');
            ingredientForm.querySelectorAll('input, select, button').forEach(el => {
                el.disabled = false;
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new PotManager();
});

function createIngredientElement(ingredient) {
    const el = document.createElement('div');
    el.className = 'ingredient';
    el.dataset.speed = ingredient.mixSpeed;
    el.dataset.time = ingredient.mixTime;
    
    el.innerHTML = `
        <div class="ingredient-texture texture-${ingredient.structuur}" 
             style="background-color: ${ingredient.color}"></div>
    `;
    return el;
}