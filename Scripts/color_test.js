/**
 * Manages the color testing grid interface where users can test mixed colors
 * and create color patterns
 */
class ColorTestGrid {
    constructor() {
        this.selectedPalette = null;  // Stores the currently selected color from the palette
        this.init();
    }

    /**
     * Initializes the grid and sets up auto-refresh for new colors
     */
    init() {
        this.createGrid();
        this.loadMixedResults();

        // Refresh the color palette every 5 seconds to show newly mixed colors
        setInterval(() => this.loadMixedResults(), 5000);
    }

    /**
     * Loads and displays all mixed and created colors in the palette
     * Combines colors from both mixed results and created ingredients
     */
    loadMixedResults() {
        const resultsContainer = document.querySelector('.mixed-results');
        resultsContainer.innerHTML = '';
        
        // Load colors from both storage locations
        const mixedColors = JSON.parse(localStorage.getItem('mixedColors') || '[]');
        const createdIngredients = JSON.parse(localStorage.getItem('createdIngredients') || '[]');
        
        // Create a unique set of colors from both sources
        const allColors = new Set([
            ...mixedColors.map(c => c.color),
            ...createdIngredients.map(i => i.color)
        ]);
        
        // Create color boxes for each unique color
        allColors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.className = 'mixed-color-box';
            colorBox.style.backgroundColor = color;
            colorBox.addEventListener('click', () => this.selectPalette(colorBox, color));
            resultsContainer.appendChild(colorBox);
        });
    }

    /**
     * Creates the initial empty grid for color testing
     * Creates a 6x4 grid (24 cells) for color pattern creation
     */
    createGrid() {
        const grid = document.querySelector('.color-test-grid');
        for (let i = 0; i < 24; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.addEventListener('click', () => this.handleCellClick(cell));
            grid.appendChild(cell);
        }
    }

    /**
     * Handles the selection of a color from the palette
     * @param {HTMLElement} box - The color box element that was clicked
     * @param {string} color - The color value (RGB/HSL) of the selected color
     */
    selectPalette(box, color) {
        if (this.selectedPalette) {
            this.selectedPalette.classList.remove('selected');
        }
        this.selectedPalette = box;
        box.classList.add('selected');
        this.selectedColor = color;
    }

    /**
     * Handles clicking on a grid cell
     * Either applies the selected color or clears the cell
     * @param {HTMLElement} cell - The grid cell that was clicked
     */
    handleCellClick(cell) {
        if (this.selectedColor) {
            cell.style.backgroundColor = this.selectedColor;
            cell.classList.add('filled');
        } else if (cell.classList.contains('filled')) {
            cell.style.backgroundColor = '';
            cell.classList.remove('filled');
        }
    }
}

// Initialize the color test grid when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorTestGrid();
});
