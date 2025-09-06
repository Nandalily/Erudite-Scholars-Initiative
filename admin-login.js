// ESI Admin Login System
class AdminAuth {
    constructor() {
        this.maxAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
        this.extendedSessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.failedAttempts = 0;
        this.lastFailedAttempt = 0;
        this.isAuthenticating = false;
        
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.loadFailedAttempts();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Add input event listeners for real-time validation
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) {
            usernameInput.addEventListener('input', () => this.validateInputs());
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.validateInputs());
        }
    }

    checkExistingSession() {
        const session = this.getSession();
        if (session && session.isValid) {
            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('admin-login.html')) {
                this.redirectToDashboard();
            }
        }
    }

    loadFailedAttempts() {
        const stored = localStorage.getItem('esiFailedAttempts');
        if (stored) {
            const data = JSON.parse(stored);
            this.failedAttempts = data.count || 0;
            this.lastFailedAttempt = data.timestamp || 0;
        }
    }

    saveFailedAttempts() {
        const data = {
            count: this.failedAttempts,
            timestamp: this.lastFailedAttempt
        };
        localStorage.setItem('esiFailedAttempts', JSON.stringify(data));
    }

    isAccountLocked() {
        if (this.failedAttempts >= this.maxAttempts) {
            const timeSinceLastAttempt = Date.now() - this.lastFailedAttempt;
            if (timeSinceLastAttempt < this.lockoutDuration) {
                return true;
            } else {
                // Reset lockout after duration expires
                this.failedAttempts = 0;
                this.saveFailedAttempts();
                return false;
            }
        }
        return false;
    }

    getRemainingLockoutTime() {
        if (!this.isAccountLocked()) return 0;
        
        const timeSinceLastAttempt = Date.now() - this.lastFailedAttempt;
        const remaining = this.lockoutDuration - timeSinceLastAttempt;
        return Math.ceil(remaining / 1000 / 60); // Return minutes
    }

    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isAuthenticating) return; // Prevent multiple submissions
        
        if (this.isAccountLocked()) {
            const remainingMinutes = this.getRemainingLockoutTime();
            this.showError(`Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`);
            return;
        }

        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';

        // Validate inputs
        if (!this.validateInputs()) {
            return;
        }

        // Show loading state
        this.setLoadingState(true);
        this.isAuthenticating = true;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (this.authenticateUser(username, password)) {
                this.loginSuccess(username, rememberMe);
            } else {
                this.loginFailed();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('An unexpected error occurred. Please try again.');
        } finally {
            this.setLoadingState(false);
            this.isAuthenticating = false;
        }
    }

    validateInputs() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const loginBtn = document.getElementById('loginBtn');
        
        let isValid = true;
        
        // Username validation
        if (username.length < 3) {
            this.showFieldError('username', 'Username must be at least 3 characters');
            isValid = false;
        } else {
            this.clearFieldError('username');
        }
        
        // Password validation
        if (password.length < 6) {
            this.showFieldError('password', 'Password must be at least 6 characters');
            isValid = false;
        } else {
            this.clearFieldError('password');
        }
        
        // Update button state
        if (loginBtn) {
            loginBtn.disabled = !isValid;
            loginBtn.style.opacity = isValid ? '1' : '0.6';
        }
        
        return isValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            // Remove existing error
            this.clearFieldError(fieldId);
            
            // Add error styling
            field.style.borderColor = '#e74c3c';
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                color: #e74c3c;
                font-size: 0.8rem;
                margin-top: 0.3rem;
                margin-left: 0.5rem;
            `;
            
            field.parentNode.appendChild(errorDiv);
        }
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#ddd';
            
            // Remove existing error message
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
        }
    }

    authenticateUser(username, password) {
        // ESI Admin Credentials
        const validCredentials = {
            username: 'admin',
            password: 'martin2024'
        };

        return username === validCredentials.username && password === validCredentials.password;
    }

    loginSuccess(username, rememberMe) {
        console.log('Login successful for:', username);
        
        // Create session
        const session = {
            username: username,
            loginTime: Date.now(),
            expiresAt: rememberMe ? 
                Date.now() + this.extendedSessionTimeout : 
                Date.now() + this.sessionTimeout,
            rememberMe: rememberMe,
            isValid: true
        };

        console.log('Created session:', session);
        console.log('Session expires at:', new Date(session.expiresAt));

        // Save session
        localStorage.setItem('esiAdminSession', JSON.stringify(session));
        
        // Verify session was saved
        const savedSession = localStorage.getItem('esiAdminSession');
        console.log('Saved session to localStorage:', savedSession);
        
        // Log successful login
        this.logActivity('LOGIN_SUCCESS', username);
        
        // Reset failed attempts
        this.failedAttempts = 0;
        this.saveFailedAttempts();
        
        // Show success message and redirect immediately
        this.showSuccess('Login successful! Redirecting to dashboard...');
        
        console.log('About to redirect to dashboard...');
        
        // Redirect immediately without delay
        this.redirectToDashboard();
    }

    redirectToDashboard() {
        console.log('redirectToDashboard called');
        
        // Clear any existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        console.log('Cleared notifications, redirecting to admin.html');
        
        // Use replace to prevent back button issues and multiple redirects
        window.location.replace('admin.html');
    }

    loginFailed() {
        this.failedAttempts++;
        this.lastFailedAttempt = Date.now();
        this.saveFailedAttempts();
        
        this.logActivity('LOGIN_FAILED', document.getElementById('username').value);
        
        if (this.failedAttempts >= this.maxAttempts) {
            this.showError(`Too many failed attempts. Account locked for ${Math.ceil(this.lockoutDuration / 1000 / 60)} minutes.`);
        } else {
            const remainingAttempts = this.maxAttempts - this.failedAttempts;
            this.showError(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
        }
        
        // Clear password field
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }

    setLoadingState(isLoading) {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            if (isLoading) {
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                loginBtn.disabled = true;
            } else {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to Dashboard';
                loginBtn.disabled = false;
            }
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        if (type === 'error') {
            notification.style.background = '#e74c3c';
        } else {
            notification.style.background = '#27ae60';
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    getSession() {
        const sessionData = localStorage.getItem('esiAdminSession');
        if (!sessionData) return null;

        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();
            
            if (now > session.expiresAt) {
                localStorage.removeItem('esiAdminSession');
                return null;
            }
            
            return session;
        } catch (error) {
            console.error('Error parsing session:', error);
            localStorage.removeItem('esiAdminSession');
            return null;
        }
    }

    logActivity(action, username, details = '') {
        const logEntry = {
            action: action,
            username: username,
            details: details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: '127.0.0.1' // In a real app, this would come from the server
        };

        const logs = JSON.parse(localStorage.getItem('esiAdminLogs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 1000 log entries
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('esiAdminLogs', JSON.stringify(logs));
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .input-group {
        position: relative;
    }
    
    .input-group input {
        padding-left: 3rem;
        width: 100%;
    }
    
    .input-group i:first-child {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #1e3c72;
        z-index: 1;
    }
    
    .toggle-password {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 0.5rem;
        z-index: 1;
    }
    
    .toggle-password:hover {
        color: #1e3c72;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 0.9rem;
        color: #666;
    }
    
    .checkbox-label input[type="checkbox"] {
        margin-right: 0.5rem;
        width: auto;
    }
    
    .login-btn {
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        padding: 1rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .login-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #2a5298, #1e3c72);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(30, 60, 114, 0.3);
    }
    
    .login-btn:disabled {
        background: #95a5a6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
    
    .back-link {
        color: #1e3c72;
        text-decoration: none;
        font-weight: bold;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        transition: color 0.3s ease;
    }
    
    .back-link:hover {
        color: #2a5298;
    }
    
    .login-section {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        min-height: 100vh;
        padding: 2rem 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .login-container {
        background: white;
        border-radius: 20px;
        padding: 3rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        max-width: 500px;
        width: 100%;
    }
    
    .login-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .login-header i {
        font-size: 3rem;
        color: #1e3c72;
        margin-bottom: 1rem;
    }
    
    .login-header h2 {
        color: #1e3c72;
        margin-bottom: 0.5rem;
        font-size: 2rem;
    }
    
    .login-header p {
        color: #666;
        font-size: 0.9rem;
    }
    
    .login-form .form-group {
        margin-bottom: 1.5rem;
    }
    
    .form-group input {
        padding: 0.8rem;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
        width: 100%;
    }
    
    .form-group input:focus {
        outline: none;
        border-color: #1e3c72;
    }
    
    .login-footer {
        text-align: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e9ecef;
    }
    
    .login-footer p {
        color: #666;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .login-container {
            padding: 2rem;
            margin: 1rem;
        }
        
        .login-header h2 {
            font-size: 1.5rem;
        }
    }
`;

document.head.appendChild(style);

// Initialize admin authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});

console.log('ESI Admin Login System loaded successfully!'); 