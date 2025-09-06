// MARTIN Website Configuration
// This file contains all configurable settings for the website

const MARTIN_CONFIG = {
    // Admin Authentication
    admin: {
        username: 'admin',
        password: 'martin2024',
        sessionTimeout: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
        rememberMeDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        maxFailedAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes in milliseconds
    },
    
    // Company Information
    company: {
        name: 'MARTIN',
        adminEmail: 'nankundlilian5@gmail.com',
        website: window.location.origin,
        supportEmail: 'support@martin.com'
    },
    
    // Google Form Integration
    googleForm: {
        url: 'https://forms.gle/uKj4a9y4v9hX8t7T8',
        height: 600,
        title: 'Apply for Opportunities'
    },
    
    // Security Settings
    security: {
        enableBruteForceProtection: true,
        enableSessionMonitoring: true,
        enableAccessLogging: true,
        requireHttps: false // Set to true in production
    },
    
    // UI Settings
    ui: {
        primaryColor: '#1e3c72',
        secondaryColor: '#2a5298',
        accentColor: '#ffd700',
        enableAnimations: true,
        enableNotifications: true
    },
    
    // Feature Flags
    features: {
        enableCompetitionManagement: true,
        enableMessageMonitoring: true,
        enableApplicationTracking: true,
        enableEmailNotifications: true,
        enableUserManagement: false // Future feature
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MARTIN_CONFIG;
} else {
    // Browser environment
    window.MARTIN_CONFIG = MARTIN_CONFIG;
}

// Configuration validation
function validateConfig() {
    const requiredFields = [
        'admin.username',
        'admin.password',
        'company.adminEmail',
        'googleForm.url'
    ];
    
    const errors = [];
    
    requiredFields.forEach(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], MARTIN_CONFIG);
        if (!value) {
            errors.push(`Missing required configuration: ${field}`);
        }
    });
    
    if (errors.length > 0) {
        console.error('Configuration validation failed:', errors);
        return false;
    }
    
    console.log('Configuration validated successfully');
    return true;
}

// Initialize configuration
document.addEventListener('DOMContentLoaded', () => {
    validateConfig();
});

// Configuration update function (for admin use)
function updateConfig(key, value) {
    const keys = key.split('.');
    let current = MARTIN_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    console.log(`Configuration updated: ${key} = ${value}`);
}

// Example usage:
// updateConfig('admin.username', 'newadmin');
// updateConfig('ui.primaryColor', '#000000'); 