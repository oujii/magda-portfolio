// Admin Panel JavaScript

// Simple password (in production, this should be more secure)
const ADMIN_PASSWORD = 'magda2024';

let projects = [];
let settings = {};
let isEditing = false;
let editingProjectId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

// Show login screen
function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

// Show admin dashboard
function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadData();
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    // Project form
    document.getElementById('add-project-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProject();
    });

    // Top bar form
    document.getElementById('topbar-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTopBarSettings();
    });

    // Contact form
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveContactSettings();
    });
}

// Load all data
async function loadData() {
    await loadProjects();
    await loadSettings();
    updateDashboardStats();
    loadProjectsList();
    loadSettingsForm();
}

// Load projects from JSON
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        if (response.ok) {
            projects = await response.json();
        } else {
            projects = [];
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projects = [];
    }
}

// Load settings from JSON
async function loadSettings() {
    try {
        const response = await fetch('data/settings.json');
        if (response.ok) {
            settings = await response.json();
        } else {
            settings = getDefaultSettings();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        settings = getDefaultSettings();
    }
}

// Get default settings
function getDefaultSettings() {
    return {
        topBar: {
            text: "🎨 Nya underlägg nu tillgängliga! Handgjorda av Magda",
            linkText: "Läs mer",
            linkUrl: "contact.html"
        },
        contact: {
            email: "magda@example.com",
            phone: "070-123 45 67"
        }
    };
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalProjects = projects.length;
    const availableProjects = projects.filter(p => p.available).length;
    const featuredProjects = projects.filter(p => p.featured).length;

    document.getElementById('total-projects').textContent = totalProjects;
    document.getElementById('available-projects').textContent = availableProjects;
    document.getElementById('featured-projects').textContent = featuredProjects;
}

// Load projects list
function loadProjectsList() {
    const tableContainer = document.getElementById('projects-table');

    if (projects.length === 0) {
        tableContainer.innerHTML = `
            <div class="text-center p-4">
                <h5>Inga projekt än</h5>
                <p>Klicka på "+ Lägg till nytt" för att skapa ditt första projekt.</p>
            </div>
        `;
        return;
    }

    let html = '<div class="projects-table">';

    projects.forEach(project => {
        const statusClass = project.available ? 'status-available' : 'status-unavailable';
        const statusText = project.available ? 'Tillgänglig' : 'Ej tillgänglig';
        const featuredBadge = project.featured ? '<span class="project-status status-featured">Utvald</span>' : '';

        html += `
            <div class="project-row">
                <div class="project-image-container">
                    <img src="${project.image}" alt="${project.title}" class="project-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-placeholder" style="display: none; width: 60px; height: 60px; background: #f0f0f0; border-radius: 8px; align-items: center; justify-content: center; color: #999; font-size: 12px;">📷</div>
                </div>
                <div class="project-info">
                    <h6 class="project-title">${project.title}</h6>
                    <div class="project-meta">
                        ${getCategoryName(project.category)} • ${project.price || 'Pris ej satt'}
                        <span class="project-status ${statusClass}">${statusText}</span>
                        ${featuredBadge}
                    </div>
                </div>
                <div class="project-actions">
                    <button class="btn btn-sm btn-primary" onclick="editProject('${project.id}')">Redigera</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject('${project.id}')">Ta bort</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    tableContainer.innerHTML = html;
}

// Load settings form
function loadSettingsForm() {
    if (settings.topBar) {
        document.getElementById('topbar-text').value = settings.topBar.text || '';
        document.getElementById('topbar-link-text').value = settings.topBar.linkText || '';
        document.getElementById('topbar-link-url').value = settings.topBar.linkUrl || '';
    }

    if (settings.contact) {
        document.getElementById('contact-email').value = settings.contact.email || '';
        document.getElementById('contact-phone').value = settings.contact.phone || '';
    }
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all nav links
    document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName + '-section').style.display = 'block';

    // Add active class to clicked nav link
    event.target.classList.add('active');

    // Hide project form if switching sections
    if (sectionName !== 'projects') {
        hideProjectForm();
    }
}

// Show add project form
function showAddProject() {
    isEditing = false;
    editingProjectId = null;
    document.getElementById('form-title').textContent = 'Lägg till nytt projekt';
    document.getElementById('add-project-form').reset();
    document.getElementById('project-form').style.display = 'block';
    document.getElementById('project-title').focus();
}

// Hide project form
function hideProjectForm() {
    document.getElementById('project-form').style.display = 'none';
    isEditing = false;
    editingProjectId = null;
}

// Edit project
function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    isEditing = true;
    editingProjectId = projectId;

    document.getElementById('form-title').textContent = 'Redigera projekt';
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-title').value = project.title;
    document.getElementById('project-category').value = project.category;
    document.getElementById('project-description').value = project.description;
    document.getElementById('project-long-description').value = project.longDescription || '';
    document.getElementById('project-price').value = project.price || '';
    document.getElementById('project-image').value = project.image;
    document.getElementById('project-materials').value = project.materials || '';
    document.getElementById('project-dimensions').value = project.dimensions || '';
    document.getElementById('project-year').value = project.year || '';
    document.getElementById('project-available').checked = project.available;
    document.getElementById('project-featured').checked = project.featured;

    document.getElementById('project-form').style.display = 'block';
    document.getElementById('project-title').focus();
}

// Save project
function saveProject() {
    const formData = {
        id: isEditing ? editingProjectId : generateId(),
        title: document.getElementById('project-title').value,
        category: document.getElementById('project-category').value,
        description: document.getElementById('project-description').value,
        longDescription: document.getElementById('project-long-description').value,
        price: document.getElementById('project-price').value,
        image: document.getElementById('project-image').value,
        materials: document.getElementById('project-materials').value,
        dimensions: document.getElementById('project-dimensions').value,
        year: document.getElementById('project-year').value,
        available: document.getElementById('project-available').checked,
        featured: document.getElementById('project-featured').checked
    };

    if (isEditing) {
        // Update existing project
        const index = projects.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projects[index] = formData;
        }
    } else {
        // Add new project
        projects.push(formData);
    }

    // Save to localStorage (in a real app, this would be saved to server)
    saveProjectsToStorage();

    // Update UI
    loadProjectsList();
    updateDashboardStats();
    hideProjectForm();

    showSuccessMessage(isEditing ? 'Projekt uppdaterat! Tryck "🚀 Publicera" för att uppdatera hemsidan.' : 'Projekt skapat! Tryck "🚀 Publicera" för att uppdatera hemsidan.');

    // Highlight publish button
    highlightPublishButton();
}

// Delete project
function deleteProject(projectId) {
    if (confirm('Är du säker på att du vill ta bort detta projekt?')) {
        projects = projects.filter(p => p.id !== projectId);
        saveProjectsToStorage();
        loadProjectsList();
        updateDashboardStats();
        showSuccessMessage('Projekt borttaget! Tryck "🚀 Publicera" för att uppdatera hemsidan.');

        // Highlight publish button
        highlightPublishButton();
    }
}

// Save top bar settings
function saveTopBarSettings() {
    settings.topBar = {
        text: document.getElementById('topbar-text').value,
        linkText: document.getElementById('topbar-link-text').value,
        linkUrl: document.getElementById('topbar-link-url').value
    };

    saveSettingsToStorage();
    showSuccessMessage('Top-bar inställningar sparade! Tryck "🚀 Publicera" för att uppdatera hemsidan.');

    // Highlight publish button
    highlightPublishButton();
}

// Save contact settings
function saveContactSettings() {
    settings.contact = {
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value
    };

    saveSettingsToStorage();
    showSuccessMessage('Kontaktinformation sparad! Tryck "🚀 Publicera" för att uppdatera hemsidan.');

    // Highlight publish button
    highlightPublishButton();
}

// Save projects to localStorage (simulating server save)
function saveProjectsToStorage() {
    localStorage.setItem('projects', JSON.stringify(projects));

    // Also update the actual JSON file content (this is a simulation)
    // In a real application, this would be an API call
    console.log('Projects saved:', projects);
}

// Save settings to localStorage (simulating server save)
function saveSettingsToStorage() {
    localStorage.setItem('settings', JSON.stringify(settings));

    // Also update the actual JSON file content (this is a simulation)
    // In a real application, this would be an API call
    console.log('Settings saved:', settings);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get category name in Swedish
function getCategoryName(category) {
    const categories = {
        'books': 'Böcker',
        'maps': 'Kartor',
        'magazines': 'Tidskrifter',
        'ads': 'Grafisk Design',
        'art': 'Konst',
        'shop': 'Produkter'
    };
    return categories[category] || category;
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLogin();
}

// Highlight publish button to indicate changes need to be published
function highlightPublishButton() {
    const buttons = document.querySelectorAll('#publish-button, #publish-button-header');
    buttons.forEach(button => {
        button.classList.add('btn-warning');
        button.classList.remove('btn-success');
        button.innerHTML = '⚠️ Opublicerade ändringar';

        // Add pulsing animation
        button.style.animation = 'pulse 2s infinite';
    });
}

// Reset publish button after successful publish
function resetPublishButton() {
    const buttons = document.querySelectorAll('#publish-button, #publish-button-header');
    buttons.forEach(button => {
        button.classList.remove('btn-warning');
        button.classList.add('btn-success');
        button.innerHTML = '🚀 Spara & Publicera';
        button.style.animation = '';
    });
}

// Try to load from localStorage first (for persistence during development)
window.addEventListener('load', function() {
    const savedProjects = localStorage.getItem('projects');
    const savedSettings = localStorage.getItem('settings');

    if (savedProjects) {
        try {
            projects = JSON.parse(savedProjects);
        } catch (e) {
            console.error('Error parsing saved projects:', e);
        }
    }

    if (savedSettings) {
        try {
            settings = JSON.parse(savedSettings);
        } catch (e) {
            console.error('Error parsing saved settings:', e);
        }
    }

    // Add pulse animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 193, 7, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0); }
        }
    `;
    document.head.appendChild(style);
});