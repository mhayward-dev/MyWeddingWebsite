/**
 * Site authentication module
 * Handles password protection via Firebase Cloud Function
 */

const Auth = {
    TOKEN_KEY: 'wedding_auth_token',
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        return !!token;
    },
    
    /**
     * Get stored auth token
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },
    
    /**
     * Store auth token
     */
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },
    
    /**
     * Clear auth token (logout)
     */
    clearToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    },
    
    /**
     * Verify password with server
     */
    async verifyPassword(password) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.setToken(data.token);
                return { success: true };
            } else {
                return { 
                    success: false, 
                    error: data.error || 'Invalid password' 
                };
            }
        } catch (error) {
            console.error('Auth error:', error);
            return { 
                success: false, 
                error: 'Connection error. Please try again.' 
            };
        }
    },
    
    /**
     * Show login overlay if not authenticated
     */
    init() {
        if (this.isAuthenticated()) {
            this.hideOverlay();
            return;
        }
        
        this.showOverlay();
        this.attachEventListeners();
    },
    
    /**
     * Show the login overlay
     */
    showOverlay() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    /**
     * Hide the login overlay
     */
    hideOverlay() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    /**
     * Attach event listeners for the login form
     */
    attachEventListeners() {
        const form = document.getElementById('authForm');
        const input = document.getElementById('authPassword');
        const errorEl = document.getElementById('authError');
        
        if (!form || !input) return;
        
        // Focus password input
        setTimeout(() => input.focus(), 100);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = input.value.trim();
            if (!password) return;
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '...';
            errorEl.style.display = 'none';
            
            const result = await this.verifyPassword(password);
            
            if (result.success) {
                this.hideOverlay();
            } else {
                errorEl.textContent = result.error;
                errorEl.style.display = 'block';
                input.value = '';
                input.focus();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => Auth.init());
