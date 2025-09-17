// Project Detail Page JavaScript

let projects = [];
let currentProject = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProjectData();
});

async function loadProjectData() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) {
            throw new Error('Could not load projects');
        }
        projects = await response.json();

        // Get project ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (projectId) {
            showProjectDetail(projectId);
        } else {
            showError('Inget projekt specificerat');
        }

    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Kunde inte ladda projektdata');
    }
}

function showProjectDetail(projectId) {
    currentProject = projects.find(p => p.id === projectId);

    if (!currentProject) {
        showError('Projektet kunde inte hittas');
        return;
    }

    // Update page title and breadcrumb
    document.getElementById('page-title').textContent = `${currentProject.title} - Magda Korotynska`;
    document.getElementById('breadcrumb-title').textContent = currentProject.title;

    // Render project detail
    renderProjectDetail();

    // Load related projects
    loadRelatedProjects();
}

function renderProjectDetail() {
    const detailContainer = document.getElementById('product-detail');


    const purchaseButton = currentProject.available
        ? `<button class="btn btn-primary btn-lg mr-3" onclick="showPurchaseModal('${currentProject.title}')">
             Köp nu - ${currentProject.price || 'Kontakta för pris'}
           </button>`
        : '';

    detailContainer.innerHTML = `
        <div class="row">
            <!-- Image Gallery -->
            <div class="col-lg-6">
                <div class="product-gallery">
                    <div class="main-image mb-3">
                        <img src="${currentProject.image}"
                             alt="${currentProject.title}"
                             class="img-fluid product-main-image"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22400%22%3E%3Crect width=%22500%22 height=%22400%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%22250%22 y=%22200%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2224%22%3EBild ej tillgänglig%3C/text%3E%3C/svg%3E'">
                    </div>

                    <!-- Thumbnail gallery for multiple images -->
                    ${currentProject.images && currentProject.images.length > 1 ? `
                        <div class="thumbnail-gallery">
                            <div class="row">
                                ${currentProject.images.map((img, index) => `
                                    <div class="col-3 mb-2">
                                        <img src="${img}" alt="${currentProject.title} ${index + 1}"
                                             class="img-fluid thumbnail-image"
                                             onclick="changeMainImage('${img}')"
                                             style="cursor: pointer; border-radius: 4px;">
                                    </div>
                                `).join('')}
                            </div>
                            <small class="text-muted">💡 Tips: Klicka på bilderna för att se dem i större format</small>
                        </div>
                    ` : `
                        <div class="thumbnail-gallery">
                            <small class="text-muted">💡 Tips: Klicka på bilden för större version</small>
                        </div>
                    `}
                </div>
            </div>

            <!-- Product Information -->
            <div class="col-lg-6">
                <div class="product-info">
                    <div class="product-meta mb-2">
                        <span class="category-badge">${getCategoryName(currentProject.category)}</span>
                    </div>

                    <h1 class="product-title">${currentProject.title}</h1>
                    ${currentProject.subtitle ? `<p class="product-subtitle text-muted mb-3">${currentProject.subtitle}</p>` : ''}

                    <div class="product-price mb-4">
                        <span class="price-main">${currentProject.price || 'Kontakta för pris'}</span>
                    </div>

                    <div class="product-description mb-4">
                        <h5>Beskrivning</h5>
                        <p>${currentProject.description}</p>

                        ${currentProject.longDescription ? `
                            <div class="long-description mt-3">
                                <h6>Mer information</h6>
                                <div class="description-content">
                                    ${formatLongDescription(currentProject.longDescription)}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="product-details mb-4">
                        <h6>Detaljer</h6>
                        <ul class="list-unstyled">
                            <li><strong>Kategori:</strong> ${getCategoryName(currentProject.category)}</li>
                            ${currentProject.materials ? `<li><strong>Material:</strong> ${currentProject.materials}</li>` : ''}
                            ${currentProject.dimensions ? `<li><strong>Storlek:</strong> ${currentProject.dimensions}</li>` : ''}
                            ${currentProject.year ? `<li><strong>År:</strong> ${currentProject.year}</li>` : ''}
                            ${currentProject.awards ? `<li><strong>Utmärkelser:</strong> ${currentProject.awards.join(', ')}</li>` : ''}
                        </ul>
                    </div>

                    <div class="product-actions">
                        ${purchaseButton}
                        <button class="btn btn-outline-primary" onclick="shareProject()">
                            Dela
                        </button>

                        <div class="action-links mt-3">
                            <a href="contact.html" class="btn-link">
                                💬 Ställ en fråga om detta verk
                            </a>
                        </div>
                    </div>

                    <div class="shipping-info mt-4 p-3 bg-light rounded">
                        <h6>Leverans & betalning</h6>
                        <ul class="list-unstyled mb-0 small">
                            <li>Gratis leverans inom Stockholm (över 500 kr)</li>
                            <li>Postförskott: +49 kr</li>
                            <li>Swish: 070-123 45 67</li>
                            <li>Faktura för företag</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add click handler for image zoom
    const mainImage = document.querySelector('.product-main-image');
    mainImage.addEventListener('click', function() {
        openImageModal(this.src, currentProject.title);
    });
}

function formatLongDescription(longDesc) {
    // Convert line breaks to paragraphs
    return longDesc.split('\\n').map(paragraph =>
        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
    ).join('');
}

function loadRelatedProjects() {
    const relatedGrid = document.getElementById('related-projects-grid');

    // Find projects in the same category (excluding current project)
    const relatedProjects = projects
        .filter(p => p.category === currentProject.category && p.id !== currentProject.id)
        .slice(0, 3); // Show max 3 related projects

    if (relatedProjects.length === 0) {
        relatedGrid.innerHTML = '<div class="col-12"><p class="text-muted">Inga liknande projekt att visa.</p></div>';
        return;
    }

    relatedGrid.innerHTML = relatedProjects.map(project => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card related-project-card">
                <img src="${project.image}" class="card-img-top" alt="${project.title}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%22150%22 y=%22100%22 text-anchor=%22middle%22 fill=%22%23999%22%3EBild saknas%3C/text%3E%3C/svg%3E'">
                <div class="card-body">
                    <h6 class="card-title">${project.title}</h6>
                    <p class="card-text small">${project.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${project.price || 'Kontakta för pris'}</small>
                        <a href="project-detail.html?id=${project.id}" class="btn btn-sm btn-outline-primary">Se mer</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

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

function shareProject() {
    if (navigator.share) {
        navigator.share({
            title: currentProject.title,
            text: currentProject.description,
            url: window.location.href
        });
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Länk kopierad till urklipp!');
        }).catch(() => {
            // Further fallback: show URL in prompt
            prompt('Kopiera denna länk:', window.location.href);
        });
    }
}

function openImageModal(imageSrc, imageTitle) {
    // Create a simple image modal
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-backdrop" onclick="this.parentElement.remove()">
            <div class="image-modal-content">
                <img src="${imageSrc}" alt="${imageTitle}" class="modal-image">
                <button class="image-modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        </div>
    `;

    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    document.body.appendChild(modal);
}

function showPurchaseModal(projectTitle) {
    const modal = document.getElementById('purchaseModal');
    const modalTitle = modal.querySelector('.modal-title');
    modalTitle.textContent = `Köp: ${projectTitle}`;
    $('#purchaseModal').modal('show');
}

function changeMainImage(imageSrc) {
    const mainImage = document.querySelector('.product-main-image');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
}

function showError(message) {
    const detailContainer = document.getElementById('product-detail');
    detailContainer.innerHTML = `
        <div class="row">
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    <h4>Något gick fel</h4>
                    <p>${message}</p>
                    <a href="index.html" class="btn btn-primary">Tillbaka till portfolio</a>
                </div>
            </div>
        </div>
    `;
}