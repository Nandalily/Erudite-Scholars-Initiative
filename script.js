// ===== ENHANCED ESI SCRIPT - MODERN & OPTIMIZED =====

// ===== MODULE PATTERN WITH IIFE =====
(function() {
    'use strict';
    
    // ===== CONFIGURATION & CONSTANTS =====
    const CONFIG = {
        STORAGE_KEYS: {
            COMPETITIONS: 'esiCompetitions',
            REGISTRATIONS: 'esiRegistrations',
            CONTACT_MESSAGES: 'esiContactMessages',
            GALLERY_PHOTOS: 'esiGalleryPhotos',
            GALLERY_VIDEOS: 'esiGalleryVideos',
            GALLERY_PRESS: 'esiGalleryPress',
            ACTIVITIES: 'esiActivities',
            HOME_CONTENT: 'esiHomeContent',
            THEME: 'esiTheme'
        },
        BREAKPOINTS: {
            MOBILE: 768,
            TABLET: 1024,
            DESKTOP: 1200
        },
        ANIMATIONS: {
            TRANSITION: 'cubic-bezier(0.4, 0, 0.2, 1)',
            DURATION: {
                FAST: '150ms',
                BASE: '300ms',
                SLOW: '500ms'
            }
        },
        VALIDATION: {
            EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
            URL_REGEX: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$/
        },
        IMAGES: {
            HERO_STRIP: [
                '2.jpeg','3.jpeg','4.jpeg','5.jpeg','6.jpeg','7.jpeg','8.jpeg',
                '9.jpeg','10.jpeg','11.jpeg','12.jpeg','14.jpeg','15.jpeg',
                '16.jpeg','17.jpeg','18.jpeg','19.jpeg','20.jpeg','33.jpeg',
                'tt.jpeg','ttt.jpeg','Untitled.jpeg','13.png'
            ].map(name => `images/${name}`)
        }
    };
    
    // ===== STATE MANAGEMENT =====
    const State = {
        currentTheme: 'light',
        currentCompetition: null,
        isMobileMenuOpen: false,
        activeGalleryTab: 'photos',
        countdownInterval: null
    };
    
    // ===== DOM ELEMENTS CACHE =====
    const DOM = {
        navbar: document.querySelector('.navbar'),
        hamburger: document.querySelector('.hamburger'),
        navMenu: document.querySelector('.nav-menu'),
        countdownTimer: document.getElementById('countdownTimer'),
        registrationForm: document.getElementById('registrationForm'),
        contactForm: document.getElementById('contactForm'),
        galleryTabs: document.querySelectorAll('.tab-btn'),
        galleryContents: document.querySelectorAll('.tab-content')
    };
    
    // ===== UTILITY FUNCTIONS =====
    const Utils = {
        // Debounce function for performance
        debounce: (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },
        
        // Throttle function for scroll/resize events
        throttle: (func, limit) => {
            let inThrottle;
            return (...args) => {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Format dates consistently
        formatDate: (dateString, options = {}) => {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...options
            };
            
            return date.toLocaleDateString('en-US', defaultOptions);
        },
        
        // Format category names
        formatCategory: (category) => {
            const categories = {
                'debate': 'Debate (Team of 3)',
                'poetry': 'Poetry (Individual)',
                'public-speech': 'Public Speech (Individual)',
                'spelling-bee': 'Spelling Bee'
            };
            return categories[category] || category;
        },
        
        // Generate unique ID
        generateId: () => {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        // Check if device is mobile
        isMobile: () => window.innerWidth <= CONFIG.BREAKPOINTS.MOBILE,
        
        // Check if device supports touch
        isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        
        // Safe localStorage operations
        getFromStorage: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error(`Error reading from localStorage (${key}):`, error);
                return defaultValue;
            }
        },
        
        saveToStorage: (key, data) => {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error(`Error saving to localStorage (${key}):`, error);
                return false;
            }
        },
        
        // Validation helpers
        isValidEmail: (email) => CONFIG.VALIDATION.EMAIL_REGEX.test(email),
        isValidPhone: (phone) => CONFIG.VALIDATION.PHONE_REGEX.test(phone.replace(/\s/g, '')),
        isValidUrl: (url) => CONFIG.VALIDATION.URL_REGEX.test(url),
        
        // Create DOM elements with attributes
        createElement: (tag, attributes = {}, children = []) => {
            const element = document.createElement(tag);
            
            // Set attributes
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else if (key === 'class') {
                    element.className = value;
                } else if (key.startsWith('on')) {
                    element[key] = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            // Append children
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
            
            return element;
        },
        
        // Show toast notification
        showToast: (message, type = 'success', duration = 3000) => {
            const toast = Utils.createElement('div', {
                class: `toast toast-${type}`,
                style: {
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    background: type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: '9999',
                    animation: 'slideInRight 0.3s ease-out'
                }
            }, [message]);
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },
        
        // Load image with error handling
        loadImage: (src, alt = '') => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.alt = alt;
                img.loading = 'lazy';
                
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            });
        }
    };
    
    // ===== CORE MODULES =====
    
    // Navigation Module
    const Navigation = {
        init: () => {
            if (!DOM.hamburger || !DOM.navMenu) return;
            
            DOM.hamburger.addEventListener('click', Navigation.toggleMobileMenu);
            
            // Close menu when clicking links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', Navigation.closeMobileMenu);
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!DOM.hamburger.contains(e.target) && !DOM.navMenu.contains(e.target)) {
                    Navigation.closeMobileMenu();
                }
            });
            
            // Handle window resize
            window.addEventListener('resize', Utils.debounce(() => {
                if (window.innerWidth > CONFIG.BREAKPOINTS.MOBILE) {
                    Navigation.closeMobileMenu();
                }
            }, 250));
            
            // Initialize scroll effect
            window.addEventListener('scroll', Utils.throttle(Navigation.handleScroll, 100));
            
            // Initialize smooth scrolling
            Navigation.initSmoothScrolling();
        },
        
        toggleMobileMenu: () => {
            State.isMobileMenuOpen = !State.isMobileMenuOpen;
            DOM.hamburger.classList.toggle('active', State.isMobileMenuOpen);
            DOM.navMenu.classList.toggle('active', State.isMobileMenuOpen);
            document.body.style.overflow = State.isMobileMenuOpen ? 'hidden' : '';
            
            // Animate menu items
            if (State.isMobileMenuOpen) {
                document.querySelectorAll('.nav-item').forEach((item, index) => {
                    item.style.animation = `slideInRight 0.3s ease-out ${index * 0.1}s both`;
                });
            }
        },
        
        closeMobileMenu: () => {
            State.isMobileMenuOpen = false;
            DOM.hamburger.classList.remove('active');
            DOM.navMenu.classList.remove('active');
            document.body.style.overflow = '';
        },
        
        handleScroll: () => {
            if (DOM.navbar) {
                const isScrolled = window.scrollY > 50;
                DOM.navbar.classList.toggle('scrolled', isScrolled);
            }
        },
        
        initSmoothScrolling: () => {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const headerHeight = DOM.navbar?.offsetHeight || 0;
                        const targetPosition = target.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // Highlight target section
                        target.classList.add('section-highlight');
                        setTimeout(() => target.classList.remove('section-highlight'), 2000);
                    }
                });
            });
        }
    };
    
    // Gallery Module
    const Gallery = {
        init: () => {
            if (DOM.galleryTabs.length === 0) return;
            
            // Set initial active tab
            Gallery.setActiveTab('photos');
            
            // Add event listeners
            DOM.galleryTabs.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.getAttribute('data-tab');
                    Gallery.setActiveTab(tab);
                });
            });
            
            // Load gallery data
            Gallery.loadData();
        },
        
        setActiveTab: (tabName) => {
            State.activeGalleryTab = tabName;
            
            // Update tab buttons
            DOM.galleryTabs.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
            });
            
            // Update tab contents
            DOM.galleryContents.forEach(content => {
                const isActive = content.id === tabName;
                content.classList.toggle('active', isActive);
                content.style.display = isActive ? 'block' : 'none';
                
                // Add animation for active content
                if (isActive) {
                    content.style.animation = 'fadeInUp 0.5s ease-out';
                }
            });
        },
        
        loadData: () => {
            Gallery.loadPhotos();
            Gallery.loadVideos();
            Gallery.loadPress();
        },
        
        loadPhotos: () => {
            const photos = Utils.getFromStorage(CONFIG.STORAGE_KEYS.GALLERY_PHOTOS, []);
            const photosGrid = document.querySelector('#photos .gallery-grid');
            
            if (!photosGrid || photos.length === 0) return;
            
            photosGrid.innerHTML = photos.map(photo => {
                if (!photo?.image?.data) return '';
                
                return `
                    <div class="gallery-item" data-category="${photo.category || 'general'}">
                        <img src="${photo.image.data}" alt="${photo.title || 'Gallery Photo'}" loading="lazy">
                        <div class="gallery-overlay">
                            <h4>${photo.title || 'Untitled Photo'}</h4>
                            ${photo.description ? `<p>${photo.description}</p>` : ''}
                            ${photo.date ? `<span class="gallery-date">${Utils.formatDate(photo.date)}</span>` : ''}
                        </div>
                    </div>
                `;
            }).filter(html => html).join('');
        },
        
        loadVideos: () => {
            const videos = Utils.getFromStorage(CONFIG.STORAGE_KEYS.GALLERY_VIDEOS, []);
            const videosGrid = document.querySelector('#videos .video-grid');
            
            if (!videosGrid || videos.length === 0) return;
            
            videosGrid.innerHTML = videos.map(video => `
                <div class="video-card">
                    <div class="video-container">
                        <video controls poster="${video.thumbnail?.data || ''}" preload="metadata">
                            <source src="${video.video.data}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div class="video-info">
                        <h4>${video.title}</h4>
                        <p>${video.description || 'No description available'}</p>
                        <div class="video-meta">
                            <span><i class="fas fa-calendar"></i> ${Utils.formatDate(video.createdAt)}</span>
                            <span><i class="fas fa-tag"></i> ${video.category || 'General'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        },
        
        loadPress: () => {
            const pressItems = Utils.getFromStorage(CONFIG.STORAGE_KEYS.GALLERY_PRESS, []);
            const pressGrid = document.querySelector('#press .press-grid');
            
            if (!pressGrid || pressItems.length === 0) return;
            
            pressGrid.innerHTML = pressItems.map(press => `
                <article class="press-card">
                    ${press.image?.data ? `
                        <img src="${press.image.data}" alt="${press.title}" class="press-image">
                    ` : ''}
                    <div class="press-content">
                        <div class="press-meta">
                            ${press.type ? `<span class="press-type">${press.type}</span>` : ''}
                            ${press.date ? `<span class="press-date">${Utils.formatDate(press.date)}</span>` : ''}
                        </div>
                        <h3>${press.title}</h3>
                        <p>${press.description || 'No description available'}</p>
                        ${press.link ? `
                            <a href="${press.link}" target="_blank" rel="noopener noreferrer" class="press-link">
                                Read More <i class="fas fa-arrow-right"></i>
                            </a>
                        ` : ''}
                    </div>
                </article>
            `).join('');
        }
    };
    
    // Countdown Module
    const Countdown = {
        init: () => {
            if (!DOM.countdownTimer) return;
            
            const homeData = Utils.getFromStorage(CONFIG.STORAGE_KEYS.HOME_CONTENT, {});
            const targetDate = Countdown.parseDate(homeData.countdownDate || homeData.eventDate);
            
            if (targetDate) {
                Countdown.start(targetDate);
            }
            
            // Update event date display
            Countdown.updateEventDateDisplay();
        },
        
        parseDate: (dateString) => {
            if (!dateString) return null;
            
            try {
                // Try to parse the date string
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? null : date;
            } catch (error) {
                console.error('Error parsing date:', error);
                return null;
            }
        },
        
        start: (targetDate) => {
            // Clear existing interval
            if (State.countdownInterval) {
                clearInterval(State.countdownInterval);
            }
            
            const update = () => {
                const now = new Date().getTime();
                const distance = targetDate.getTime() - now;
                
                if (distance > 0) {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    
                    Countdown.updateDisplay(days, hours, minutes, seconds);
                    
                    // Add urgency classes
                    const daysElement = document.getElementById('days');
                    if (daysElement) {
                        daysElement.parentElement.classList.toggle('urgent', days === 0);
                        daysElement.parentElement.classList.toggle('warning', days <= 7 && days > 0);
                    }
                } else {
                    Countdown.showExpired();
                    clearInterval(State.countdownInterval);
                }
            };
            
            // Initial update
            update();
            
            // Update every second
            State.countdownInterval = setInterval(update, 1000);
        },
        
        updateDisplay: (days, hours, minutes, seconds) => {
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value.toString().padStart(2, '0');
                }
            };
            
            updateElement('days', days);
            updateElement('hours', hours);
            updateElement('minutes', minutes);
            updateElement('seconds', seconds);
        },
        
        showExpired: () => {
            Countdown.updateDisplay(0, 0, 0, 0);
            
            // Show expired message
            const expiredMessage = document.createElement('div');
            expiredMessage.className = 'countdown-expired';
            expiredMessage.innerHTML = `
                <i class="fas fa-calendar-check"></i>
                <span>Event has started!</span>
            `;
            
            DOM.countdownTimer.appendChild(expiredMessage);
        },
        
        updateEventDateDisplay: () => {
            const homeData = Utils.getFromStorage(CONFIG.STORAGE_KEYS.HOME_CONTENT, {});
            const eventDateElement = document.getElementById('eventDateDisplay');
            
            if (eventDateElement && homeData.eventDate) {
                const formattedDate = Utils.formatDate(homeData.eventDate);
                eventDateElement.textContent = formattedDate;
            }
        }
    };
    
    // Forms Module
    const Forms = {
        init: () => {
            Forms.initRegistrationForm();
            Forms.initContactForm();
            Forms.initFormValidation();
        },
        
        initRegistrationForm: () => {
            if (!DOM.registrationForm) return;
            
            DOM.registrationForm.addEventListener('submit', Forms.handleRegistrationSubmit);
            
            // Dynamic team members field
            const categorySelect = DOM.registrationForm.querySelector('#competitionCategory');
            const teamMembersField = DOM.registrationForm.querySelector('#teamMembers');
            
            if (categorySelect && teamMembersField) {
                categorySelect.addEventListener('change', (e) => {
                    const isDebate = e.target.value === 'debate';
                    teamMembersField.required = isDebate;
                    teamMembersField.closest('.form-group').style.display = isDebate ? 'block' : 'none';
                });
            }
        },
        
        initContactForm: () => {
            if (!DOM.contactForm) return;
            
            DOM.contactForm.addEventListener('submit', Forms.handleContactSubmit);
        },
        
        initFormValidation: () => {
            // Add validation to all forms
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', Forms.validateForm);
                
                // Add real-time validation
                form.querySelectorAll('input, textarea, select').forEach(field => {
                    field.addEventListener('blur', () => Forms.validateField(field));
                    field.addEventListener('input', () => Forms.clearFieldError(field));
                });
            });
        },
        
        validateForm: (e) => {
            const form = e.target;
            let isValid = true;
            
            form.querySelectorAll('[required]').forEach(field => {
                if (!Forms.validateField(field)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                Utils.showToast('Please fill all required fields correctly', 'error');
            }
            
            return isValid;
        },
        
        validateField: (field) => {
            const value = field.value.trim();
            let isValid = true;
            let message = '';
            
            // Check required fields
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                message = 'This field is required';
            }
            // Email validation
            else if (field.type === 'email' && value && !Utils.isValidEmail(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
            // Phone validation
            else if (field.type === 'tel' && value && !Utils.isValidPhone(value)) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
            
            if (!isValid) {
                Forms.showFieldError(field, message);
            } else {
                Forms.clearFieldError(field);
                Forms.showFieldSuccess(field);
            }
            
            return isValid;
        },
        
        showFieldError: (field, message) => {
            Forms.clearFieldError(field);
            
            field.classList.add('error');
            field.classList.remove('success');
            
            const errorElement = Utils.createElement('div', {
                class: 'field-error',
                style: {
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                    animation: 'slideInDown 0.3s ease-out'
                }
            }, [message]);
            
            field.parentNode.appendChild(errorElement);
        },
        
        showFieldSuccess: (field) => {
            field.classList.remove('error');
            field.classList.add('success');
        },
        
        clearFieldError: (field) => {
            field.classList.remove('error', 'success');
            
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
        },
        
        handleRegistrationSubmit: async (e) => {
            e.preventDefault();
            
            if (!Forms.validateForm(e)) return;
            
            const formData = new FormData(e.target);
            const registrationData = {
                id: Utils.generateId(),
                participantName: formData.get('participantName'),
                schoolName: formData.get('schoolName'),
                schoolType: formData.get('schoolType'),
                participantClass: formData.get('participantClass'),
                competitionCategory: formData.get('competitionCategory'),
                teamMembers: formData.get('teamMembers'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                motivation: formData.get('motivation'),
                competitionId: State.currentCompetition?.id || null,
                competitionTitle: State.currentCompetition?.title || null,
                registrationDate: new Date().toISOString(),
                status: 'pending'
            };
            
            // Save to storage
            const existingRegistrations = Utils.getFromStorage(CONFIG.STORAGE_KEYS.REGISTRATIONS, []);
            existingRegistrations.push(registrationData);
            Utils.saveToStorage(CONFIG.STORAGE_KEYS.REGISTRATIONS, existingRegistrations);
            
            // Show success
            Utils.showToast('Registration submitted successfully!', 'success');
            
            // Reset form
            e.target.reset();
            
            // Close registration if it's a modal
            Forms.hideRegistrationForm();
        },
        
        handleContactSubmit: async (e) => {
            e.preventDefault();
            
            if (!Forms.validateForm(e)) return;
            
            const formData = new FormData(e.target);
            const messageData = {
                id: Utils.generateId(),
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                read: false,
                replied: false
            };
            
            // Save to storage
            const existingMessages = Utils.getFromStorage(CONFIG.STORAGE_KEYS.CONTACT_MESSAGES, []);
            existingMessages.push(messageData);
            Utils.saveToStorage(CONFIG.STORAGE_KEYS.CONTACT_MESSAGES, existingMessages);
            
            // Show success
            Utils.showToast('Message sent successfully!', 'success');
            
            // Reset form
            e.target.reset();
        },
        
        hideRegistrationForm: () => {
            const registrationSection = document.getElementById('registration');
            if (registrationSection) {
                registrationSection.style.display = 'none';
            }
        }
    };
    
    // Competitions Module
    const Competitions = {
        init: () => {
            Competitions.loadCompetitions();
            Competitions.loadFeaturedCompetition();
            Competitions.initCompetitionModals();
        },
        
        loadCompetitions: () => {
            const competitionsGrid = document.getElementById('competitionsGrid');
            if (!competitionsGrid) return;
            
            const competitions = Utils.getFromStorage(CONFIG.STORAGE_KEYS.COMPETITIONS, []);
            const activeCompetitions = competitions.filter(comp => comp.status === 'active');
            
            if (activeCompetitions.length === 0) {
                competitionsGrid.innerHTML = Competitions.getEmptyStateHTML();
                return;
            }
            
            competitionsGrid.innerHTML = activeCompetitions.map(competition => 
                Competitions.getCompetitionCardHTML(competition)
            ).join('');
            
            // Initialize countdowns
            Competitions.initCompetitionCountdowns();
            
            // Add event listeners
            Competitions.addCompetitionEventListeners();
        },
        
        getEmptyStateHTML: () => `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Active Competitions</h3>
                <p>Check back soon for upcoming events!</p>
            </div>
        `,
        
        getCompetitionCardHTML: (competition) => {
            const deadlineDate = new Date(competition.deadline);
            const isUpcoming = deadlineDate > new Date();
            
            return `
                <div class="competition-card" data-id="${competition.id}">
                    <div class="competition-image">
                        ${competition.image?.data ? 
                            `<img src="${competition.image.data}" alt="${competition.title}" loading="lazy">` : 
                            `<div class="competition-placeholder">
                                <i class="fas fa-trophy"></i>
                            </div>`
                        }
                        ${isUpcoming ? `
                            <div class="countdown-badge" data-deadline="${competition.deadline}">
                                <i class="fas fa-clock"></i>
                                <span class="badge-timer"></span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="competition-content">
                        <div class="competition-header">
                            <h3>${competition.title}</h3>
                            <span class="competition-category">${Utils.formatCategory(competition.category)}</span>
                        </div>
                        <p class="competition-description">${competition.description}</p>
                        <div class="competition-details">
                            <div class="detail-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>Deadline: ${Utils.formatDate(competition.deadline)}</span>
                            </div>
                            ${competition.maxParticipants ? `
                                <div class="detail-item">
                                    <i class="fas fa-users"></i>
                                    <span>Max: ${competition.maxParticipants} participants</span>
                                </div>
                            ` : ''}
                            ${competition.prize ? `
                                <div class="detail-item">
                                    <i class="fas fa-gift"></i>
                                    <span>Prize: ${competition.prize}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="competition-actions">
                            <button class="btn btn-primary btn-register" data-id="${competition.id}">
                                <i class="fas fa-user-plus"></i> Register Now
                            </button>
                            <button class="btn btn-secondary btn-details" data-id="${competition.id}">
                                <i class="fas fa-info-circle"></i> View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },
        
        initCompetitionCountdowns: () => {
            const badges = document.querySelectorAll('.countdown-badge');
            
            const updateBadges = () => {
                badges.forEach(badge => {
                    const deadline = badge.getAttribute('data-deadline');
                    if (!deadline) return;
                    
                    const deadlineDate = new Date(deadline);
                    const now = new Date();
                    const distance = deadlineDate - now;
                    
                    if (distance > 0) {
                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        
                        const timerElement = badge.querySelector('.badge-timer');
                        if (timerElement) {
                            if (days > 1) {
                                timerElement.textContent = `${days}d`;
                            } else if (days === 1) {
                                timerElement.textContent = '1d';
                            } else {
                                timerElement.textContent = `${hours}h`;
                            }
                        }
                        
                        // Add urgency classes
                        badge.classList.toggle('urgent', days === 0);
                        badge.classList.toggle('warning', days <= 7 && days > 0);
                    } else {
                        badge.querySelector('.badge-timer').textContent = 'Ended';
                        badge.classList.add('expired');
                    }
                });
            };
            
            // Initial update
            updateBadges();
            
            // Update every minute
            setInterval(updateBadges, 60000);
        },
        
        addCompetitionEventListeners: () => {
            // Register buttons
            document.querySelectorAll('.btn-register').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const competitionId = e.currentTarget.getAttribute('data-id');
                    Competitions.showRegistrationForm(competitionId);
                });
            });
            
            // Details buttons
            document.querySelectorAll('.btn-details').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const competitionId = e.currentTarget.getAttribute('data-id');
                    Competitions.showCompetitionDetails(competitionId);
                });
            });
        },
        
        showRegistrationForm: (competitionId) => {
            const competitions = Utils.getFromStorage(CONFIG.STORAGE_KEYS.COMPETITIONS, []);
            const competition = competitions.find(comp => comp.id === competitionId);
            
            if (!competition) {
                Utils.showToast('Competition not found', 'error');
                return;
            }
            
            State.currentCompetition = competition;
            
            // Update registration form header
            const registrationHeader = document.querySelector('#registration .section-title h2');
            if (registrationHeader) {
                registrationHeader.innerHTML = `
                    Register for: ${competition.title}
                    <small>${Utils.formatCategory(competition.category)}</small>
                `;
            }
            
            // Show registration section
            const registrationSection = document.getElementById('registration');
            if (registrationSection) {
                registrationSection.style.display = 'block';
                registrationSection.scrollIntoView({ behavior: 'smooth' });
            }
        },
        
        showCompetitionDetails: (competitionId) => {
            const competitions = Utils.getFromStorage(CONFIG.STORAGE_KEYS.COMPETITIONS, []);
            const competition = competitions.find(comp => comp.id === competitionId);
            
            if (!competition) return;
            
            // Create modal
            const modal = Competitions.createCompetitionModal(competition);
            document.body.appendChild(modal);
            
            // Show modal
            setTimeout(() => modal.classList.add('active'), 10);
        },
        
        createCompetitionModal: (competition) => {
            const modal = Utils.createElement('div', {
                class: 'modal competition-modal',
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '9999',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'opacity 0.3s ease, visibility 0.3s ease'
                }
            });
            
            const modalContent = Utils.createElement('div', {
                class: 'modal-content',
                style: {
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    transform: 'translateY(20px)',
                    transition: 'transform 0.3s ease'
                }
            }, [
                Utils.createElement('button', {
                    class: 'modal-close',
                    onclick: () => modal.remove(),
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#666'
                    }
                }, ['×']),
                
                Utils.createElement('div', { class: 'modal-header' }, [
                    Utils.createElement('h2', { style: { marginBottom: '0.5rem' } }, [competition.title]),
                    Utils.createElement('span', { 
                        class: 'category-badge',
                        style: {
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                            color: '#1e3c72',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }
                    }, [Utils.formatCategory(competition.category)])
                ]),
                
                competition.image?.data && Utils.createElement('img', {
                    src: competition.image.data,
                    alt: competition.title,
                    style: {
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        margin: '1rem 0'
                    }
                }),
                
                Utils.createElement('div', { class: 'modal-body' }, [
                    Utils.createElement('p', { style: { marginBottom: '1.5rem' } }, [competition.description]),
                    
                    Utils.createElement('div', { class: 'competition-details-grid' }, [
                        Utils.createElement('div', { class: 'detail-item' }, [
                            Utils.createElement('i', { class: 'fas fa-calendar-alt' }),
                            Utils.createElement('span', {}, [`Deadline: ${Utils.formatDate(competition.deadline)}`])
                        ]),
                        
                        competition.maxParticipants && Utils.createElement('div', { class: 'detail-item' }, [
                            Utils.createElement('i', { class: 'fas fa-users' }),
                            Utils.createElement('span', {}, [`Max Participants: ${competition.maxParticipants}`])
                        ]),
                        
                        competition.prize && Utils.createElement('div', { class: 'detail-item' }, [
                            Utils.createElement('i', { class: 'fas fa-gift' }),
                            Utils.createElement('span', {}, [`Prize: ${competition.prize}`])
                        ])
                    ].filter(Boolean))
                ]),
                
                Utils.createElement('div', { class: 'modal-footer', style: { marginTop: '1.5rem' } }, [
                    Utils.createElement('button', {
                        class: 'btn btn-primary',
                        onclick: () => {
                            Competitions.showRegistrationForm(competition.id);
                            modal.remove();
                        },
                        style: { marginRight: '0.5rem' }
                    }, ['Register Now']),
                    
                    Utils.createElement('button', {
                        class: 'btn btn-secondary',
                        onclick: () => modal.remove()
                    }, ['Close'])
                ])
            ]);
            
            modal.appendChild(modalContent);
            
            // Add animation classes after a brief delay
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modalContent.style.transform = 'translateY(0)';
            }, 10);
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            return modal;
        },
        
        initCompetitionModals: () => {
            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const modal = document.querySelector('.competition-modal');
                    if (modal) modal.remove();
                }
            });
        },
        
        loadFeaturedCompetition: () => {
            const featuredSection = document.getElementById('featuredCompetition');
            if (!featuredSection) return;
            
            const competitions = Utils.getFromStorage(CONFIG.STORAGE_KEYS.COMPETITIONS, []);
            const featuredCompetition = competitions.find(comp => comp.featured === true);
            
            if (!featuredCompetition) {
                featuredSection.style.display = 'none';
                return;
            }
            
            featuredSection.style.display = 'block';
            
            // Update featured competition content
            const updateElement = (selector, content) => {
                const element = featuredSection.querySelector(selector);
                if (element) element.textContent = content;
            };
            
            updateElement('.featured-competition-title', featuredCompetition.title);
            updateElement('.featured-competition-description', featuredCompetition.description);
            updateElement('.featured-category', Utils.formatCategory(featuredCompetition.category));
            updateElement('.featured-deadline', `Deadline: ${Utils.formatDate(featuredCompetition.deadline)}`);
            
            // Update image
            const imageContainer = featuredSection.querySelector('.featured-competition-image');
            if (imageContainer) {
                if (featuredCompetition.image?.data) {
                    imageContainer.innerHTML = `<img src="${featuredCompetition.image.data}" alt="${featuredCompetition.title}">`;
                } else {
                    imageContainer.innerHTML = `
                        <div class="featured-image-placeholder">
                            <i class="fas fa-trophy"></i>
                        </div>
                    `;
                }
            }
            
            // Update event listeners
            const registerBtn = featuredSection.querySelector('.btn-register-featured');
            const detailsBtn = featuredSection.querySelector('.btn-details-featured');
            
            if (registerBtn) {
                registerBtn.onclick = () => Competitions.showRegistrationForm(featuredCompetition.id);
            }
            
            if (detailsBtn) {
                detailsBtn.onclick = () => Competitions.showCompetitionDetails(featuredCompetition.id);
            }
        }
    };
    
    // Hero Strip Carousel Module
    const HeroCarousel = {
        init: () => {
            const strip = document.querySelector('.hero-strip');
            if (!strip) return;
            
            HeroCarousel.createCarousel(strip);
        },
        
        createCarousel: (strip) => {
            const inner = Utils.createElement('div', { class: 'hero-strip-inner' });
            const track = Utils.createElement('div', { class: 'hero-strip-track' });
            
            // Function to add images to track
            const addImages = (container) => {
                CONFIG.IMAGES.HERO_STRIP.forEach(src => {
                    const img = Utils.createElement('img', {
                        src: src,
                        alt: '',
                        loading: 'lazy'
                    });
                    container.appendChild(img);
                });
            };
            
            // Add two sets for seamless looping
            addImages(track);
            addImages(track);
            
            inner.appendChild(track);
            strip.appendChild(inner);
            
            // Calculate animation duration based on total width
            const calculateDuration = () => {
                const images = track.querySelectorAll('img');
                if (images.length === 0) return;
                
                // Calculate total width of first set
                let totalWidth = 0;
                const firstSet = Array.from(images).slice(0, images.length / 2);
                
                firstSet.forEach(img => {
                    if (img.complete) {
                        totalWidth += img.width || 300;
                    }
                });
                
                // Set animation duration (speed: 400px per second)
                const speed = 400; // pixels per second
                const duration = Math.max(10, totalWidth / speed);
                track.style.setProperty('--hero-strip-duration', `${duration}s`);
            };
            
            // Wait for images to load
            const images = track.querySelectorAll('img');
            let loadedCount = 0;
            
            images.forEach(img => {
                if (img.complete) {
                    loadedCount++;
                } else {
                    img.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === images.length / 2) {
                            calculateDuration();
                        }
                    });
                    
                    img.addEventListener('error', () => {
                        loadedCount++;
                        if (loadedCount === images.length / 2) {
                            calculateDuration();
                        }
                    });
                }
            });
            
            if (loadedCount === images.length / 2) {
                calculateDuration();
            }
            
            // Recalculate on resize
            window.addEventListener('resize', Utils.debounce(calculateDuration, 250));
        }
    };
    
    // Theme Module
    const Theme = {
        init: () => {
            // Load saved theme
            const savedTheme = localStorage.getItem('theme') || 'light';
            Theme.set(savedTheme);
            
            // Initialize theme toggle if button exists
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', Theme.toggle);
            }
        },
        
        set: (theme) => {
            State.currentTheme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Update UI if theme toggle exists
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.innerHTML = theme === 'dark' ? 
                    '<i class="fas fa-sun"></i>' : 
                    '<i class="fas fa-moon"></i>';
            }
        },
        
        toggle: () => {
            const newTheme = State.currentTheme === 'light' ? 'dark' : 'light';
            Theme.set(newTheme);
        }
    };
    
    // Performance Module
    const Performance = {
        init: () => {
            Performance.initLazyLoading();
            Performance.initIntersectionObserver();
            Performance.initPrefetching();
        },
        
        initLazyLoading: () => {
            if ('loading' in HTMLImageElement.prototype) {
                // Native lazy loading supported
                document.querySelectorAll('img[data-src]').forEach(img => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                });
            } else {
                // Fallback to Intersection Observer
                Performance.lazyLoadWithObserver();
            }
        },
        
        lazyLoadWithObserver: () => {
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
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        },
        
        initIntersectionObserver: () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observe elements for animation
            document.querySelectorAll('.section, .card, .gallery-item').forEach(el => {
                observer.observe(el);
            });
        },
        
        initPrefetching: () => {
            // Prefetch next page if applicable
            if (document.querySelector('link[rel="next"]')) {
                const nextPage = document.querySelector('link[rel="next"]').href;
                const prefetchLink = Utils.createElement('link', {
                    rel: 'prefetch',
                    href: nextPage,
                    as: 'document'
                });
                document.head.appendChild(prefetchLink);
            }
        }
    };
    
    // ===== INITIALIZATION =====
    document.addEventListener('DOMContentLoaded', () => {
        console.log('ESI Script Initializing...');
        
        // Initialize all modules
        Navigation.init();
        Gallery.init();
        Countdown.init();
        Forms.init();
        Competitions.init();
        HeroCarousel.init();
        Theme.init();
        Performance.init();
        
        // Add additional event listeners
        window.addEventListener('storage', (e) => {
            // Refresh data when localStorage changes
            if (e.key === CONFIG.STORAGE_KEYS.COMPETITIONS) {
                Competitions.loadCompetitions();
                Competitions.loadFeaturedCompetition();
            } else if (e.key === CONFIG.STORAGE_KEYS.GALLERY_PHOTOS || 
                       e.key === CONFIG.STORAGE_KEYS.GALLERY_VIDEOS || 
                       e.key === CONFIG.STORAGE_KEYS.GALLERY_PRESS) {
                Gallery.loadData();
            } else if (e.key === CONFIG.STORAGE_KEYS.HOME_CONTENT) {
                Countdown.init();
            }
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save (for forms)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const activeForm = document.querySelector('form:focus-within');
                if (activeForm) {
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.active');
                if (modal) modal.remove();
            }
        });
        
        console.log('ESI Script Initialized Successfully');
    });
    
    // ===== GLOBAL EXPORTS =====
    window.ESI = {
        Utils,
        Navigation,
        Gallery,
        Countdown,
        Forms,
        Competitions,
        Theme,
        Performance,
        State,
        CONFIG
    };
    
})();

// ===== ADDITIONAL CSS ANIMATIONS =====
(function() {
    const styles = `
        @keyframes slideInRight {
            0% { opacity: 0; transform: translateX(30px); }
            100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideOutRight {
            0% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(30px); }
        }
        
        @keyframes slideInDown {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes ripple {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(4); opacity: 0; }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        
        .animate-in {
            animation: fadeInUp 0.8s ease-out both;
        }
        
        .section-highlight {
            animation: pulse 2s ease-out;
        }
        
        .toast {
            animation: slideInRight 0.3s ease-out;
        }
        
        .toast.hiding {
            animation: slideOutRight 0.3s ease-out;
        }
        
        .hero-strip-track {
            animation: heroStripScroll var(--hero-strip-duration, 60s) linear infinite;
        }
        
        @keyframes heroStripScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
        }
        
        .field-error {
            animation: slideInDown 0.3s ease-out;
        }
        
        .loading {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
})();