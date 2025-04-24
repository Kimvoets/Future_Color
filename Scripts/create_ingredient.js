document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('ingredientForm');
    const output = document.getElementById('output');

    // Load existing ingredients
    loadSavedIngredients();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const ingredient = {
            name: document.getElementById('name').value,
            mengtijd: parseInt(document.getElementById('mengtijd').value),
            mengsnelheid: parseInt(document.getElementById('mengsnelheid').value),
            color: document.getElementById('color').value,
            structuur: document.getElementById('structuur').value
        };

        // Save ingredient
        saveIngredient(ingredient);
        
        // Display the ingredient
        displayIngredient(ingredient);

        // Reset form
        form.reset();
    });
});

function saveIngredient(ingredient) {
    let ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
    ingredients.push(ingredient);
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
}

function loadSavedIngredients() {
    const ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
    ingredients.forEach(ingredient => {
        displayIngredient(ingredient);
    });
}

function displayIngredient(ingredient) {
    const ingredientElement = document.createElement('div');
    ingredientElement.className = 'ingredient';

    const displayElement = document.createElement('div');
    displayElement.className = `texture-${ingredient.structuur}`;
    displayElement.style.setProperty('--color', ingredient.color);
    displayElement.style.width = '100px';
    displayElement.style.height = '100px';
    displayElement.style.margin = '10px';
    displayElement.style.border = '1px solid #ccc';

    const info = document.createElement('div');
    info.innerHTML = `
        <h3>${ingredient.name}</h3>
        <p>Mengtijd: ${ingredient.mengtijd} sec</p>
        <p>Mengsnelheid: ${ingredient.mengsnelheid}</p>
        <p>Structuur: ${ingredient.structuur}</p>
    `;

    ingredientElement.appendChild(displayElement);
    ingredientElement.appendChild(info);
    output.appendChild(ingredientElement);
}

