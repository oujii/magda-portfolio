// Main JavaScript for Magda's Portfolio

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    init();
});

function init() {
    loadProjects();
    setupFilterButtons();
    setupPurchaseModal();
    loadTopBarContent();
}

// Load projects from JSON
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) {
            throw new Error('Could not load projects');
        }
        const projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        showLoadingError();
    }
}

// Render projects to the grid
function renderProjects(projects) {
    const grid = document.getElementById('portfolio-grid');
    grid.innerHTML = '';

    if (!projects || projects.length === 0) {
        grid.innerHTML = '<div class="col-12"><p class="text-center">Inga projekt att visa än.</p></div>';
        return;
    }

    projects.forEach(project => {
        const projectHTML = createProjectCard(project);
        grid.appendChild(projectHTML);
    });
}

// Create individual project card
function createProjectCard(project) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 col-sm-12 portfolio-item visible';
    col.setAttribute('data-category', project.category);

    col.innerHTML = `
        <div class="portfolio-card">
            <img src="${project.image}" alt="${project.title}" class="portfolio-image">
            <div class="portfolio-content">
                <div class="portfolio-category">${getCategoryName(project.category)}</div>
                <h3 class="portfolio-title">${project.title}</h3>
                <p class="portfolio-description">${project.description}</p>
                <div class="portfolio-actions">
                    <a href="#" class="btn-primary-custom" onclick="showProjectDetails('${project.id}')">Se mer</a>
                    <button class="btn-purchase" onclick="showPurchaseModal('${project.title}')">Köp</button>
                </div>
            </div>
        </div>
    `;

    return col;
}

// Get Swedish category names
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

// Setup filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Filter projects
            const filterValue = this.getAttribute('data-filter');
            filterProjects(filterValue);
        });
    });
}

// Filter projects by category
function filterProjects(filter) {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
            item.classList.add('visible');
            item.style.display = 'block';
        } else {
            item.classList.remove('visible');
            item.classList.add('hidden');
            setTimeout(() => {
                if (item.classList.contains('hidden')) {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });
}

// Setup purchase modal
function setupPurchaseModal() {
    // This will be handled by Bootstrap modal
}

// Show purchase modal
function showPurchaseModal(projectTitle) {
    const modal = document.getElementById('purchaseModal');
    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = `Köp: ${projectTitle}`;

    // Show modal using Bootstrap
    $('#purchaseModal').modal('show');
}

// Show project details (placeholder for future implementation)
function showProjectDetails(projectId) {
    // For now, just scroll to top - in future this could open a detailed view
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert(`Visa detaljer för projekt: ${projectId}\n\nDenna funktionalitet kommer att implementeras senare.`);
}

// Load top bar content
async function loadTopBarContent() {
    try {
        const response = await fetch('data/settings.json');
        if (!response.ok) {
            throw new Error('Could not load settings');
        }
        const settings = await response.json();

        if (settings.topBar) {
            document.getElementById('top-bar-text').textContent = settings.topBar.text;
            const link = document.getElementById('top-bar-link');
            link.textContent = settings.topBar.linkText;
            link.href = settings.topBar.linkUrl;
        }
    } catch (error) {
        console.error('Error loading top bar content:', error);
        // Keep default content if loading fails
    }
}

// Show loading error
function showLoadingError() {
    const grid = document.getElementById('portfolio-grid');
    grid.innerHTML = `
        <div class="col-12">
            <div class="alert alert-warning text-center">
                <h5>Kunde inte ladda projekt</h5>
                <p>Kontrollera att data/projects.json existerar och innehåller giltig JSON.</p>
                <button class="btn btn-primary" onclick="location.reload()">Försök igen</button>
            </div>
        </div>
    `;
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});