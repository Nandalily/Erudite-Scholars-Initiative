// Enhanced Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Add smooth animation for menu items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            if (navMenu.classList.contains('active')) {
                item.style.animation = `slideInRight 0.3s ease-out ${index * 0.1}s both`;
            } else {
                item.style.animation = 'none';
            }
        });
        
        // Prevent body scroll when mobile menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }));
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Enhanced Countdown Timer with animations
function updateCountdown() {
    const eventDate = new Date('September 21, 2025 09:00:00').getTime();
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');

        // Add pulse animation when values change
        if (daysElement && daysElement.textContent !== days.toString()) {
            daysElement.style.animation = 'countdownPulse 0.5s ease-out';
            setTimeout(() => daysElement.style.animation = '', 500);
        }
        if (hoursElement && hoursElement.textContent !== hours.toString()) {
            hoursElement.style.animation = 'countdownPulse 0.5s ease-out';
            setTimeout(() => hoursElement.style.animation = '', 500);
        }
        if (minutesElement && minutesElement.textContent !== minutes.toString()) {
            minutesElement.style.animation = 'countdownPulse 0.5s ease-out';
            setTimeout(() => minutesElement.style.animation = '', 500);
        }
        if (secondsElement && secondsElement.textContent !== seconds.toString()) {
            secondsElement.style.animation = 'countdownPulse 0.5s ease-out';
            setTimeout(() => secondsElement.style.animation = '', 500);
        }

        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    } else {
        // Event has passed
        const countdownTimer = document.getElementById('countdownTimer');
        if (countdownTimer) {
            countdownTimer.innerHTML = '<div class="event-passed">Event Day Has Arrived!</div>';
            countdownTimer.style.animation = 'eventPassed 1s ease-out';
        }
    }
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown(); // Initial call

// Mobile-first responsive utilities
function initResponsiveFeatures() {
    // Add touch-friendly hover effects for mobile
    if ('ontouchstart' in window) {
        document.querySelectorAll('.gallery-item, .blog-card, .category-card').forEach(item => {
            item.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            item.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 150);
            });
        });
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Trigger resize event to recalculate layouts
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Enhanced Gallery Tabs with smooth transitions
function initGalleryTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    console.log('Gallery tabs initialized:', { tabBtns: tabBtns.length, tabContents: tabContents.length });

    // Set initial state - show first tab by default
    if (tabContents.length > 0) {
        // Hide all tab contents first
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // Show first tab content
        tabContents[0].classList.add('active');
        tabContents[0].style.display = 'block';
        
        // Set first tab button as active
        tabBtns[0].classList.add('active');
        
        console.log('First tab activated:', tabContents[0].id);
    }

    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
                console.log('Tab content shown:', targetTab);
            } else {
                console.error('Target content not found:', targetTab);
            }
        });
    });
}

// Test function for debugging - call this in browser console
window.testGalleryTabs = function() {
    console.log('Testing gallery tabs...');
    const photosTab = document.getElementById('photos');
    const videosTab = document.getElementById('videos');
    const pressTab = document.getElementById('press');
    
    console.log('Photos tab:', photosTab);
    console.log('Videos tab:', videosTab);
    console.log('Press tab:', pressTab);
    
    console.log('Photos tab classes:', photosTab?.classList.toString());
    console.log('Photos tab display:', photosTab?.style.display);
    console.log('Photos tab computed display:', window.getComputedStyle(photosTab).display);
    
    // Try to manually show photos
    if (photosTab) {
        photosTab.classList.add('active');
        photosTab.style.display = 'block';
        console.log('Manually activated photos tab');
    }
};

// Initialize gallery tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGalleryTabs();
    initResponsiveFeatures();
});

// Enhanced Smooth Scrolling for Navigation Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                // Add smooth scrolling with easing
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add highlight effect to target section
                target.style.animation = 'sectionHighlight 2s ease-out';
                setTimeout(() => target.style.animation = '', 2000);
            }
        });
    });
}

// Initialize smooth scrolling when DOM is loaded
document.addEventListener('DOMContentLoaded', initSmoothScrolling);

// Enhanced Registration Form Handling with better UX
function initRegistrationForm() {
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', handleRegistrationSubmit);
        
        // Add real-time validation feedback
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
    } else if (field.type === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#e74c3c';
    field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.3rem;
        margin-left: 0.5rem;
        animation: slideInDown 0.3s ease-out;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '#ddd';
    field.style.boxShadow = 'none';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

async function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registrationData = {
        id: Date.now().toString(),
        participantName: formData.get('participantName'),
        schoolName: formData.get('schoolName'),
        schoolType: formData.get('schoolType'),
        participantClass: formData.get('participantClass'),
        competitionCategory: formData.get('competitionCategory'),
        teamMembers: formData.get('teamMembers'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        motivation: formData.get('motivation'),
        competitionId: window.currentCompetitionContext ? window.currentCompetitionContext.id : null,
        competitionTitle: window.currentCompetitionContext ? window.currentCompetitionContext.title : null,
        registrationDate: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save to localStorage
    const existingRegistrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
    existingRegistrations.push(registrationData);
    localStorage.setItem('esiRegistrations', JSON.stringify(existingRegistrations));
    
    // Show success message
    showModal('Registration Successful!', `Thank you for registering for "${registrationData.competitionTitle || 'the competition'}". We will review your application and contact you soon.`);
    
    // Reset form and hide registration section
    e.target.reset();
    hideRegistrationForm();
    
    // Clear any field errors
    const inputs = e.target.querySelectorAll('input, textarea, select');
    inputs.forEach(input => clearFieldError(input));
}

// Show success/error modal
function showModal(title, message, type = 'success') {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="modal-header ${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button onclick="closeSuccessModal()" class="btn-ok">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            closeSuccessModal();
        }
    }, 5000);
}

// Close success modal
function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.remove();
    }
}

// Load and display featured competition on home page
function loadFeaturedCompetition() {
    const featuredSection = document.getElementById('featuredCompetition');
    if (!featuredSection) return;
    
    const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
    const featuredCompetition = competitions.find(comp => comp.featured === true);
    
    if (!featuredCompetition) {
        featuredSection.style.display = 'none';
        return;
    }
    
    // Show the featured section
    featuredSection.style.display = 'block';
    
    // Update featured competition content
    const titleElement = featuredSection.querySelector('.featured-competition-title');
    const descriptionElement = featuredSection.querySelector('.featured-competition-description');
    const categoryElement = featuredSection.querySelector('.featured-category');
    const deadlineElement = featuredSection.querySelector('.featured-deadline');
    const imageContainer = featuredSection.querySelector('.featured-competition-image');
    
    if (titleElement) titleElement.textContent = featuredCompetition.title;
    if (descriptionElement) descriptionElement.textContent = featuredCompetition.description;
    if (categoryElement) categoryElement.textContent = formatCategory(featuredCompetition.category);
    if (deadlineElement) deadlineElement.textContent = `Deadline: ${formatDate(featuredCompetition.deadline)}`;
    
    // Update image
    if (featuredCompetition.image) {
        imageContainer.innerHTML = `<img src="${featuredCompetition.image.data}" alt="${featuredCompetition.title}">`;
    } else {
        imageContainer.innerHTML = `
            <div class="featured-image-placeholder">
                <i class="fas fa-trophy"></i>
            </div>
        `;
    }
    
    // Store featured competition context for registration
    window.featuredCompetitionContext = featuredCompetition;
}

// Show registration form from featured competition
function showRegistrationFormFromFeatured() {
    if (window.featuredCompetitionContext) {
        showRegistrationForm(window.featuredCompetitionContext.id);
    }
}

// Show featured competition details
function showFeaturedCompetitionDetails() {
    if (window.featuredCompetitionContext) {
        showCompetitionDetails(window.featuredCompetitionContext.id);
    }
}

// Load gallery data for welcome page
function loadGalleryData() {
    loadGalleryPhotos();
    loadGalleryVideos();
    loadGalleryPress();
}

// Load photos for welcome page gallery
function loadGalleryPhotos() {
    const photos = JSON.parse(localStorage.getItem('esiGalleryPhotos') || '[]');
    const photosGrid = document.querySelector('#photos .gallery-grid');
    
    if (photosGrid && photos.length > 0) {
        photosGrid.innerHTML = photos.map(photo => `
            <div class="gallery-item">
                <div class="image-placeholder">
                    <img src="${photo.image.data}" alt="${photo.title}">
                    <p>${photo.title}</p>
                </div>
            </div>
        `).join('');
    }
}

// Load videos for welcome page gallery
function loadGalleryVideos() {
    const videos = JSON.parse(localStorage.getItem('esiGalleryVideos') || '[]');
    const videosGrid = document.querySelector('#videos .video-grid');
    
    if (videosGrid && videos.length > 0) {
        videosGrid.innerHTML = videos.map(video => `
            <div class="video-item">
                <video controls poster="${video.thumbnail ? video.thumbnail.data : 'images/2.jpeg'}" class="video-player" preload="metadata">
                    <source src="${video.video.data}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-info">
                    <h4>${video.title}</h4>
                    <p>${video.description || 'No description available'}</p>
                    <div class="video-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(video.createdAt).getFullYear()}</span>
                        <span><i class="fas fa-tag"></i> ${video.category}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Load press coverage for welcome page gallery
function loadGalleryPress() {
    const pressItems = JSON.parse(localStorage.getItem('esiGalleryPress') || '[]');
    const pressGrid = document.querySelector('#press .press-grid');
    
    if (pressGrid && pressItems.length > 0) {
        pressGrid.innerHTML = pressItems.map(press => `
            <div class="press-item">
                <h4>${press.title}</h4>
                <p>${press.description || 'No description available'}</p>
                ${press.link ? `<a href="${press.link}" target="_blank" class="press-link">Read More</a>` : ''}
            </div>
        `).join('');
    }
}

// Enhanced Contact Form Handling
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const messageData = {
        id: Date.now().toString(),
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toISOString(),
        read: false,
        replied: false
    };
    
    // Save to localStorage
    const existingMessages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
    existingMessages.push(messageData);
    localStorage.setItem('esiContactMessages', JSON.stringify(existingMessages));
    
    // Show success message
    showModal('Message Sent!', 'Thank you for your message. We will get back to you soon.');
    
    // Reset form
    e.target.reset();
    
    // Clear any field errors
    const inputs = e.target.querySelectorAll('input, textarea');
    inputs.forEach(input => clearFieldError(input));
}

// Enhanced Modal System
function showModal(title, message) {
    const modal = document.getElementById('successModal');
    const modalTitle = modal.querySelector('h3');
    const modalMessage = modal.querySelector('#modalMessage');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    modal.style.display = 'block';
    modal.style.animation = 'modalSlideIn 0.3s ease-out';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeModal();
    }, 5000);
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.animation = 'modalSlideOut 0.3s ease-out';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Close modal when clicking on X or outside
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('successModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Enhanced Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out both';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections and cards
    const elements = document.querySelectorAll('section, .mission-card, .vision-card, .category-card, .rule-card, .sdg-card, .gallery-item, .blog-card, .support-option');
    elements.forEach(el => {
        observer.observe(el);
    });
}

// Enhanced Interactive Features
function addInteractiveFeatures() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.mission-card, .vision-card, .category-card, .rule-card, .sdg-card, .gallery-item, .blog-card, .support-option');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.cta-button, .submit-btn, .read-more');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Enhanced Image Loading
function initImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.animation = 'imageFadeIn 0.5s ease-out';
        });
        
        img.addEventListener('error', () => {
            img.style.filter = 'grayscale(100%)';
            img.style.opacity = '0.5';
        });
    });
}

// Enhanced Scroll Progress Indicator
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #ffd700, #ffed4e);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = progress + '%';
    });
}

// Enhanced Back to Top Button
function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 5px 20px rgba(30, 60, 114, 0.3);
    `;
    
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    backToTop.addEventListener('mouseenter', () => {
        backToTop.style.transform = 'scale(1.1)';
        backToTop.style.boxShadow = '0 8px 25px rgba(30, 60, 114, 0.4)';
    });
    
    backToTop.addEventListener('mouseleave', () => {
        backToTop.style.transform = 'scale(1)';
        backToTop.style.boxShadow = '0 5px 20px rgba(30, 60, 114, 0.3)';
    });
}

// Enhanced Keyboard Navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
        
        if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
            e.target.click();
        }
    });
}

// Enhanced Performance Optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Load and display competitions on the welcome page
function loadCompetitionsForWelcomePage() {
    const competitionsGrid = document.getElementById('competitionsGrid');
    if (!competitionsGrid) return;

    // Get competitions from localStorage
    const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
    
    if (competitions.length === 0) {
        competitionsGrid.innerHTML = `
            <div class="no-competitions">
                <i class="fas fa-calendar-times"></i>
                <h4>No competitions available at the moment</h4>
                <p>Check back soon for exciting new competitions!</p>
            </div>
        `;
        return;
    }

    // Filter only active competitions
    const activeCompetitions = competitions.filter(comp => comp.status === 'active');
    
    if (activeCompetitions.length === 0) {
        competitionsGrid.innerHTML = `
            <div class="no-competitions">
                <i class="fas fa-calendar-times"></i>
                <h4>No active competitions at the moment</h4>
                <p>Check back soon for exciting new competitions!</p>
            </div>
        `;
        return;
    }

    // Display competitions
    competitionsGrid.innerHTML = activeCompetitions.map(comp => `
        <div class="competition-card" data-category="${comp.category}">
            <div class="competition-image">
                ${comp.image ? 
                    `<img src="${comp.image.data}" alt="${comp.title}" loading="lazy">` : 
                    `<div class="competition-placeholder">
                        <i class="fas fa-trophy"></i>
                    </div>`
                }
                <div class="countdown-badge" data-deadline="${comp.deadline}">
                    <i class="fas fa-clock"></i>
                    <span class="badge-time">--</span>
                </div>
                <div class="countdown-overlay">
                    <div class="countdown-content">
                        <div class="countdown-label">Time Remaining</div>
                        <div class="countdown-timer" data-deadline="${comp.deadline}">
                            <div class="countdown-item">
                                <span class="countdown-days">--</span>
                                <label>Days</label>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-hours">--</span>
                                <label>Hours</label>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-minutes">--</span>
                                <label>Mins</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="competition-content">
                <div class="competition-header">
                    <h4>${comp.title}</h4>
                    <span class="competition-category">${formatCategory(comp.category)}</span>
                </div>
                <p class="competition-description">${comp.description}</p>
                <div class="competition-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Deadline: ${formatDate(comp.deadline)}</span>
                    </div>
                    ${comp.maxParticipants ? `
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>Max: ${comp.maxParticipants} participants</span>
                        </div>
                    ` : ''}
                    ${comp.prize ? `
                        <div class="detail-item">
                            <i class="fas fa-gift"></i>
                            <span>Prize: ${comp.prize}</span>
                        </div>
                    ` : ''}
                </div>
                ${comp.file ? `
                    <div class="competition-attachments">
                        <div class="attachment-item">
                            <i class="fas fa-file"></i>
                            <span>${comp.file.name}</span>
                        </div>
                    </div>
                ` : ''}
                <div class="competition-actions">
                    <button class="btn-register" onclick="showRegistrationForm('${comp.id}')">Register Now</button>
                    <button class="btn-details" onclick="showCompetitionDetails('${comp.id}')">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Initialize countdown timers for all competition cards
    initializeCompetitionCountdowns();
}

// Helper function to format category names
function formatCategory(category) {
    const categories = {
        'debate': 'Debate (Team of 3)',
        'poetry': 'Poetry (Individual)',
        'public-speech': 'Public Speech (Individual)'
    };
    return categories[category] || category;
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show competition details in a modal
function showCompetitionDetails(competitionId) {
    const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
    const competition = competitions.find(comp => comp.id === competitionId);
    
    if (!competition) return;
    
    // Create and show modal with competition details
    const modal = document.createElement('div');
    modal.className = 'competition-modal';
    modal.innerHTML = `
        <div class="competition-modal-content">
            <span class="close-modal">&times;</span>
            <div class="competition-modal-header">
                <h3>${competition.title}</h3>
                <span class="category-badge">${formatCategory(competition.category)}</span>
            </div>
            ${competition.image ? `
                <div class="competition-modal-image">
                    <img src="${competition.image.data}" alt="${competition.title}">
                </div>
            ` : ''}
            <div class="competition-modal-body">
                <p class="description">${competition.description}</p>
                <div class="details-grid">
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span><strong>Deadline:</strong> ${formatDate(competition.deadline)}</span>
                    </div>
                    ${competition.maxParticipants ? `
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span><strong>Maximum Participants:</strong> ${competition.maxParticipants}</span>
                        </div>
                    ` : ''}
                    ${competition.prize ? `
                        <div class="detail-item">
                            <i class="fas fa-gift"></i>
                            <span><strong>Prize:</strong> ${competition.prize}</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span><strong>Created:</strong> ${formatDate(competition.createdAt)}</span>
                    </div>
                </div>
                ${competition.file ? `
                    <div class="competition-files">
                        <h4>Attached Files</h4>
                        <div class="file-item">
                            <i class="fas fa-file"></i>
                            <span>${competition.file.name}</span>
                            <small>(${(competition.file.size / 1024 / 1024).toFixed(2)} MB)</small>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="competition-modal-actions">
                <button class="btn-register-primary" onclick="showRegistrationForm('${competition.id}'); closeCompetitionModal();">Register Now</button>
                <button class="btn-close" onclick="closeCompetitionModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => closeCompetitionModal();
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeCompetitionModal();
        }
    };
}

// Close competition modal
function closeCompetitionModal() {
    const modal = document.querySelector('.competition-modal');
    if (modal) {
        modal.remove();
    }
}

// Show registration form for a specific competition
function showRegistrationForm(competitionId) {
    const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
    const competition = competitions.find(comp => comp.id === competitionId);
    
    if (!competition) return;
    
    // Update registration form header with competition details
    const registrationSection = document.getElementById('registration');
    const registrationHeader = registrationSection.querySelector('h2');
    
    if (registrationHeader) {
        registrationHeader.innerHTML = `
            Event Registration
            <div class="competition-context">
                <span class="competition-name">${competition.title}</span>
                <span class="competition-category">${formatCategory(competition.category)}</span>
            </div>
            <button class="close-registration" onclick="hideRegistrationForm()">
                <i class="fas fa-times"></i>
            </button>
        `;
    }
    
    // Show the registration section
    registrationSection.style.display = 'block';
    
    // Scroll to registration form smoothly
    registrationSection.scrollIntoView({ behavior: 'smooth' });
    
    // Store the current competition context for form submission
    window.currentCompetitionContext = competition;
}

// Hide registration form
function hideRegistrationForm() {
    const registrationSection = document.getElementById('registration');
    registrationSection.style.display = 'none';
    
    // Clear the current competition context
    window.currentCompetitionContext = null;
    
    // Reset the form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.reset();
    }
    
    // Scroll back to competitions
    const upcomingEventsSection = document.getElementById('upcoming-events');
    if (upcomingEventsSection) {
        upcomingEventsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize countdown timers for all competition cards
function initializeCompetitionCountdowns() {
    const countdownTimers = document.querySelectorAll('.countdown-timer');
    const countdownBadges = document.querySelectorAll('.countdown-badge');
    
    // Update timers
    countdownTimers.forEach(timer => {
        const deadline = timer.getAttribute('data-deadline');
        if (deadline) {
            updateCompetitionCountdown(timer, deadline);
        }
    });
    
    // Update badges
    countdownBadges.forEach(badge => {
        const deadline = badge.getAttribute('data-deadline');
        if (deadline) {
            updateCountdownBadge(badge, deadline);
        }
    });
    
    // Update all countdowns every minute
    setInterval(() => {
        countdownTimers.forEach(timer => {
            const deadline = timer.getAttribute('data-deadline');
            if (deadline) {
                updateCompetitionCountdown(timer, deadline);
            }
        });
        
        countdownBadges.forEach(badge => {
            const deadline = badge.getAttribute('data-deadline');
            if (deadline) {
                updateCountdownBadge(badge, deadline);
            }
        });
    }, 60000); // Update every minute
}

// Update individual competition countdown timer
function updateCompetitionCountdown(timerElement, deadline) {
    const deadlineDate = new Date(deadline).getTime();
    const now = new Date().getTime();
    const distance = deadlineDate - now;
    
    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        const daysElement = timerElement.querySelector('.countdown-days');
        const hoursElement = timerElement.querySelector('.countdown-hours');
        const minutesElement = timerElement.querySelector('.countdown-minutes');
        
        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        
        // Add urgency styling for last 24 hours
        if (days === 0) {
            timerElement.classList.add('urgent');
        } else {
            timerElement.classList.remove('urgent');
        }
        
        // Add warning styling for last 7 days
        if (days <= 7 && days > 0) {
            timerElement.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
        }
    } else {
        // Deadline has passed
        const daysElement = timerElement.querySelector('.countdown-days');
        const hoursElement = timerElement.querySelector('.countdown-hours');
        const minutesElement = timerElement.querySelector('.countdown-minutes');
        
        if (daysElement) daysElement.textContent = '00';
        if (hoursElement) hoursElement.textContent = '00';
        if (minutesElement) minutesElement.textContent = '00';
        
        timerElement.classList.add('expired');
    }
}

// Update countdown badge (shows simplified time remaining)
function updateCountdownBadge(badgeElement, deadline) {
    const deadlineDate = new Date(deadline).getTime();
    const now = new Date().getTime();
    const distance = deadlineDate - now;
    
    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const badgeTime = badgeElement.querySelector('.badge-time');
        
        if (days > 1) {
            badgeTime.textContent = `${days}d`;
        } else if (days === 1) {
            badgeTime.textContent = '1d';
        } else if (hours > 0) {
            badgeTime.textContent = `${hours}h`;
        } else {
            badgeTime.textContent = 'Now!';
        }
        
        // Add urgency styling
        if (days === 0) {
            badgeElement.classList.add('urgent');
        } else if (days <= 7) {
            badgeElement.classList.add('warning');
        } else {
            badgeElement.classList.remove('urgent', 'warning');
        }
    } else {
        // Deadline has passed
        const badgeTime = badgeElement.querySelector('.badge-time');
        badgeTime.textContent = 'Ended';
        badgeElement.classList.add('expired');
    }
}

// Initialize all enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing features...');
    
    // Initialize gallery tabs first
    setTimeout(() => {
        initGalleryTabs();
    }, 100);
    
    initRegistrationForm();
    initContactForm();
    initScrollAnimations();
    addInteractiveFeatures();
    initImageLoading();
    initScrollProgress();
    initBackToTop();
    initKeyboardNavigation();
    optimizePerformance();
    
    // Load competitions for the welcome page
    loadCompetitionsForWelcomePage();
    
    // Load featured competition for home section
    loadFeaturedCompetition();
    
    // Load gallery data for welcome page
    loadGalleryData();
    
    // Load activities content for welcome page
    loadActivitiesContent();
    
    // Load home section content for welcome page
    loadHomeSectionContent();
    
    // Listen for competition updates from admin dashboard
    window.addEventListener('storage', (e) => {
        if (e.key === 'esiCompetitionsUpdated') {
            loadCompetitionsForWelcomePage();
            loadFeaturedCompetition();
        }
        if (e.key === 'esiGalleryUpdated') {
            loadGalleryData();
    
    // Load activities content for welcome page
    loadActivitiesContent();
    
    // Load home section content for welcome page
    loadHomeSectionContent();
        }
    });
});

// Enhanced CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes countdownPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes eventPassed {
        0% { opacity: 0; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes slideInRight {
        0% { opacity: 0; transform: translateX(30px); }
        100% { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes sectionHighlight {
        0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
    }
    
    @keyframes slideInDown {
        0% { opacity: 0; transform: translateY(-20px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes modalSlideIn {
        0% { opacity: 0; transform: translateY(-50px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes modalSlideOut {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-50px); }
    }
    
    @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
    }
    
    @keyframes imageFadeIn {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
    }
    
    .back-to-top:hover {
        background: linear-gradient(135deg, #2a5298, #1e3c72);
        transform: scale(1.1);
    }
    
    .scroll-progress {
        box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
    }
    
    .field-error {
        animation: slideInDown 0.3s ease-out;
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`;

document.head.appendChild(style); 
// Activities Content Loading Functions for Welcome Page
function loadActivitiesContent() {
    const activitiesData = JSON.parse(localStorage.getItem('esiActivities') || '{}');
    
    // Load background content
    if (activitiesData.background) {
        const backgroundElement = document.querySelector('#activities .event-info h3 + p');
        if (backgroundElement) {
            backgroundElement.textContent = activitiesData.background;
        }
    }
    
    // Load objectives
    if (activitiesData.objectives && activitiesData.objectives.length > 0) {
        loadObjectives(activitiesData.objectives);
    }
    
    // Load rules
    if (activitiesData.rules) {
        loadCompetitionRules(activitiesData.rules);
    }
    
    // Load schedule
    if (activitiesData.schedule && activitiesData.schedule.length > 0) {
        loadProgramSchedule(activitiesData.schedule);
    }
}

function loadObjectives(objectives) {
    const objectivesList = document.querySelector('#activities .event-info ul');
    if (objectivesList) {
        objectivesList.innerHTML = '';
        objectives.forEach(objective => {
            const li = document.createElement('li');
            li.textContent = objective;
            objectivesList.appendChild(li);
        });
    }
}

function loadCompetitionRules(rules) {
    // Update debate rules
    if (rules.debate) {
        const debateList = document.querySelector('#activities .rule-card:nth-child(1) ul');
        if (debateList) {
            debateList.innerHTML = '';
            rules.debate.forEach(rule => {
                const li = document.createElement('li');
                li.textContent = rule;
                debateList.appendChild(li);
            });
        }
    }
    
    // Update poetry rules
    if (rules.poetry) {
        const poetryList = document.querySelector('#activities .rule-card:nth-child(2) ul');
        if (poetryList) {
            poetryList.innerHTML = '';
            rules.poetry.forEach(rule => {
                const li = document.createElement('li');
                li.textContent = rule;
                poetryList.appendChild(li);
            });
        }
    }
    
    // Update speech rules
    if (rules.speech) {
        const speechList = document.querySelector('#activities .rule-card:nth-child(3) ul');
        if (speechList) {
            speechList.innerHTML = '';
            rules.speech.forEach(rule => {
                const li = document.createElement('li');
                li.textContent = rule;
                speechList.appendChild(li);
            });
        }
    }
}

function loadProgramSchedule(schedule) {
    const scheduleTimeline = document.querySelector('#activities .schedule-timeline');
    if (scheduleTimeline) {
        scheduleTimeline.innerHTML = '';
        schedule.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="time">${item.time}</div>
                <div class="event">${item.event}</div>
            `;
            scheduleTimeline.appendChild(timelineItem);
        });
    }
}

// Listen for activities updates from admin dashboard
window.addEventListener('storage', (e) => {
    if (e.key === 'esiActivitiesUpdated') {
        loadActivitiesContent();
    
    // Load home section content for welcome page
    loadHomeSectionContent();
    }
});


// Home Section Content Loading Functions for Welcome Page
function loadHomeSectionContent() {
    const homeData = JSON.parse(localStorage.getItem('esiHomeContent') || '{}');
    
    // Load hero badge
    if (homeData.heroBadge) {
        const badgeElement = document.querySelector('.hero-badge');
        if (badgeElement) {
            badgeElement.textContent = homeData.heroBadge;
        }
    }
    
    // Load hero title
    if (homeData.heroTitle) {
        const titleElement = document.querySelector('#home h1');
        if (titleElement) {
            titleElement.textContent = homeData.heroTitle;
        }
    }
    
    // Load hero subtitle
    if (homeData.heroSubtitle) {
        const subtitleElement = document.querySelector('#home h2');
        if (subtitleElement) {
            subtitleElement.textContent = homeData.heroSubtitle;
        }
    }
    
    // Load event date
    if (homeData.eventDate) {
        const dateElement = document.querySelector('.hero-detail:nth-child(1) span');
        if (dateElement) {
            dateElement.textContent = homeData.eventDate;
        }
    }
    
    // Load event venue
    if (homeData.eventVenue) {
        const venueElement = document.querySelector('.hero-detail:nth-child(2) span');
        if (venueElement) {
            venueElement.textContent = homeData.eventVenue;
        }
    }
    
    // Load event audience
    if (homeData.eventAudience) {
        const audienceElement = document.querySelector('.hero-detail:nth-child(3) span');
        if (audienceElement) {
            audienceElement.textContent = homeData.eventAudience;
        }
    }
    
    // Update countdown timer
    if (homeData.countdownDate && homeData.countdownTime) {
        updateCountdownTimer(homeData.countdownDate, homeData.countdownTime, homeData.countdownMessage);
    }
}

function updateCountdownTimer(countdownDate, countdownTime, countdownMessage) {
    const targetDateTime = new Date(`${countdownDate}T${countdownTime}`).getTime();
    const now = new Date().getTime();
    const distance = targetDateTime - now;
    
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    } else {
        // Event has passed
        const countdownTimer = document.getElementById('countdownTimer');
        if (countdownTimer) {
            countdownTimer.innerHTML = `<div class="event-passed">${countdownMessage || 'Event Day Has Arrived!'}</div>`;
            countdownTimer.style.animation = 'eventPassed 1s ease-out';
        }
    }
}

// Listen for home content updates from admin dashboard
window.addEventListener('storage', (e) => {
    if (e.key === 'esiHomeContentUpdated') {
        loadHomeSectionContent();
    }
});


// Light Mode Navigation Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Light Mode Theme Toggle (Optional - for future use)
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
});

