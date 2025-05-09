/**
 * Global configuration settings for the weather service and application
 * These settings control core functionality and weather-related behaviors
 */
const WEATHER_CONFIG = {
    // OpenWeatherMap API key for weather data retrieval
    API_KEY: '500d4789b535dad3de3dfafd9139c29d',
    
    // Default city for weather information
    CITY: 'Amsterdam,NL',
    
    // Weather update frequency (5 minutes)
    UPDATE_INTERVAL: 300000,
    
    // Temperature thresholds for weather effects
    WEATHER_EFFECTS: {
        COLD_TEMP: 10,    // Below this temperature is considered cold
        HOT_TEMP: 35,     // Above this temperature is considered hot
        
        // Mixing time modifiers for different weather conditions
        TIME_MODIFIERS: {
            COLD: 1.15,   // 15% increase in mixing time
            RAIN: 1.10,   // 10% increase in mixing time
            SNOW: 1.10    // 10% increase in mixing time
        }
    }
};