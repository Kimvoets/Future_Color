/**
 * Handles the creation and management of color ingredients
 * Includes form handling, ingredient display, and storage functionality
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize weather service for environmental effects
    const weatherService = new WeatherService();
    
    // Load and display initial test ingredients
    const { testIngredients } = TestDataManager.initializeTestData();
    testIngredients.forEach(displayIngredient);

    // Cache frequently used DOM elements for better performance
    const form = document.getElementById('ingredientForm');
    const colorType = document.getElementById('colorType');
    const colorInputs = document.getElementById('colorInputs');
    
    /**
     * Updates the color input fields based on selected color type
     * Switches between RGB and HSL input modes
     * @param {string} type - The color type ('RGB' or 'HSL')
     */
    function updateColorInputs(type) {
        if (type === 'RGB') {
            colorInputs.innerHTML = `
                <div class="color-inputs">
                    <div class="color-input-group">
                        <label for="r">R:</label>
                        <input type="number" id="r" min="0" max="255" required />
                    </div>
                    <div class="color-input-group">
                        <label for="g">G:</label>
                        <input type="number" id="g" min="0" max="255" required />
                    </div>
                    <div class="color-input-group">
                        <label for="b">B:</label>
                        <input type="number" id="b" min="0" max="255" required />
                    </div>
                </div>
            `;
        } else {
            colorInputs.innerHTML = `
                <div class="color-group">
                    <label>H:</label>
                    <input type="number" id="h" min="0" max="360" required />
                    <label>S:</label>
                    <input type="number" id="s" min="0" max="100" required />
                    <label>L:</label>
                    <input type="number" id="l" min="0" max="100" required />
                </div>
            `;
        }
    }

    // Form submission handler for creating new ingredients
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Create ingredient object from form data
        const ingredient = {
            name: document.getElementById('name').value,
            mixTime: parseInt(document.getElementById('mixTime').value),
            mixSpeed: parseInt(document.getElementById('mixSpeed').value),
            colorType: colorType.value,
            color: colorType.value === 'RGB' 
                ? `rgb(${document.getElementById('r').value}, ${document.getElementById('g').value}, ${document.getElementById('b').value})`
                : `hsl(${document.getElementById('h').value}, ${document.getElementById('s').value}%, ${document.getElementById('l').value}%)`,
            structuur: document.getElementById('structuur').value
        };

        displayIngredient(ingredient);
        form.reset();
        updateColorInputs('RGB');
    });

    // Reset functionality handler
    document.getElementById('resetButton').addEventListener('click', () => {
        if (confirm('Weet je zeker dat je alle opgeslagen kleuren wilt verwijderen?')) {
            // Clear stored data while preserving test ingredients
            localStorage.removeItem('mixedColors');
            localStorage.removeItem('createdIngredients');
            
            // Reset UI elements
            document.querySelector('.mixed-pots-grid').innerHTML = '';
            document.getElementById('output').innerHTML = '';
            
            // Reload test ingredients
            testIngredients.forEach(displayIngredient);
        }
    });

    // Add navigation functionality
    document.getElementById('colorTestNav').addEventListener('click', () => {
        window.location.href = 'color_test.html';
    });

    document.getElementById('hall1Nav').addEventListener('click', () => {
        showHall('hall1');
    });

    document.getElementById('hall2Nav').addEventListener('click', () => {
        showHall('hall2');
    });

    /**
     * Shows or hides a specific mixing hall and updates navigation state
     * @param {string} hallId - The ID of the hall to show ('hall1' or 'hall2')
     */
    function showHall(hallId) {
        // Enable functionality for both halls
        document.querySelectorAll('.mixing-hall').forEach(hall => {
            hall.classList.remove('active');
            hall.style.pointerEvents = 'auto'; // Enable interaction
            hall.style.opacity = '1'; // Make fully visible
        });
        
        document.querySelectorAll('.nav-buttons button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(hallId).classList.add('active');
        document.getElementById(`${hallId}Nav`).classList.add('active');
    }
});

/**
 * Creates and displays a new ingredient element in the output container
 * Checks for duplicates and saves to localStorage
 * @param {Object} ingredient - The ingredient data object
 * @param {string} ingredient.name - Name of the ingredient
 * @param {number} ingredient.mixTime - Mixing time in seconds
 * @param {number} ingredient.mixSpeed - Speed of mixing in RPM
 * @param {string} ingredient.color - Color value in RGB or HSL format
 * @param {string} ingredient.structuur - Texture type of the ingredient
 */
// In the displayIngredient function, update the storage part:
function displayIngredient(ingredient) {
    // Check if ingredient already exists by name and color
    const existingIngredients = document.querySelectorAll('#output .ingredient');
    for (let existing of existingIngredients) {
        const existingName = existing.querySelector('.ingredient-info div').textContent;
        if (existingName === ingredient.name) {
            return; // Skip if duplicate
        }
    }

    const ingredientElement = document.createElement('div');
    ingredientElement.className = 'ingredient';
    ingredientElement.draggable = true;
    
    ingredientElement.dataset.speed = ingredient.mixSpeed;
    ingredientElement.dataset.time = ingredient.mixTime;
    ingredientElement.dataset.color = ingredient.color;
    ingredientElement.dataset.structuur = ingredient.structuur;

    ingredientElement.innerHTML = `
        <div class="ingredient-texture texture-${ingredient.structuur}" 
             style="background-color: ${ingredient.color}"></div>
        <div class="ingredient-info">
            <div>${ingredient.name}</div>
            <div>Mengtijd: ${ingredient.mixTime} sec</div>
            <div>RPM: ${ingredient.mixSpeed}</div>
        </div>
    `;

    ingredientElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(ingredient));
    });

    document.getElementById('output').appendChild(ingredientElement);
    
    // Save to localStorage only if it's not a test ingredient
    if (!ingredient.isTest) {
        const savedIngredients = JSON.parse(localStorage.getItem('createdIngredients') || '[]');
        if (!savedIngredients.some(saved => saved.name === ingredient.name)) {
            savedIngredients.push(ingredient);
            localStorage.setItem('createdIngredients', JSON.stringify(savedIngredients));
        }
    }
}

// Add this to your DOMContentLoaded event listener:
document.addEventListener('DOMContentLoaded', () => {
    // Load saved ingredients first
    const savedIngredients = JSON.parse(localStorage.getItem('createdIngredients') || '[]');
    savedIngredients.forEach(ingredient => displayIngredient(ingredient));

    // Then load test ingredients, marking them as test
    const { testIngredients } = TestDataManager.initializeTestData();
    testIngredients.forEach(ingredient => {
        ingredient.isTest = true;
        displayIngredient(ingredient);
    });

    // Load saved mixed colors
    const savedMixedColors = JSON.parse(localStorage.getItem('mixedColors') || '[]');
    savedMixedColors.forEach(colorData => {
        const mixedResult = document.createElement('div');
        mixedResult.className = 'mixed-result';
        mixedResult.innerHTML = `
            <div class="mixed-color" style="background-color: ${colorData.color}"></div>
            <div class="mixed-info">
                <div>Gemengd resultaat</div>
                <div>Mengtijd: ${colorData.mixTime} sec</div>
            </div>
        `;
        document.querySelector('.mixed-pots-grid').appendChild(mixedResult);
    });
});

// Update the reset button functionality:
document.getElementById('resetButton').addEventListener('click', () => {
    if (confirm('Weet je zeker dat je alle opgeslagen kleuren wilt verwijderen?')) {
        localStorage.removeItem('mixedColors');
        localStorage.removeItem('createdIngredients');
        
        // Clear UI
        document.querySelector('.mixed-pots-grid').innerHTML = '';
        document.getElementById('output').innerHTML = '';
        
        // Reload only test ingredients
        const { testIngredients } = TestDataManager.initializeTestData();
        testIngredients.forEach(ingredient => {
            ingredient.isTest = true;
            displayIngredient(ingredient);
        });
    }
});

/**
 * Saves all currently displayed ingredients to localStorage
 * Used to persist color data between sessions
 */
function saveColors() {
    const createdColors = Array.from(document.querySelectorAll('#output .ingredient')).map(ing => ({
        color: ing.querySelector('.ingredient-texture').style.backgroundColor,
        name: ing.querySelector('.ingredient-info').textContent,
        mixTime: ing.dataset.mixTime,
        mixSpeed: ing.dataset.mixSpeed,
        structuur: ing.dataset.structuur
    }));
    localStorage.setItem('createdColors', JSON.stringify(createdColors));
}

/**
 * Secondary form submit handler for ingredient creation
 * Creates ingredient and updates storage
 */
document.getElementById('ingredientForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Create the ingredient object without weather modifications
    const ingredient = {
        name: document.getElementById('name').value,
        mixTime: parseInt(document.getElementById('mixTime').value),
        mixSpeed: parseInt(document.getElementById('mixSpeed').value),
        colorType: colorType.value,
        color: colorType.value === 'RGB' 
            ? `rgb(${document.getElementById('r').value}, ${document.getElementById('g').value}, ${document.getElementById('b').value})`
            : `hsl(${document.getElementById('h').value}, ${document.getElementById('s').value}%, ${document.getElementById('l').value}%)`,
        structuur: document.getElementById('structuur').value
    };

    displayIngredient(ingredient);
    form.reset();
    updateColorInputs('RGB');
    saveColors();
});

