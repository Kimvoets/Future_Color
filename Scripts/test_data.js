/**
 * Manages test data for the color mixing application
 * Provides sample ingredients and colors for testing
 */
class TestDataManager {
    /**
     * Initializes test data with predefined colors and ingredients
     * @returns {Object} Object containing test ingredients and colors
     */
    static initializeTestData() {
        const testIngredients = [
            {
                name: 'Rood Pigment',
                mixTime: 30,
                mixSpeed: 100,
                color: 'rgb(255, 0, 0)',
                structuur: 'smooth'
            },
            {
                name: 'Blauw Pigment',
                mixTime: 45,
                mixSpeed: 150,
                color: 'rgb(0, 0, 255)',
                structuur: 'granular'
            },
            {
                name: 'Geel Pigment',
                mixTime: 25,
                mixSpeed: 120,
                color: 'rgb(255, 255, 0)',
                structuur: 'powder'
            }
        ];

        return { testIngredients };
    }

    /**
     * Loads test data into local storage if not already present
     */
    static loadTestData() {
        if (!localStorage.getItem('testDataLoaded')) {
            const { testIngredients } = this.initializeTestData();
            localStorage.setItem('createdIngredients', JSON.stringify(testIngredients));
            localStorage.setItem('testDataLoaded', 'true');
        }
    }
}

// Initialize test data when the script loads
TestDataManager.loadTestData();