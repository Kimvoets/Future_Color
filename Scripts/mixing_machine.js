/**
 * Manages the creation and behavior of mixing machines
 */
class MixingMachineManager {
    constructor() {
        // Store machines for each hall
        this.machines = {
            hall1: [],
            hall2: []
        };
        this.maxMachinesPerHall = 5;
        this.weatherService = new WeatherService();
        this.init();
    }

    /**
     * Checks if a new machine can be added based on weather conditions
     * @param {string} hallKey - The hall identifier
     * @returns {boolean} Whether a new machine can be added
     */
    canAddMachine(hallKey) {
        const weather = this.weatherService.getWeather();
        const currentMachines = this.machines[hallKey].length;

        if (weather && weather.temperature > 35 && currentMachines >= 1) {
            alert('Bij hoge temperaturen is maximaal 1 machine per hal toegestaan');
            return false;
        }
        
        if (currentMachines >= this.maxMachinesPerHall) {
            alert('Maximum aantal mengmachines bereikt (5)');
            return false;
        }

        return true;
    }

    init() {
        const addButtons = document.querySelectorAll('.add-machine-button');
        addButtons.forEach(button => {
            button.addEventListener('click', () => {
                const hallNumber = button.dataset.hall;
                this.showMachineDialog(hallNumber);
            });
        });
    }

    showMachineDialog(hallNumber) {
        const weather = this.weatherService.getWeather();
        const hallKey = `hall${hallNumber}`;
        
        // Check weather-based machine limits
        if (weather && weather.temperature > 35 && this.machines[hallKey].length >= 1) {
            alert('Bij hoge temperaturen is maximaal 1 machine per hal toegestaan');
            return;
        }
        
        // Check regular machine limit
        if (this.machines[hallKey].length >= this.maxMachinesPerHall) {
            alert('Maximum aantal mengmachines bereikt (5)');
            return;
        }

        const dialog = document.createElement('dialog');
        dialog.innerHTML = `
            <form method="dialog" class="machine-form">
                <h2>Nieuwe Mengmachine</h2>
                <div class="form-group">
                    <label for="speed">Mengsnelheid (RPM):</label>
                    <input type="number" id="speed" min="1" max="1000" required>
                </div>
                <div class="form-group">
                    <label for="time">Mengtijd (seconden):</label>
                    <input type="number" id="time" min="1" max="3600" required>
                </div>
                <div class="button-group">
                    <button type="submit">Toevoegen</button>
                    <button type="button" class="cancel">Annuleren</button>
                </div>
            </form>
        `;

        document.body.appendChild(dialog);
        const form = dialog.querySelector('form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createMachine(hallNumber, {
                speed: form.speed.value,
                time: form.time.value
            });
            dialog.remove();
        });

        dialog.querySelector('.cancel').addEventListener('click', () => dialog.remove());
        dialog.showModal();
    }

    createMachine(hallNumber, settings) {
        const weather = this.weatherService.getWeather();
        let modifiedTime = parseInt(settings.time);
        let modifierText = '';
        
        if (weather) {
            if (['Rain', 'Snow'].includes(weather.condition)) {
                modifiedTime *= 1.1;
                modifierText += ' (+10% Regen/Sneeuw)';
            }
            if (weather.temperature < 10) {
                modifiedTime *= 1.15;
                modifierText += ' (+15% Lage temperatuur)';
            }
        }

        modifiedTime = Math.round(modifiedTime);

        const machine = {
            id: Date.now(),
            speed: settings.speed,
            baseTime: settings.time,
            time: modifiedTime,
            status: 'Beschikbaar',
            modifierText: modifierText
        };

        this.machines[`hall${hallNumber}`].push(machine);
        this.renderMachine(hallNumber, machine);
    }

    renderMachine(hallNumber, machine) {
        const machineElement = document.createElement('div');
        machineElement.className = 'mixing-machine';
        machineElement.dataset.machineId = machine.id;
        machineElement.innerHTML = `
            <div class="machine-header">Machine ${this.machines[`hall${hallNumber}`].length}</div>
            <div class="machine-settings">
                <div>${machine.speed} RPM</div>
                <div>Basis tijd: ${machine.baseTime} sec</div>
                ${machine.modifierText ? `<div class="time-modifier">Totale tijd: ${machine.time} sec${machine.modifierText}</div>` : ''}
            </div>
            <div class="pot-drop-zone">Sleep pot hier</div>
        `;

        this.setupPotDropZone(machineElement);
        document.querySelector(`#hall${hallNumber} .mixing-machines-grid`).appendChild(machineElement);
    }

    setupPotDropZone(machineElement) {
        machineElement.addEventListener('dragover', (e) => {
            if (e.target.closest('.pot-drop-zone') && !machineElement.querySelector('.pot')) {
                e.preventDefault();
                machineElement.classList.add('dragover');
            }
        });

        machineElement.addEventListener('drop', (e) => {
            e.preventDefault();
            machineElement.classList.remove('dragover');

            if (machineElement.querySelector('.pot')) {
                alert('Deze machine heeft al een pot!');
                return;
            }

            const potData = JSON.parse(e.dataTransfer.getData('application/json'));
            const dropZone = machineElement.querySelector('.pot-drop-zone');
            dropZone.innerHTML = potData.html;
            dropZone.classList.add('has-pot');

            const pot = dropZone.querySelector('.pot');
            this.startMixing(machineElement, pot, potData.mixTime);
        });
    }

    startMixing(machineElement, pot, mixTime) {
        pot.classList.add('mixing');
        
        // Apply weather modifiers to mixing time
        const weather = this.weatherService.getWeather();
        let modifiedMixTime = mixTime;
        let modifierText = '';
        
        if (weather) {
            if (['Rain', 'Snow'].includes(weather.condition)) {
                modifiedMixTime *= 1.1;
                modifierText += ' (+10% Regen/Sneeuw)';
            }
            if (weather.temperature < 10) {
                modifiedMixTime *= 1.15;
                modifierText += ' (+15% Lage temperatuur)';
            }
        }

        modifiedMixTime = Math.round(modifiedMixTime);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'mix-progress';
        progressBar.innerHTML = `
            <div class="progress-bar"></div>
            <div class="progress-text">Mixing: 0%</div>
            <div class="time-info">Basis mengtijd: ${mixTime}s${modifierText}<br>Totale mengtijd: ${modifiedMixTime}s</div>
        `;
        pot.appendChild(progressBar);

        // Get all colors from ingredients
        const ingredients = pot.querySelectorAll('.ingredient');
        const colors = Array.from(ingredients).map(ing => {
            const colorDiv = ing.querySelector('.ingredient-texture');
            return colorDiv.style.backgroundColor;
        });

        let progress = 0;
        const interval = setInterval(() => {
            progress++;
            const percentage = Math.min(100, (progress / modifiedMixTime) * 100);
            progressBar.querySelector('.progress-bar').style.width = `${percentage}%`;
            progressBar.querySelector('.progress-text').textContent = `Mixing: ${Math.round(percentage)}%`;

            if (progress >= modifiedMixTime) {
                clearInterval(interval);
                this.finishMixing(machineElement, pot, colors);
            }
        }, 1000);
    }

    finishMixing(machine, pot, colors) {
        const mixedColor = this.calculateMixedColor(colors);
        const storage = document.querySelector('.mixed-pots-grid');
        
        // Save mixed color with more details
        const mixedColors = JSON.parse(localStorage.getItem('mixedColors') || '[]');
        const colorData = {
            color: mixedColor,
            timestamp: new Date().toISOString(),
            ingredients: Array.from(pot.querySelectorAll('.ingredient')).map(ing => ({
                color: ing.dataset.color,
                structuur: ing.dataset.structuur
            }))
        };
        mixedColors.push(colorData);
        localStorage.setItem('mixedColors', JSON.stringify(mixedColors));
        
        const mixedResult = document.createElement('div');
        mixedResult.className = 'mixed-result';
        mixedResult.innerHTML = `
            <div class="mixed-color" style="background-color: ${mixedColor}"></div>
            <div class="mixed-info">
                <div>Gemengd resultaat</div>
                <div>Mengtijd: ${pot.dataset.mixTime} sec</div>
            </div>
        `;
        
        storage.appendChild(mixedResult);
        pot.remove();
        machine.querySelector('.pot-drop-zone').classList.remove('has-pot');
    }

    calculateMixedColor(colors) {
        // Simple color mixing logic (average RGB values)
        const rgbValues = colors.map(color => {
            const match = color.match(/\d+/g);
            return match ? match.map(Number) : [0, 0, 0];
        });

        const mixed = rgbValues.reduce((acc, curr) => {
            return [acc[0] + curr[0], acc[1] + curr[1], acc[2] + curr[2]];
        }, [0, 0, 0]);

        const avgRGB = mixed.map(val => Math.round(val / colors.length));
        return `rgb(${avgRGB.join(',')})`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MixingMachineManager();
});

class MixingMachine {
    constructor(hallNumber) {
        this.hallNumber = hallNumber;
        this.weatherService = new WeatherService();
        this.checkWeatherEffects();

        document.addEventListener('weatherUpdate', () => {
            this.checkWeatherEffects();
        });
    }

    checkWeatherEffects() {
        const weather = this.weatherService.getWeather();
        if (!weather) return;

        const machines = document.querySelectorAll(`.mixing-machines-grid[data-hall="${this.hallNumber}"] .mixing-machine`);
        const addMachineButtons = document.querySelectorAll(`.add-machine-button[data-hall="${this.hallNumber}"]`);

        // Reset all machines first
        machines.forEach(machine => {
            machine.classList.remove('disabled', 'weather-affected');
            if (!machine.querySelector('.pot')) {
                machine.querySelector('.pot-drop-zone').innerHTML = 'Sleep pot hier';
            }
        });

        // Apply weather effects
        if (weather.temperature > 35) {
            // High temperature: limit to 1 machine per hall
            machines.forEach((machine, index) => {
                if (index > 0) {
                    machine.classList.add('disabled');
                    machine.querySelector('.pot-drop-zone').innerHTML = 'Machine uitgeschakeld (Hoge temperatuur)';
                }
            });
            addMachineButtons.forEach(button => {
                button.disabled = machines.length >= 1;
                if (button.disabled) {
                    button.title = 'Maximaal 1 machine toegestaan bij hoge temperatuur';
                }
            });
        }

        // Add visual indicators for mixing time modifiers
        if (['Rain', 'Snow'].includes(weather.condition) || weather.temperature < 10) {
            machines.forEach(machine => {
                if (!machine.classList.contains('disabled')) {
                    machine.classList.add('weather-affected');
                    let effectText = '';
                    if (['Rain', 'Snow'].includes(weather.condition)) {
                        effectText += 'Mengtijd +10% (Regen/Sneeuw)\n';
                    }
                    if (weather.temperature < 10) {
                        effectText += 'Mengtijd +15% (Lage temperatuur)';
                    }
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'weather-effect-info';
                    infoDiv.textContent = effectText.trim();
                    machine.appendChild(infoDiv);
                }
            });
        }
    }
}