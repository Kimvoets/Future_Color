/**
 * Manages triadic color calculations and display
 * Triadic colors are three colors equally spaced around the color wheel (120° apart)
 */
class TriadicColorManager {
    constructor() {
        this.initializeEventListeners();
    }

    /**
     * Sets up click event listeners for color grid and test grid
     */
    initializeEventListeners() {
        // Listen for clicks on color grid cells
        document.addEventListener('click', (e) => {
            const colorCell = e.target.closest('.grid-cell');
            if (colorCell && colorCell.style.backgroundColor) {
                const color = colorCell.style.backgroundColor;
                this.showTriadicColors(color);
            }
        });
    }

    /**
     * Displays a popup with the base color and its triadic companions
     * @param {string} baseColor - The RGB color string (e.g., 'rgb(255, 0, 0)')
     */
    showTriadicColors(baseColor) {
        const rgb = this.parseRGBColor(baseColor);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const triadicColors = this.calculateTriadicColors(hsl);
        
        this.displayColorPopup(baseColor, triadicColors);
    }

    /**
     * Extracts RGB values from a color string
     * @param {string} color - RGB color string
     * @returns {Object} Object containing r, g, b values
     */
    parseRGBColor(color) {
        const match = color.match(/\d+/g);
        return {
            r: parseInt(match[0]),
            g: parseInt(match[1]),
            b: parseInt(match[2])
        };
    }

    /**
     * Converts RGB colors to HSL color space
     * HSL is better for calculating triadic colors as it uses angles
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {Object} HSL values with h in degrees, s and l in percentages
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic (gray)
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            // Calculate hue
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { 
            h: h * 360, // Convert to degrees
            s: s * 100, // Convert to percentage
            l: l * 100  // Convert to percentage
        };
    }

    /**
     * Calculates triadic colors by adding 120° and 240° to the base hue
     * @param {Object} hsl - Base color in HSL format
     * @returns {Array} Two triadic colors in HSL format
     */
    calculateTriadicColors(hsl) {
        const triadicAngles = [120, 240]; // Angles for triadic colors
        return triadicAngles.map(angle => {
            let newHue = (hsl.h + angle) % 360; // Keep hue within 0-360°
            return `hsl(${newHue}, ${hsl.s}%, ${hsl.l}%)`;
        });
    }

    /**
     * Creates and displays a popup with the base color and its triadic colors
     * @param {string} baseColor - Original RGB color
     * @param {Array} triadicColors - Array of HSL color strings
     */
    displayColorPopup(baseColor, triadicColors) {
        const popup = document.createElement('div');
        popup.className = 'triadic-popup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        
        popup.innerHTML = `
            <div class="triadic-colors">
                <div class="color-box" style="background-color: ${baseColor}">
                    <div class="color-info">Base Color</div>
                </div>
                ${triadicColors.map(color => `
                    <div class="color-box" style="background-color: ${color}">
                        <div class="color-info">Triadic Color</div>
                    </div>
                `).join('')}
            </div>
            <button class="close-popup">Close</button>
        `;

        document.body.appendChild(popup);
        popup.querySelector('.close-popup').onclick = () => popup.remove();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TriadicColorManager();
});