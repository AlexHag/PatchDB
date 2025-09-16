// API Configuration
const API_BASE_URL = `${window.location.origin}/patchdb/api`;

// Utility functions
function showLoading() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner-border text-dark" role="status"><span class="visually-hidden">Loading...</span></div>';
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function showError(message, containerId = 'errorContainer') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}

function showSuccess(message, containerId = 'successContainer') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}

// Authentication functions
async function loginUser(username) {
    const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }

    return await response.json();
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

function requireAuth() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'index.html';
        return null;
    }
    return userId;
}

// Patch API functions
async function uploadPatch(userId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/${userId}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
}

async function addPatchToGroup(userId, patchId, groupId) {
    const response = await fetch(`${API_BASE_URL}/${userId}/group`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            patch_id: patchId,
            group_id: groupId
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add patch to group');
    }

    return await response.json();
}

async function createPatchGroup(userId, patchId, name) {
    const response = await fetch(`${API_BASE_URL}/${userId}/group`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            patch_id: patchId,
            name: name
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create patch group');
    }

    return await response.json();
}

async function getUserPatches(userId) {
    const response = await fetch(`${API_BASE_URL}/${userId}/patches`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch patches');
    }

    return await response.json();
}

async function deletePatch(userId, patchId) {
    const response = await fetch(`${API_BASE_URL}/${userId}/patch/${patchId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete patch');
    }

    return await response.json();
}

async function deletePatchGroup(userId, groupId) {
    const response = await fetch(`${API_BASE_URL}/${userId}/group/${groupId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete patch group');
    }

    return await response.json();
}

// Image utilities
function resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            let { width, height } = img;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(resolve, 'image/jpeg', quality);
        };

        img.src = URL.createObjectURL(file);
    });
}

// Camera utilities
async function initializeCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Prefer back camera on mobile
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        return stream;
    } catch (error) {
        console.error('Camera initialization failed:', error);
        throw new Error('Unable to access camera');
    }
}

function captureImage(videoElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    ctx.drawImage(videoElement, 0, 0);
    
    return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
}

// Navigation utilities
function navigateTo(page) {
    window.location.href = page;
}

// Format utilities
function formatImagePath(path) {
    // Convert relative path to absolute URL
    if (path.startsWith('./images/')) {
        return `${API_BASE_URL}/${path.substring(2)}`;
    }
    return `${API_BASE_URL}/images/${path}`;
}

// Initialize app on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to body
    document.body.classList.add('fade-in');
    
    // Set up global error handling
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showError('An unexpected error occurred. Please try again.');
    });
});
