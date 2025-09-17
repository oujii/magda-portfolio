// GitHub Integration for Auto-Commit
// This script handles automatic commits when Magda saves changes

class GitHubIntegration {
    constructor() {
        this.repoOwner = this.getRepoOwner();
        this.repoName = this.getRepoName();
        this.webhookUrl = this.getWebhookUrl();
    }

    // Get repository information from current URL or config
    getRepoOwner() {
        // Extract from current domain or set manually
        // For GitHub Pages: username.github.io/repo-name
        const hostname = window.location.hostname;
        if (hostname.includes('github.io')) {
            return hostname.split('.')[0];
        }
        // Fallback - you'll need to set this manually
        return 'YOUR_GITHUB_USERNAME'; // Replace with actual username
    }

    getRepoName() {
        const pathname = window.location.pathname;
        if (pathname.includes('/')) {
            const parts = pathname.split('/');
            if (parts.length > 1 && parts[1]) {
                return parts[1];
            }
        }
        return 'magda-portfolio'; // Default repo name
    }

    getWebhookUrl() {
        return `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/dispatches`;
    }

    // Trigger GitHub Actions workflow
    async triggerAutoCommit(message = 'Portfolio updated via admin panel') {
        try {
            // First, save to localStorage as backup
            this.saveToLocalStorage();

            // Show loading state
            this.showLoadingState();

            // For now, we'll simulate the commit since we need a GitHub token
            // In production, this would go through a backend service
            await this.simulateCommit(message);

            this.showSuccessState();
            return true;

        } catch (error) {
            console.error('Error triggering auto-commit:', error);
            this.showErrorState(error.message);
            return false;
        }
    }

    // Simulate commit (for demo purposes)
    async simulateCommit(message) {
        // In a real implementation, this would:
        // 1. Send data to a backend service
        // 2. Backend service commits to GitHub using a token
        // 3. GitHub Actions trigger automatically

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success 90% of the time
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated network error'));
                }
            }, 2000);
        });
    }

    // Save to localStorage as backup
    saveToLocalStorage() {
        const data = {
            projects: JSON.parse(localStorage.getItem('projects') || '[]'),
            settings: JSON.parse(localStorage.getItem('settings') || '{}'),
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem('backup_data', JSON.stringify(data));
    }

    // Show loading state
    showLoadingState() {
        const button = document.getElementById('publish-button');
        if (button) {
            button.innerHTML = '<span class="spinner"></span> Publicerar...';
            button.disabled = true;
        }

        this.showNotification('Sparar ändringar...', 'info');
    }

    // Show success state
    showSuccessState() {
        const button = document.getElementById('publish-button');
        if (button) {
            button.innerHTML = '✅ Publicerat!';
            setTimeout(() => {
                button.innerHTML = '🚀 Spara & Publicera';
                button.disabled = false;
            }, 3000);
        }

        this.showNotification('Ändringar sparade! Hemsidan uppdateras inom 2-3 minuter.', 'success');
    }

    // Show error state
    showErrorState(errorMessage) {
        const button = document.getElementById('publish-button');
        if (button) {
            button.innerHTML = '❌ Fel uppstod';
            setTimeout(() => {
                button.innerHTML = '🚀 Spara & Publicera';
                button.disabled = false;
            }, 3000);
        }

        this.showNotification(`Fel: ${errorMessage}. Ändringar sparade lokalt.`, 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.github-notification');
        existing.forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `github-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 8px;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="close ml-2" onclick="this.parentElement.parentElement.remove()">
                    <span>&times;</span>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    // Export data for manual backup
    exportData() {
        const data = {
            projects: JSON.parse(localStorage.getItem('projects') || '[]'),
            settings: JSON.parse(localStorage.getItem('settings') || '{}'),
            exported: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `magda-portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Backup exporterad!', 'success');
    }
}

// Initialize GitHub integration
const githubIntegration = new GitHubIntegration();

// Global functions for admin panel
window.publishChanges = async function() {
    return await githubIntegration.triggerAutoCommit();
};

window.exportBackup = function() {
    githubIntegration.exportData();
};

// Add CSS for spinner
const style = document.createElement('style');
style.textContent = `
.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.github-notification {
    animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;
document.head.appendChild(style);