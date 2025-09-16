// Load configuration
let siteConfig = {};
let allProducts = [];

// Media discovery cache and settings
const mediaCache = new Map();
const MEDIA_TIMEOUT = 1500; // 1.5 seconds max per request
const ENABLE_VIDEO_DISCOVERY = false; // Toggle to enable video discovery
const MAX_IMAGE_CHECKS = 10; // Limit image pattern checks

// Load site configuration
async function loadSiteConfig() {
    try {
        const response = await fetch('site_config.json');
        siteConfig = await response.json();
        console.log('Site config loaded:', siteConfig);
    } catch (error) {
        console.error('Error loading site config:', error);
        // Fallback configuration
        siteConfig = {
            assetsBase: 'https://raw.githubusercontent.com/NicholasDemeter/youdontneedthis-inventory/main',
            whatsapp: {
                number: '15551234567'
            }
        };
    }
}

// Cursor Trail Effect
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        document.body.appendChild(trail);
        
        setTimeout(() => {
            trail.remove();
        }, 800);
    }
});

// Smooth scrolling for navigation links
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

// Load and Display Products
async function loadProducts() {
    try {
        const response = await fetch('products.csv');
        const csvText = await response.text();
        
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        
        allProducts = lines.slice(1).map(line => {
            const values = line.split(',');
            const product = {};
            headers.forEach((header, index) => {
                product[header.trim()] = values[index] ? values[index].trim() : '';
            });
            return product;
        });

        console.log(`Loaded ${allProducts.length} products`);
        loadCarousel();
        displayProducts(allProducts);
        loadHeroVideo();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    grid.innerHTML = products.map(product => {
        const thumbnailUrl = `${siteConfig.assetsBase}/${product.FOLDER_NAME}/${product.LOT}_THUMBNAIL.jpg`;
        
        // Extract first sentence from description for grid display
        const firstSentence = product.DESCRIPTION.split('.')[0] + '.';
        
        return `
            <div class="product-card" onclick="openProductDetail('${product.LOT}')">
                <div class="product-badge">Available</div>
                <div class="category-badge">${product.CATEGORY}</div>
                <img src="${thumbnailUrl}" alt="${product.OFFICIAL_NAME}" class="product-image" 
                     onerror="this.style.display='none';">
                <div class="product-info">
                    <h3 class="product-title">${product.OFFICIAL_NAME}</h3>
                    <div class="product-description">${firstSentence}</div>
                    <a href="${product['PRICE ESTIMATE HYPERLINKS']}" target="_blank" class="product-price" onclick="event.stopPropagation();">${product.PRICE}</a>
                </div>
            </div>
        `;
    }).join('');
}

function loadCarousel() {
    // Use all products for carousel with fallback
    let carouselProducts = allProducts.filter(p => p.COOLNESS_RATING === '6');
    
    // If no rating 6 products, use all products
    if (carouselProducts.length === 0) {
        carouselProducts = allProducts.slice(0, 5);
    }
    
    const carousel = document.getElementById('heroCarousel');
    const nav = document.getElementById('carouselNav');
    
    if (carouselProducts.length === 0) {
        carousel.innerHTML = '<p>No featured items available</p>';
        return;
    }
    
    carousel.innerHTML = carouselProducts.map((product, index) => {
        const thumbnailUrl = `${siteConfig.assetsBase}/${product.FOLDER_NAME}/${product.LOT}_THUMBNAIL.jpg`;
        return `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <img src="${thumbnailUrl}" alt="${product.OFFICIAL_NAME}" class="carousel-image">
                <div class="carousel-info">
                    <div class="carousel-product-title">${product.OFFICIAL_NAME}</div>
                    <div class="carousel-product-price">${product.PRICE}</div>
                </div>
            </div>
        `;
    }).join('');

    nav.innerHTML = carouselProducts.map((_, index) => 
        `<div class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="showSlide(${index})"></div>`
    ).join('');

    // Only start auto-advance if we have multiple slides
    if (carouselProducts.length > 1) {
        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % carouselProducts.length;
            showSlide(currentSlide);
        }, 4000);
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

async function loadHeroVideo() {
    const heroVideo = document.getElementById('heroVideo');
    const heroVideoUrl = `${siteConfig.assetsBase}/Carousel_HERO/Hero_Media.mp4`;
    
    try {
        const response = await fetch(heroVideoUrl, { method: 'HEAD' });
        if (response.ok) {
            heroVideo.querySelector('source').src = heroVideoUrl;
            heroVideo.load();
            
            // Ensure autoplay works
            heroVideo.addEventListener('loadeddata', () => {
                heroVideo.play().catch(e => {
                    console.log('Autoplay prevented, user interaction required');
                });
            });
            
            console.log('Hero video loaded successfully');
        } else {
            console.log('Hero video not found');
            heroVideo.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading hero video:', error);
        heroVideo.style.display = 'none';
    }
}

// Optimized Media Discovery with Caching and Timeouts
async function checkMediaUrl(url, timeout = MEDIA_TIMEOUT) {
    // Check cache first
    if (mediaCache.has(url)) {
        return mediaCache.get(url);
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, { 
            method: 'HEAD',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const exists = response.ok;
        
        // Cache the result
        mediaCache.set(url, exists);
        return exists;
    } catch (error) {
        // Cache negative result
        mediaCache.set(url, false);
        return false;
    }
}

async function discoverAllMedia(product) {
    const media = [];
    const lotId = product.LOT;
    const folderName = product.FOLDER_NAME;

    console.log(`Discovering media for ${lotId}...`);

    // Add thumbnail first (always exists)
    const thumbnailUrl = `${siteConfig.assetsBase}/${folderName}/${lotId}_THUMBNAIL.jpg`;
    media.push({ filename: `${lotId}_THUMBNAIL.jpg`, url: thumbnailUrl, type: 'image' });

    // Optimized image discovery with early termination
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    let foundImages = 0;
    
    // Check numbered patterns with limit
    for (let i = 1; i <= MAX_IMAGE_CHECKS && foundImages < 20; i++) {
        let foundForThisNumber = false;
        
        for (const ext of imageExtensions) {
            const filename = `${lotId}_${i}.${ext}`;
            const imageUrl = `${siteConfig.assetsBase}/${folderName}/Photos/${filename}`;
            
            const exists = await checkMediaUrl(imageUrl);
            if (exists) {
                media.push({ filename, url: imageUrl, type: 'image' });
                foundImages++;
                foundForThisNumber = true;
                console.log(`Found image: ${filename} for ${lotId}`);
                break; // Found one extension, move to next number
            }
        }
        
        // Early termination: if we didn't find any image for this number, likely no more
        if (!foundForThisNumber && i > 3) {
            console.log(`Early termination for ${lotId} at number ${i}`);
            break;
        }
    }

    // Video discovery (conditional)
    if (ENABLE_VIDEO_DISCOVERY) {
        const videoExtensions = ['mp4', 'mov', 'webm'];
        const videoPatterns = [`${lotId}_1`, `${lotId}_demo`, `${lotId}_review`];

        for (const pattern of videoPatterns) {
            for (const ext of videoExtensions) {
                const filename = `${pattern}.${ext}`;
                const videoUrl = `${siteConfig.assetsBase}/${folderName}/Videos/${filename}`;
                
                const exists = await checkMediaUrl(videoUrl);
                if (exists) {
                    media.push({ filename, url: videoUrl, type: 'video' });
                    console.log(`Found video: ${filename} for ${lotId}`);
                    break; // Found one, move to next pattern
                }
            }
        }
    }

    console.log(`Total media found for ${lotId}: ${media.length}`);
    return media;
}

async function openProductDetail(lotId) {
    const product = allProducts.find(p => p.LOT === lotId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const mainMedia = document.getElementById('mainMedia');
    const mediaThumbnails = document.getElementById('mediaThumbnails');
    
    // Set basic product info
    document.getElementById('modalTitle').textContent = product.OFFICIAL_NAME;
    document.getElementById('modalPrice').innerHTML = `<a href="${product['PRICE ESTIMATE HYPERLINKS']}" target="_blank">${product.PRICE}</a>`;
    document.getElementById('modalCategory').textContent = product.CATEGORY;
    document.getElementById('modalDescription').textContent = product.DESCRIPTION;
    document.getElementById('modalSpecs').innerHTML = `<h3>Specifications</h3><p>${product.SPECIFICATIONS}</p>`;
    
    // WhatsApp link
    const whatsappMsg = `Hi! I'm interested in ${product.OFFICIAL_NAME} (${product.LOT}). Can you provide more details?`;
    document.getElementById('whatsappBtn').href = `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(whatsappMsg)}`;

    // Show modal
    modal.style.display = 'block';

    // Show loading
    mainMedia.innerHTML = '<div class="loading"><div class="spinner"></div>Loading media...</div>';
    mediaThumbnails.innerHTML = '';

    try {
        const media = await discoverAllMedia(product);
        
        if (media.length > 0) {
            // Set main media (first item)
            displayMainMedia(media[0]);
            
            // Create thumbnails
            mediaThumbnails.innerHTML = media.map((item, index) => {
                if (item.type === 'image') {
                    return `
                        <div class="media-thumbnail ${index === 0 ? 'active' : ''}" onclick="displayMainMedia(${JSON.stringify(item).replace(/"/g, '&quot;')}, ${index})">
                            <img src="${item.url}" alt="${item.filename}" onerror="this.parentElement.style.display='none';">
                        </div>
                    `;
                } else if (item.type === 'video') {
                    return `
                        <div class="media-thumbnail" onclick="displayMainMedia(${JSON.stringify(item).replace(/"/g, '&quot;')}, ${index})">
                            <video preload="metadata">
                                <source src="${item.url}" type="video/mp4">
                            </video>
                            <div class="video-indicator">▶</div>
                        </div>
                    `;
                }
                return '';
            }).join('');
        } else {
            mainMedia.innerHTML = '<p>No media available for this product.</p>';
        }
    } catch (error) {
        console.error('Error loading media:', error);
        mainMedia.innerHTML = '<p>Error loading media. Please try again later.</p>';
    }
}

function displayMainMedia(mediaItem, index = 0) {
    const mainMedia = document.getElementById('mainMedia');
    
    if (mediaItem.type === 'image') {
        mainMedia.innerHTML = `<img src="${mediaItem.url}" alt="${mediaItem.filename}">`;
    } else if (mediaItem.type === 'video') {
        mainMedia.innerHTML = `
            <video controls autoplay>
                <source src="${mediaItem.url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.media-thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// Modal close functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
});

// Initialize everything
async function init() {
    await loadSiteConfig();
    await loadProducts();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

