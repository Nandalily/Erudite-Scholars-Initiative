// ESI Admin Dashboard System
class AdminDashboard {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredRegistrations = [];
        this.filteredMessages = [];
        this.currentUser = null;
        this.sessionTimeoutId = null;
        this.lastRegistrationCount = 0;
        this.lastMessageCount = 0;
        
        // Initialize gallery data storage
        this.currentGalleryPhotosData = [];
        this.currentGalleryThumbnailData = null;
        this.currentGalleryPressImageData = null;
        this.currentGalleryVideoData = null;
        
        this.init();
    }

    init() {
        // Temporarily disable authentication check for debugging
        // if (!this.checkAuthentication()) {
        //     return; // Stop initialization if not authenticated
        // }
        
        console.log('AdminDashboard init() called - authentication check disabled for debugging');
        
        this.setupEventListeners();
        this.loadDashboardData();
        this.loadRegistrations();
        this.loadMessages();
        this.loadCompetitions();
        this.setupModals();
        this.updateCountdown();
        this.loadGalleryData();
        this.loadActivitiesContent();
        this.loadHomeContent();
    }

    checkAuthentication() {
        console.log('checkAuthentication called');
        
        const session = this.getSession();
        console.log('Retrieved session:', session);
        
        if (!session || !session.isValid) {
            console.log('Session invalid or missing, redirecting to login');
            // Clear any existing session data
            localStorage.removeItem('esiAdminSession');
            // Redirect to login page immediately
            window.location.replace('admin-login.html');
            return false;
        }

        console.log('Session is valid, proceeding with initialization');
        
        this.currentUser = session.username;
        const adminUsernameElement = document.getElementById('adminUsername');
        if (adminUsernameElement) {
            adminUsernameElement.textContent = this.currentUser;
        }
        
        // Set up session timeout only once
        this.setupSessionTimeout(session.expiresAt);
        return true;
    }

    getSession() {
        console.log('getSession called');
        
        const sessionData = localStorage.getItem('esiAdminSession');
        console.log('Raw session data from localStorage:', sessionData);
        
        if (!sessionData) {
            console.log('No session data found');
            return null;
        }

        try {
            const session = JSON.parse(sessionData);
            console.log('Parsed session:', session);
            
            const now = Date.now();
            console.log('Current time:', now, 'Session expires at:', session.expiresAt);
            
            if (now > session.expiresAt) {
                console.log('Session expired');
                localStorage.removeItem('esiAdminSession');
                return null;
            }
            
            console.log('Session is valid and not expired');
            return session;
        } catch (error) {
            console.error('Error parsing session:', error);
            localStorage.removeItem('esiAdminSession');
            return null;
        }
    }

    setupSessionTimeout(expiresAt) {
        // Clear any existing timeout
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
        }
        
        const timeUntilExpiry = expiresAt - Date.now();
        if (timeUntilExpiry > 0) {
            this.sessionTimeoutId = setTimeout(() => {
                this.logout('Session expired');
            }, timeUntilExpiry);
        }
    }

    setupEventListeners() {
        // Form submissions
        const addCompetitionForm = document.getElementById('addCompetitionForm');
        if (addCompetitionForm) {
            addCompetitionForm.addEventListener('submit', (e) => this.handleAddCompetition(e));
        }

        // File upload event listeners
        const compImageInput = document.getElementById('compImage');
        if (compImageInput) {
            compImageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        const compFileInput = document.getElementById('compFile');
        if (compFileInput) {
            compFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Gallery management event listeners
        const videoFileInput = document.getElementById('videoFile');
        if (videoFileInput) {
            videoFileInput.addEventListener('change', (e) => this.handleGalleryVideoUpload(e));
        }

        const addVideoForm = document.getElementById('addVideoForm');
        if (addVideoForm) {
            addVideoForm.addEventListener('submit', (e) => this.handleAddVideo(e));
        }

        const addPressForm = document.getElementById('addPressForm');
        if (addPressForm) {
            addPressForm.addEventListener('submit', (e) => this.handleAddPress(e));
        }

        // Gallery file upload event listeners
        const photoImageInput = document.getElementById('photoImage');
        if (photoImageInput) {
            photoImageInput.addEventListener('change', (e) => this.handleGalleryImageUpload(e, 'photo'));
        }

        const videoThumbnailInput = document.getElementById('videoThumbnail');
        if (videoThumbnailInput) {
            videoThumbnailInput.addEventListener('change', (e) => this.handleGalleryImageUpload(e, 'thumbnail'));
        }

        const pressImageInput = document.getElementById('pressImage');
        if (pressImageInput) {
            pressImageInput.addEventListener('change', (e) => this.handleGalleryImageUpload(e, 'press'));
        }

        // Gallery tab functionality
        const galleryTabBtns = document.querySelectorAll('.gallery-tab-btn');
        galleryTabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchGalleryTab(e);
                // Re-attach form listeners when switching tabs
                setTimeout(() => this.attachGalleryFormListeners(), 100);
            });
        });
        
        // Attach gallery form listeners
        this.attachGalleryFormListeners();

        // Handle page unload to clean up timeouts
        window.addEventListener('beforeunload', () => {
            if (this.sessionTimeoutId) {
                clearTimeout(this.sessionTimeoutId);
            }
        });
        
        // Reload registrations when navigating to registrations section
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#registrations') {
                console.log('Navigated to registrations section, reloading...');
                setTimeout(() => {
                    this.loadRegistrations();
                    this.updateDashboardStats();
                }, 100);
            }
            if (window.location.hash === '#messages') {
                console.log('Navigated to messages section, reloading...');
                setTimeout(() => {
                    this.loadMessages();
                    this.updateDashboardStats();
                }, 100);
            }
        });
        
        // Also check on initial load if we're on registrations or messages section
        if (window.location.hash === '#registrations') {
            setTimeout(() => {
                this.loadRegistrations();
                this.updateDashboardStats();
            }, 300);
        }
        if (window.location.hash === '#messages') {
            setTimeout(() => {
                this.loadMessages();
                this.updateDashboardStats();
            }, 300);
        }
        
        // Also reload when clicking on registrations nav link (in case hash doesn't change)
        const registrationsNavLink = document.querySelector('a[href="#registrations"]');
        if (registrationsNavLink) {
            registrationsNavLink.addEventListener('click', () => {
                setTimeout(() => {
                    console.log('Registrations nav link clicked, reloading...');
                    this.loadRegistrations();
                    this.updateDashboardStats();
                }, 200);
            });
        }
        
        // Also reload when clicking on messages nav link (in case hash doesn't change)
        const messagesNavLink = document.querySelector('a[href="#messages"]');
        if (messagesNavLink) {
            messagesNavLink.addEventListener('click', () => {
                setTimeout(() => {
                    console.log('Messages nav link clicked, reloading...');
                    this.loadMessages();
                    this.updateDashboardStats();
                }, 200);
            });
        }
        
        // Listen for localStorage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'esiRegistrations') {
                const newCount = JSON.parse(e.newValue || '[]').length;
                console.log('Detected new registration in localStorage (storage event), refreshing...', {
                    newCount: newCount,
                    oldCount: this.lastRegistrationCount
                });
                this.lastRegistrationCount = newCount;
                this.loadRegistrations();
                this.updateDashboardStats();
            }
            if (e.key === 'esiContactMessages') {
                const newCount = JSON.parse(e.newValue || '[]').length;
                console.log('Detected new message in localStorage (storage event), refreshing...', {
                    newCount: newCount,
                    oldCount: this.lastMessageCount
                });
                this.lastMessageCount = newCount;
                this.loadMessages();
                this.updateDashboardStats();
            }
        });
        
        // Also listen for focus events to refresh when admin dashboard regains focus
        window.addEventListener('focus', () => {
            // Refresh registrations when window regains focus
            const currentRegistrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
            if (currentRegistrations.length !== this.lastRegistrationCount) {
                console.log('Registration count changed (focus event), refreshing...', {
                    current: currentRegistrations.length,
                    last: this.lastRegistrationCount
                });
                this.lastRegistrationCount = currentRegistrations.length;
                this.loadRegistrations();
                this.updateDashboardStats();
            }
            
            // Refresh messages when window regains focus
            const currentMessages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
            if (currentMessages.length !== this.lastMessageCount) {
                console.log('Message count changed (focus event), refreshing...', {
                    current: currentMessages.length,
                    last: this.lastMessageCount
                });
                this.lastMessageCount = currentMessages.length;
                this.loadMessages();
                this.updateDashboardStats();
            }
        });
        
        // Use Intersection Observer to reload registrations when section becomes visible
        const registrationsSection = document.getElementById('registrations');
        if (registrationsSection && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log('Registrations section became visible, checking for updates...');
                        const currentRegistrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
                        if (currentRegistrations.length !== this.lastRegistrationCount) {
                            console.log('Registration count changed (visibility), refreshing...', {
                                current: currentRegistrations.length,
                                last: this.lastRegistrationCount
                            });
                            this.lastRegistrationCount = currentRegistrations.length;
                            this.loadRegistrations();
                            this.updateDashboardStats();
                        }
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(registrationsSection);
        }
        
        // Use Intersection Observer to reload messages when section becomes visible
        const messagesSection = document.getElementById('messages');
        if (messagesSection && 'IntersectionObserver' in window) {
            const messagesObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log('Messages section became visible, checking for updates...');
                        const currentMessages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
                        if (currentMessages.length !== this.lastMessageCount) {
                            console.log('Message count changed (visibility), refreshing...', {
                                current: currentMessages.length,
                                last: this.lastMessageCount
                            });
                            this.lastMessageCount = currentMessages.length;
                            this.loadMessages();
                            this.updateDashboardStats();
                        }
                    }
                });
            }, { threshold: 0.1 });
            
            messagesObserver.observe(messagesSection);
        }
        
        // Also reload when page becomes visible (handles tab switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const currentRegistrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
                if (currentRegistrations.length !== this.lastRegistrationCount) {
                    console.log('Page visible and registration count changed, refreshing...', {
                        current: currentRegistrations.length,
                        last: this.lastRegistrationCount
                    });
                    this.lastRegistrationCount = currentRegistrations.length;
                    this.loadRegistrations();
                    this.updateDashboardStats();
                }
                
                const currentMessages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
                if (currentMessages.length !== this.lastMessageCount) {
                    console.log('Page visible and message count changed, refreshing...', {
                        current: currentMessages.length,
                        last: this.lastMessageCount
                    });
                    this.lastMessageCount = currentMessages.length;
                    this.loadMessages();
                    this.updateDashboardStats();
                }
            }
        });

        const replyForm = document.getElementById('replyForm');
        if (replyForm) {
            replyForm.addEventListener('submit', (e) => this.handleReply(e));
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeAllModals());
        });

        // Window click to close modals
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Delete confirmation
        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.confirmDeleteAction());
        }

        const cancelDelete = document.getElementById('cancelDelete');
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.closeModal('deleteModal'));
        }
    }

    setupModals() {
        // Registration modal actions
        const approveBtn = document.getElementById('approveRegistration');
        const rejectBtn = document.getElementById('rejectRegistration');
        const editBtn = document.getElementById('editRegistration');

        if (approveBtn) approveBtn.addEventListener('click', () => this.approveRegistration());
        if (rejectBtn) rejectBtn.addEventListener('click', () => this.rejectRegistration());
        if (editBtn) editBtn.addEventListener('click', () => this.editRegistration());

        // Message modal actions
        const replyBtn = document.getElementById('replyMessage');
        const markAsReadBtn = document.getElementById('markAsRead');
        const deleteMsgBtn = document.getElementById('deleteMessage');

        if (replyBtn) replyBtn.addEventListener('click', () => this.openReplyModal());
        if (markAsReadBtn) markAsReadBtn.addEventListener('click', () => this.markMessageAsRead());
        if (deleteMsgBtn) deleteMsgBtn.addEventListener('click', () => this.deleteMessage());
    }

    loadDashboardData() {
        this.updateDashboardStats();
        this.updateCountdown();
    }

   updateDashboardStats() {
    const registrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
    const messages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
    
    // Update main dashboard stats
    document.getElementById('totalRegistrations').textContent = registrations.length;
    
    // Category breakdown
    const debateCount = registrations.filter(r => r.competitionCategory === 'debate').length;
    const poetryCount = registrations.filter(r => r.competitionCategory === 'poetry').length;
    const speechCount = registrations.filter(r => r.competitionCategory === 'public-speech').length;
    
    document.getElementById('debateRegistrations').textContent = debateCount;
    document.getElementById('poetryRegistrations').textContent = poetryCount;
    document.getElementById('speechRegistrations').textContent = speechCount;
    
    // Messages
    document.getElementById('totalMessages').textContent = messages.length;
    const unreadCount = messages.filter(m => !m.read).length;
    document.getElementById('unreadMessages').textContent = unreadCount;
    
    // Schools
    const uniqueSchools = new Set(registrations.map(r => r.schoolName));
    document.getElementById('totalSchools').textContent = uniqueSchools.size;
    
    const publicSchools = registrations.filter(r => r.schoolType === 'public').length;
    const privateSchools = registrations.filter(r => r.schoolType === 'private').length;
    
    document.getElementById('publicSchools').textContent = publicSchools;
    document.getElementById('privateSchools').textContent = privateSchools;
    
    // Update header status indicators
    document.getElementById('totalRegistrationsLarge').textContent = registrations.length;
    document.getElementById('totalMessagesLarge').textContent = messages.length;
    document.getElementById('totalSchoolsLarge').textContent = uniqueSchools.size;
    
    // Update notifications in nav
    this.updateNavNotifications(registrations.length, unreadCount);
    
    // Update admin username in header
    this.updateAdminUsername();
}

updateNavNotifications(regCount, unreadMsgCount) {
    const regNotification = document.getElementById('regNotification');
    const msgNotification = document.getElementById('msgNotification');
    
    if (regNotification) {
        if (regCount > 0) {
            regNotification.textContent = regCount;
            regNotification.style.display = 'flex';
        } else {
            regNotification.style.display = 'none';
        }
    }
    
    if (msgNotification) {
        if (unreadMsgCount > 0) {
            msgNotification.textContent = unreadMsgCount;
            msgNotification.style.display = 'flex';
        } else {
            msgNotification.style.display = 'none';
        }
    }
}

updateAdminUsername() {
    const adminUsername = localStorage.getItem('adminUsername') || 'Admin';
    const usernameElements = document.querySelectorAll('#adminUsername, #adminUsernameLarge');
    
    usernameElements.forEach(element => {
        if (element) {
            element.textContent = adminUsername;
        }
    });
}

    updateCountdown() {
        const eventDate = new Date('September 21, 2025 09:00:00').getTime();
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            document.getElementById('daysUntilEvent').textContent = days;
        } else {
            document.getElementById('daysUntilEvent').textContent = '0';
        }
    }

    loadRegistrations() {
        const registrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
        console.log('Loading registrations:', registrations.length, 'found');
        
        // Update last known count
        this.lastRegistrationCount = registrations.length;
        
        this.filteredRegistrations = registrations.map((reg, index) => ({
            ...reg,
            id: index + 1,
            status: reg.status || 'pending',
            registrationDate: reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : (reg.timestamp ? new Date(reg.timestamp).toLocaleDateString() : 'N/A')
        }));
        
        console.log('Filtered registrations:', this.filteredRegistrations.length);
        this.displayRegistrations();
        this.populateSchoolFilter();
    }

    displayRegistrations() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageRegistrations = this.filteredRegistrations.slice(startIndex, endIndex);
        
        const tbody = document.getElementById('registrationsTableBody');
        if (!tbody) {
            console.warn('registrationsTableBody not found, retrying in 100ms...');
            // Retry if element doesn't exist yet (DOM might not be ready)
            setTimeout(() => this.displayRegistrations(), 100);
            return;
        }
        
        if (pageRegistrations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: #666;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
                        <p>No registrations found.</p>
                        ${this.filteredRegistrations.length === 0 ? '<small>Registrations will appear here once students submit their forms.</small>' : '<small>Try adjusting your filters.</small>'}
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageRegistrations.map(reg => `
                <tr>
                    <td>${reg.id}</td>
                    <td>${reg.participantName || 'N/A'}</td>
                    <td>${reg.schoolName || 'N/A'}</td>
                    <td>${this.formatCategory(reg.competitionCategory || '')}</td>
                    <td>${reg.email || 'N/A'}</td>
                    <td><span class="status-badge status-${reg.status}">${reg.status}</span></td>
                    <td>${reg.registrationDate}</td>
                    <td>
                        <button class="btn-small btn-primary" onclick="adminDashboard.viewRegistration(${reg.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-small btn-success" onclick="adminDashboard.approveRegistration(${reg.id})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-small btn-danger" onclick="adminDashboard.rejectRegistration(${reg.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        this.updatePagination();
    }

    formatCategory(category) {
        const categories = {
            'debate': 'Debate',
            'poetry': 'Poetry',
            'public-speech': 'Public Speech'
        };
        return categories[category] || category;
    }

    populateSchoolFilter() {
        const schools = [...new Set(this.filteredRegistrations.map(r => r.schoolName))];
        const schoolFilter = document.getElementById('schoolFilter');
        if (schoolFilter) {
            schoolFilter.innerHTML = '<option value="">All Schools</option>' + 
                schools.map(school => `<option value="${school}">${school}</option>`).join('');
        }
    }

    filterRegistrations() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const schoolFilter = document.getElementById('schoolFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        this.filteredRegistrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]')
            .filter(reg => {
                if (categoryFilter && reg.competitionCategory !== categoryFilter) return false;
                if (schoolFilter && reg.schoolName !== schoolFilter) return false;
                if (statusFilter && (reg.status || 'pending') !== statusFilter) return false;
                return true;
            })
            .map((reg, index) => ({
                ...reg,
                id: index + 1,
                status: reg.status || 'pending',
                registrationDate: reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A'
            }));
        
        this.currentPage = 1;
        this.displayRegistrations();
    }

    searchRegistrations() {
        const searchTerm = document.getElementById('searchRegistrations').value.toLowerCase();
        
        if (!searchTerm) {
            this.filterRegistrations();
            return;
        }
        
        this.filteredRegistrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]')
            .filter(reg => 
                reg.participantName.toLowerCase().includes(searchTerm) ||
                reg.schoolName.toLowerCase().includes(searchTerm) ||
                reg.email.toLowerCase().includes(searchTerm)
            )
            .map((reg, index) => ({
                ...reg,
                id: index + 1,
                status: reg.status || 'pending',
                registrationDate: reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A'
            }));
        
        this.currentPage = 1;
        this.displayRegistrations();
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredRegistrations.length / this.itemsPerPage);
        this.currentPage += direction;
        
        if (this.currentPage < 1) this.currentPage = 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        
        this.displayRegistrations();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredRegistrations.length / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }

    loadMessages() {
        const messages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
        console.log('Loading messages:', messages.length, 'found');
        
        // Update last known count
        this.lastMessageCount = messages.length;
        
        this.filteredMessages = messages.map((msg, index) => ({
            ...msg,
            id: index + 1,
            read: msg.read || false,
            replied: msg.replied || false,
            date: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : 'N/A'
        }));
        
        console.log('Filtered messages:', this.filteredMessages.length);
        this.displayMessages();
    }

    displayMessages() {
        const messagesList = document.getElementById('messagesList');
        if (!messagesList) {
            console.warn('messagesList not found, retrying in 100ms...');
            // Retry if element doesn't exist yet (DOM might not be ready)
            setTimeout(() => this.displayMessages(), 100);
            return;
        }
        
        if (this.filteredMessages.length === 0) {
            messagesList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
                    <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">No messages found.</p>
                    <small>Messages will appear here once visitors submit contact forms.</small>
                </div>
            `;
        } else {
            messagesList.innerHTML = this.filteredMessages.map(msg => `
                <div class="message-item ${msg.read ? 'read' : 'unread'} ${msg.replied ? 'replied' : ''}">
                    <div class="message-header">
                        <h4>${msg.subject || 'No Subject'}</h4>
                        <div class="message-meta">
                            <span class="sender">${msg.name || 'N/A'}</span>
                            <span class="email">${msg.email || 'N/A'}</span>
                            <span class="date">${msg.date}</span>
                            <span class="status-badge status-${msg.read ? 'read' : 'unread'}">
                                ${msg.read ? 'Read' : 'Unread'}
                            </span>
                        </div>
                    </div>
                    <div class="message-content">
                        <p>${(msg.message || '').substring(0, 150)}${(msg.message || '').length > 150 ? '...' : ''}</p>
                    </div>
                    <div class="message-actions">
                        <button class="btn-small btn-primary" onclick="adminDashboard.viewMessage(${msg.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-small btn-success" onclick="adminDashboard.replyToMessage(${msg.id})">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        <button class="btn-small btn-danger" onclick="adminDashboard.deleteMessage(${msg.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    filterMessages() {
        const statusFilter = document.getElementById('messageStatusFilter').value;
        
        if (!statusFilter) {
            this.loadMessages();
            return;
        }
        
        const messages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
        this.filteredMessages = messages.filter(msg => {
            if (statusFilter === 'unread') return !msg.read;
            if (statusFilter === 'read') return msg.read && !msg.replied;
            if (statusFilter === 'replied') return msg.replied;
            return true;
        }).map((msg, index) => ({
            ...msg,
            id: index + 1,
            read: msg.read || false,
            replied: msg.replied || false,
            date: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : 'N/A'
        }));
        
        this.displayMessages();
    }

    searchMessages() {
        const searchTerm = document.getElementById('searchMessages').value.toLowerCase();
        
        if (!searchTerm) {
            this.loadMessages();
            return;
        }
        
        const messages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
        this.filteredMessages = messages.filter(msg => 
            msg.subject.toLowerCase().includes(searchTerm) ||
            msg.name.toLowerCase().includes(searchTerm) ||
            msg.message.toLowerCase().includes(searchTerm)
        ).map((msg, index) => ({
            ...msg,
            id: index + 1,
            read: msg.read || false,
            replied: msg.replied || false,
            date: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : 'N/A'
        }));
        
        this.displayMessages();
    }

    loadCompetitions() {
        const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
        const competitionsList = document.getElementById('adminCompetitionsList');
        
        if (competitionsList) {
            competitionsList.innerHTML = competitions.map(comp => `
                <div class="competition-item">
                    <div class="competition-info">
                        <h4>${comp.title}</h4>
                        <div class="competition-meta">
                            <span class="category">${this.formatCategory(comp.category)}</span>
                            <span class="deadline">Deadline: ${comp.deadline}</span>
                            <span class="status">Status: ${comp.status}</span>
                            ${comp.featured ? '<span class="featured-status">⭐ Featured on Home</span>' : ''}
                        </div>
                        <p>${comp.description}</p>
                        
                        <!-- Display uploaded files and images -->
                        ${comp.image ? `
                            <div class="competition-attachments">
                                <div class="attachment-item">
                                    <i class="fas fa-image"></i>
                                    <span>Image: ${comp.image.name}</span>
                                    <small>(${(comp.image.size / 1024 / 1024).toFixed(2)} MB)</small>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${comp.file ? `
                            <div class="competition-attachments">
                                <div class="attachment-item">
                                    <i class="fas fa-file"></i>
                                    <span>File: ${comp.file.name}</span>
                                    <small>(${(comp.file.size / 1024 / 1024).toFixed(2)} MB)</small>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="competition-actions">
                        <button class="btn-small btn-primary" onclick="adminDashboard.editCompetition('${comp.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-small ${comp.featured ? 'btn-success' : 'btn-secondary'}" onclick="adminDashboard.toggleFeaturedCompetition('${comp.id}')">
                            <i class="fas fa-${comp.featured ? 'star' : 'star-o'}"></i> 
                            ${comp.featured ? 'Featured' : 'Feature'}
                        </button>
                        <button class="btn-small btn-danger" onclick="adminDashboard.deleteCompetition('${comp.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    handleAddCompetition(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const competition = {
            id: Date.now().toString(),
            title: formData.get('title'),
            category: formData.get('category'),
            deadline: formData.get('deadline'),
            maxParticipants: formData.get('maxParticipants'),
            description: formData.get('description'),
            prize: formData.get('prize'),
            status: formData.get('status'),
            image: this.currentImageData || null,
            file: this.currentFileData || null,
            createdAt: new Date().toISOString()
        };
        
        const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
        competitions.push(competition);
        localStorage.setItem('esiCompetitions', JSON.stringify(competitions));
        
        this.loadCompetitions();
        e.target.reset();
        
        // Clear file previews
        this.clearFilePreviews();
        
        // Trigger welcome page competitions refresh if it's open
        this.refreshWelcomePageCompetitions();
        
        this.showNotification('Competition added successfully!', 'success');
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image file size must be less than 5MB', 'error');
            e.target.value = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            e.target.value = '';
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            
            previewImg.src = event.target.result;
            imagePreview.style.display = 'block';
            
            // Store image data for form submission
            this.currentImageData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: event.target.result
            };
        };
        reader.readAsDataURL(file);
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File size must be less than 10MB', 'error');
            e.target.value = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            this.showNotification('Please select a valid file type (PDF, DOC, DOCX, TXT, ZIP, RAR)', 'error');
            e.target.value = '';
            return;
        }

        // Show file preview
        const filePreview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');
        
        fileName.textContent = file.name;
        filePreview.style.display = 'block';
        
        // Store file data for form submission
        this.currentFileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            extension: fileExtension
        };
    }

    clearFilePreviews() {
        // Clear image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.style.display = 'none';
        }
        
        // Clear file preview
        const filePreview = document.getElementById('filePreview');
        if (filePreview) {
            filePreview.style.display = 'none';
        }
        
        // Clear stored data
        this.currentImageData = null;
        this.currentFileData = null;
        
        // Clear input values
        const compImageInput = document.getElementById('compImage');
        const compFileInput = document.getElementById('compFile');
        if (compImageInput) compImageInput.value = '';
        if (compFileInput) compFileInput.value = '';
    }

    // Gallery Management Methods
    handleAddPhoto(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('handleAddPhoto called');
        
        const form = e.target;
        const formData = new FormData(form);
        const photosToSave = this.currentGalleryPhotosData || [];
        
        console.log('Form data:', {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            photosCount: photosToSave.length
        });
        
        if (!photosToSave || photosToSave.length === 0) {
            console.warn('No photos selected');
            this.showNotification('Please select up to 4 photos to upload', 'error');
            // Focus on the file input to help user
            const photoInput = document.getElementById('photoImage');
            if (photoInput) {
                photoInput.focus();
                photoInput.click();
            }
            return;
        }
        
        console.log(`Saving ${photosToSave.length} photo(s)`);
        
        try {
            const timestamp = Date.now();
            const photos = JSON.parse(localStorage.getItem('esiGalleryPhotos') || '[]');
            
            let savedCount = 0;
            photosToSave.forEach((photoImage, index) => {
                if (!photoImage || !photoImage.data) {
                    console.error(`Photo ${index} is invalid:`, photoImage);
                    return;
                }
                
                // Validate image data
                if (typeof photoImage.data !== 'string' || !photoImage.data.startsWith('data:')) {
                    console.error(`Photo ${index} has invalid data format`);
                    return;
                }
                
                try {
                    photos.push({
                        id: `${timestamp}-${index}`,
                        title: photosToSave.length > 1 ? `${formData.get('title') || 'Untitled Photo'} (${index + 1})` : (formData.get('title') || 'Untitled Photo'),
                        category: formData.get('category') || 'other',
                        description: formData.get('description') || '',
                        image: {
                            name: photoImage.name || `photo-${index}.jpg`,
                            type: photoImage.type || 'image/jpeg',
                            size: photoImage.size || 0,
                            data: photoImage.data
                        },
                        createdAt: new Date().toISOString()
                    });
                    savedCount++;
                } catch (pushError) {
                    console.error(`Error adding photo ${index} to array:`, pushError);
                }
            });
            
            if (savedCount === 0) {
                this.showNotification('No valid photos to save', 'error');
                return;
            }
            
            // Check data size before saving
            const photosJson = JSON.stringify(photos);
            const dataSize = new Blob([photosJson]).size;
            const dataSizeMB = (dataSize / (1024 * 1024)).toFixed(2);
            console.log(`Photo data size: ${dataSizeMB} MB`);
            
            if (dataSize > 5 * 1024 * 1024) { // Warn if over 5MB
                console.warn('Large data size detected, may cause storage issues');
            }
            
            // Try to save to localStorage with better error handling
            try {
                localStorage.setItem('esiGalleryPhotos', photosJson);
                console.log(`Saved ${photos.length} total photos to localStorage`);
            } catch (storageError) {
                console.error('localStorage.setItem failed:', storageError);
                if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
                    this.showNotification('Storage quota exceeded. Please delete some old photos or use smaller images.', 'error');
                    return;
                }
                this.showNotification('Error saving photos. Please try again.', 'error');
                return;
            }
            
            this.loadGalleryPhotos();
            form.reset();
            this.clearGalleryPreviews();
            
            // Refresh welcome page gallery with a slight delay to ensure localStorage is updated
            setTimeout(() => {
                this.refreshWelcomePageGallery();
            }, 100);
            
            this.showNotification(`Successfully added ${savedCount} photo(s)!`, 'success');
        } catch (error) {
            console.error('Error saving photos:', error);
            this.showNotification('Failed to save photos. Please try again.', 'error');
        }
    }

    handleAddVideo(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const videoData = {
            id: Date.now().toString(),
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            video: this.currentGalleryVideoData || null,
            thumbnail: this.currentGalleryThumbnailData || null,
            createdAt: new Date().toISOString()
        };
        
        if (!videoData.video) {
            this.showNotification('Please select a video to upload', 'error');
            return;
        }
        
        const videos = JSON.parse(localStorage.getItem('esiGalleryVideos') || '[]');
        videos.push(videoData);
        localStorage.setItem('esiGalleryVideos', JSON.stringify(videos));
        
        this.loadGalleryVideos();
        e.target.reset();
        this.clearGalleryPreviews();
        this.refreshWelcomePageGallery();
        
        this.showNotification('Video added successfully!', 'success');
    }

    handleAddPress(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const pressData = {
            id: Date.now().toString(),
            title: formData.get('title'),
            type: formData.get('type'),
            description: formData.get('description'),
            date: formData.get('date'),
            link: formData.get('link'),
            image: this.currentGalleryPressImageData || null,
            createdAt: new Date().toISOString()
        };
        
        const pressItems = JSON.parse(localStorage.getItem('esiGalleryPress') || '[]');
        pressItems.push(pressData);
        localStorage.setItem('esiGalleryPress', JSON.stringify(pressItems));
        
        this.loadGalleryPress();
        e.target.reset();
        this.clearGalleryPreviews();
        this.refreshWelcomePageGallery();
        
        this.showNotification('Press coverage added successfully!', 'success');
    }

    handleGalleryImageUpload(e, type) {
        console.log('handleGalleryImageUpload called with type:', type);
        const files = Array.from(e.target.files || []);
        if (!files.length) {
            console.warn('No files selected');
            return;
        }
        
        console.log(`Processing ${files.length} file(s) for type: ${type}`);
        
        if (type === 'photo') {
            if (files.length > 4) {
                this.showNotification('You can upload up to 4 photos at once', 'error');
                e.target.value = '';
                return;
            }
            
            const invalidFile = files.find(file => file.size > 5 * 1024 * 1024 || !file.type.startsWith('image/'));
            if (invalidFile) {
                this.showNotification('Each photo must be an image under 5MB', 'error');
                e.target.value = '';
                return;
            }
            
            const toDataUrl = (file) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    console.log(`Successfully read file: ${file.name}`);
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: event.target.result
                    });
                };
                reader.onerror = (error) => {
                    console.error('FileReader error:', error);
                    reject(new Error('Failed to read file'));
                };
                reader.readAsDataURL(file);
            });
            
            console.log('Starting to process files...');
            Promise.all(files.map(toDataUrl))
                .then(images => {
                    console.log(`Successfully processed ${images.length} image(s)`);
                    this.currentGalleryPhotosData = images;
                    console.log('Stored photos data:', this.currentGalleryPhotosData);
                    this.renderPhotoPreviews(images);
                    this.showNotification(`${images.length} photo(s) selected. Click "Add Photos" to upload.`, 'success');
                })
                .catch((error) => {
                    console.error('Error processing photos:', error);
                    this.showNotification('Could not process the selected photos', 'error');
                    e.target.value = '';
                });
            
            return;
        }
        
        const file = files[0];

        // Validate file size based on type
        let maxSize;
        switch (type) {
            case 'photo':
                maxSize = 5 * 1024 * 1024; // 5MB
                break;
            case 'thumbnail':
                maxSize = 2 * 1024 * 1024; // 2MB
                break;
            case 'press':
                maxSize = 3 * 1024 * 1024; // 3MB
                break;
            default:
                maxSize = 5 * 1024 * 1024; // 5MB default
        }

        if (file.size > maxSize) {
            this.showNotification(`File size must be less than ${maxSize / (1024 * 1024)}MB`, 'error');
            e.target.value = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            e.target.value = '';
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            let previewId, previewImgId;
            switch (type) {
                case 'thumbnail':
                    previewId = 'thumbnailPreview';
                    previewImgId = 'previewThumbnailImg';
                    this.currentGalleryThumbnailData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: event.target.result
                    };
                    break;
                case 'press':
                    previewId = 'pressImagePreview';
                    previewImgId = 'previewPressImg';
                    this.currentGalleryPressImageData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: event.target.result
                    };
                    break;
            }
            
            const imagePreview = document.getElementById(previewId);
            const previewImg = document.getElementById(previewImgId);
            
            if (imagePreview && previewImg) {
                previewImg.src = event.target.result;
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
    
    handleGalleryVideoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (!file.type.startsWith('video/')) {
            this.showNotification('Please select a valid video file', 'error');
            e.target.value = '';
            return;
        }
        
        if (file.size > maxSize) {
            this.showNotification('Video must be less than 50MB', 'error');
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            this.currentGalleryVideoData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: event.target.result
            };
            
            const videoPreview = document.getElementById('videoPreview');
            const videoPreviewInfo = document.getElementById('videoPreviewInfo');
            
            if (videoPreview && videoPreviewInfo) {
                const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                videoPreviewInfo.innerHTML = `<strong>${file.name}</strong> (${sizeMb} MB)`;
                videoPreview.style.display = 'block';
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    renderPhotoPreviews(images) {
        console.log('renderPhotoPreviews called with', images.length, 'images');
        const photoPreview = document.getElementById('photoPreview');
        const photoPreviewGrid = document.getElementById('photoPreviewGrid');
        
        if (!photoPreview) {
            console.error('photoPreview element not found');
            return;
        }
        
        if (!photoPreviewGrid) {
            console.error('photoPreviewGrid element not found');
            return;
        }
        
        if (images && images.length > 0) {
            photoPreviewGrid.innerHTML = images.map((image, index) => `
                <div class="preview-thumb" style="position: relative; display: inline-block; margin: 0.5rem;">
                    <img src="${image.data}" alt="${image.name}" style="max-width: 150px; max-height: 150px; border-radius: 8px; object-fit: cover;">
                    <small style="display: block; margin-top: 0.25rem; font-size: 0.75rem; color: #666;">${image.name}</small>
                </div>
            `).join('');
            
            photoPreview.style.display = 'block';
            console.log('Photo preview displayed');
        } else {
            console.warn('No images to preview');
            photoPreview.style.display = 'none';
        }
    }

    clearGalleryPreviews() {
        // Clear all gallery previews
        const previews = ['photoPreview', 'thumbnailPreview', 'pressImagePreview', 'videoPreview'];
        previews.forEach(previewId => {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.style.display = 'none';
            }
        });
        
        // Clear stored data
        this.currentGalleryPhotosData = [];
        this.currentGalleryThumbnailData = null;
        this.currentGalleryPressImageData = null;
        this.currentGalleryVideoData = null;
        
        // Clear input values
        const inputs = ['photoImage', 'videoThumbnail', 'pressImage', 'videoFile'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) input.value = '';
        });
        
        // Clear dynamic preview contents
        const photoPreviewGrid = document.getElementById('photoPreviewGrid');
        if (photoPreviewGrid) {
            photoPreviewGrid.innerHTML = '';
        }
        
        const videoPreviewInfo = document.getElementById('videoPreviewInfo');
        if (videoPreviewInfo) {
            videoPreviewInfo.textContent = '';
        }
    }

    loadGalleryPhotos() {
        const photos = JSON.parse(localStorage.getItem('esiGalleryPhotos') || '[]');
        const photosList = document.getElementById('photosList');
        
        if (photosList) {
            if (photos.length === 0) {
                photosList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-images"></i>
                        <h4>No Photos Yet</h4>
                        <p>Upload photos to display in your gallery</p>
                    </div>
                `;
            } else {
                photosList.innerHTML = photos.map(photo => `
                    <div class="gallery-item-admin">
                        <div class="gallery-item-image">
                            <img src="${photo.image.data}" alt="${photo.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2Y1ZjdmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QaG90byBFcnJvcjwvdGV4dD48L3N2Zz4='">
                        </div>
                        <div class="gallery-item-info">
                            <h4>${photo.title}</h4>
                            <p>${photo.description || 'No description'}</p>
                            <span class="category-badge">${photo.category}</span>
                        </div>
                        <div class="gallery-item-actions">
                            <button class="btn btn-danger btn-small" onclick="adminDashboard.deleteGalleryItem('photo', '${photo.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    loadGalleryVideos() {
        const videos = JSON.parse(localStorage.getItem('esiGalleryVideos') || '[]');
        const videosList = document.getElementById('videosList');
        
        if (videosList) {
            if (videos.length === 0) {
                videosList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-video"></i>
                        <h4>No Videos Yet</h4>
                        <p>Upload videos to display in your gallery</p>
                    </div>
                `;
            } else {
                videosList.innerHTML = videos.map(video => `
                    <div class="gallery-item-admin">
                        <div class="gallery-item-image">
                            ${video.thumbnail ? 
                                `<img src="${video.thumbnail.data}" alt="${video.title}">` : 
                                `<div class="video-placeholder"><i class="fas fa-video"></i></div>`
                            }
                        </div>
                        <div class="gallery-item-info">
                            <h4>${video.title}</h4>
                            <p>${video.description || 'No description'}</p>
                            <span class="category-badge">${video.category}</span>
                        </div>
                        <div class="gallery-item-actions">
                            <button class="btn btn-danger btn-small" onclick="adminDashboard.deleteGalleryItem('video', '${video.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    loadGalleryPress() {
        const pressItems = JSON.parse(localStorage.getItem('esiGalleryPress') || '[]');
        const pressList = document.getElementById('pressList');
        
        if (pressList) {
            if (pressItems.length === 0) {
                pressList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-newspaper"></i>
                        <h4>No Press Coverage Yet</h4>
                        <p>Add press coverage items to display in your gallery</p>
                    </div>
                `;
            } else {
                pressList.innerHTML = pressItems.map(press => `
                    <div class="gallery-item-admin">
                        <div class="gallery-item-image">
                            ${press.image ? 
                                `<img src="${press.image.data}" alt="${press.title}">` : 
                                `<div class="press-placeholder"><i class="fas fa-newspaper"></i></div>`
                            }
                        </div>
                        <div class="gallery-item-info">
                            <h4>${press.title}</h4>
                            <p>${press.description || 'No description'}</p>
                            <span class="category-badge">${press.type}</span>
                            ${press.date ? `<small>Date: ${press.date}</small>` : ''}
                            ${press.link ? `<small><a href="${press.link}" target="_blank">View Article</a></small>` : ''}
                        </div>
                        <div class="gallery-item-actions">
                            <button class="btn btn-danger btn-small" onclick="adminDashboard.deleteGalleryItem('press', '${press.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    loadGalleryData() {
        this.loadGalleryPhotos();
        this.loadGalleryVideos();
        this.loadGalleryPress();
    }

    deleteGalleryItem(type, id) {
        let storageKey, loadFunction;
        switch (type) {
            case 'photo':
                storageKey = 'esiGalleryPhotos';
                loadFunction = () => this.loadGalleryPhotos();
                break;
            case 'video':
                storageKey = 'esiGalleryVideos';
                loadFunction = () => this.loadGalleryVideos();
                break;
            case 'press':
                storageKey = 'esiGalleryPress';
                loadFunction = () => this.loadGalleryPress();
                break;
            default:
                return;
        }
        
        const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedItems = items.filter(item => item.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        
        loadFunction();
        this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
        
        // Trigger welcome page refresh
        this.refreshWelcomePageGallery();
    }

    attachGalleryFormListeners() {
        // Photo form
        const addPhotoForm = document.getElementById('addPhotoForm');
        if (addPhotoForm) {
            // Remove any existing listeners by cloning (clean slate)
            if (!addPhotoForm.dataset.listenerAttached) {
                console.log('Attaching photo form submit listener');
                const handleSubmit = (e) => {
                    console.log('Photo form submit event fired');
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleAddPhoto(e);
                };
                
                addPhotoForm.addEventListener('submit', handleSubmit);
                addPhotoForm.dataset.listenerAttached = 'true';
                
                // Also add direct click handler to button as backup
                const submitBtn = document.getElementById('addPhotoBtn') || addPhotoForm.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.dataset.clickHandlerAttached) {
                    console.log('Attaching direct button click handler');
                    submitBtn.addEventListener('click', (e) => {
                        console.log('Add Photo button clicked directly');
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Manually trigger form submission
                        if (addPhotoForm.checkValidity()) {
                            const formEvent = new Event('submit', { bubbles: true, cancelable: true });
                            addPhotoForm.dispatchEvent(formEvent);
                        } else {
                            addPhotoForm.reportValidity();
                        }
                    });
                    submitBtn.dataset.clickHandlerAttached = 'true';
                }
            }
        } else {
            console.warn('addPhotoForm not found when trying to attach listeners');
        }
        
        // Video form
        const addVideoForm = document.getElementById('addVideoForm');
        if (addVideoForm && !addVideoForm.dataset.listenerAttached) {
            addVideoForm.addEventListener('submit', (e) => this.handleAddVideo(e));
            addVideoForm.dataset.listenerAttached = 'true';
        }
        
        // Press form
        const addPressForm = document.getElementById('addPressForm');
        if (addPressForm && !addPressForm.dataset.listenerAttached) {
            addPressForm.addEventListener('submit', (e) => this.handleAddPress(e));
            addPressForm.dataset.listenerAttached = 'true';
        }
    }

    switchGalleryTab(e) {
        const targetTab = e.target.getAttribute('data-gallery-tab');
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.gallery-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.gallery-tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        // Show corresponding content
        const targetContent = document.getElementById(`${targetTab}-management`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    refreshWelcomePageGallery() {
        console.log('Refreshing welcome page gallery...');
        
        // Check if welcome page is open and refresh gallery
        if (window.opener && window.opener.loadGalleryData) {
            console.log('Calling loadGalleryData on opener window');
            window.opener.loadGalleryData();
        }
        
        // Also try to refresh if using localStorage events
        try {
            const timestamp = Date.now().toString();
            localStorage.setItem('esiGalleryUpdated', timestamp);
            console.log('Set esiGalleryUpdated timestamp:', timestamp);
            
            // Also trigger a storage event manually for same-window scenarios
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'esiGalleryUpdated',
                newValue: timestamp,
                oldValue: localStorage.getItem('esiGalleryUpdated'),
                storageArea: localStorage
            }));
        } catch (e) {
            console.error('Could not update localStorage timestamp:', e);
        }
        
        // If we're on the same page (admin and main site in same window), reload gallery
        // This handles the case where admin is opened in the same tab
        if (typeof loadGalleryData === 'function') {
            console.log('Calling loadGalleryData on current window');
            setTimeout(() => {
                if (typeof loadGalleryData === 'function') {
                    loadGalleryData();
                }
            }, 100);
        }
    }

    refreshWelcomePageCompetitions() {
        // Check if welcome page is open and refresh competitions
        if (window.opener && window.opener.loadCompetitionsForWelcomePage) {
            window.opener.loadCompetitionsForWelcomePage();
        }
        
        // Also try to refresh if using localStorage events
        try {
            localStorage.setItem('esiCompetitionsUpdated', Date.now().toString());
        } catch (e) {
            console.log('Could not update localStorage timestamp');
        }
    }

    toggleFeaturedCompetition(competitionId) {
        const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
        const competition = competitions.find(comp => comp.id === competitionId);
        
        if (!competition) return;
        
        // If this competition is already featured, unfeature it
        if (competition.featured) {
            competition.featured = false;
            this.showNotification('Competition unfeatured successfully!', 'info');
        } else {
            // Unfeature all other competitions first (only one can be featured)
            competitions.forEach(comp => {
                comp.featured = false;
            });
            // Feature this competition
            competition.featured = true;
            this.showNotification('Competition featured successfully! It will now appear on the home page.', 'success');
        }
        
        // Save updated competitions
        localStorage.setItem('esiCompetitions', JSON.stringify(competitions));
        
        // Refresh the competitions list
        this.loadCompetitions();
        
        // Trigger welcome page refresh
        this.refreshWelcomePageCompetitions();
    }

    // Registration management methods
    viewRegistration(id) {
        const registration = this.filteredRegistrations.find(r => r.id === id);
        if (!registration) return;
        
        const details = document.getElementById('registrationDetails');
        details.innerHTML = `
            <div class="registration-detail-grid">
                <div class="detail-item">
                    <label>Participant Name:</label>
                    <span>${registration.participantName}</span>
                </div>
                <div class="detail-item">
                    <label>School:</label>
                    <span>${registration.schoolName} (${registration.schoolType || 'N/A'})</span>
                </div>
                <div class="detail-item">
                    <label>Class/Year:</label>
                    <span>${registration.participantClass}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${registration.email}</span>
                </div>
                <div class="detail-item">
                    <label>Phone:</label>
                    <span>${registration.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>Category:</label>
                    <span>${this.formatCategory(registration.competitionCategory)}</span>
                </div>
                <div class="detail-item">
                    <label>Team Members:</label>
                    <span>${registration.teamMembers || 'N/A'}</span>
                </div>
                <div class="detail-item full-width">
                    <label>Motivation:</label>
                    <p>${registration.motivation}</p>
                </div>
            </div>
        `;
        
        this.openModal('registrationModal');
    }

    approveRegistration(id) {
        const registration = this.filteredRegistrations.find(r => r.id === id);
        if (!registration) return;
        
        registration.status = 'approved';
        this.updateRegistrationInStorage(registration);
        this.loadRegistrations();
        this.updateDashboardStats();
        
        this.showNotification('Registration approved successfully!', 'success');
    }

    rejectRegistration(id) {
        const registration = this.filteredRegistrations.find(r => r.id === id);
        if (!registration) return;
        
        registration.status = 'rejected';
        this.updateRegistrationInStorage(registration);
        this.loadRegistrations();
        this.updateDashboardStats();
        
        this.showNotification('Registration rejected successfully!', 'success');
    }

    editRegistration(id) {
        // Implementation for editing registration
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    updateRegistrationInStorage(updatedRegistration) {
        const registrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
        const index = registrations.findIndex(r => 
            r.participantName === updatedRegistration.participantName &&
            r.email === updatedRegistration.email &&
            r.timestamp === updatedRegistration.timestamp
        );
        
        if (index !== -1) {
            registrations[index] = { ...registrations[index], status: updatedRegistration.status };
            localStorage.setItem('esiRegistrations', JSON.stringify(registrations));
        }
    }

    // Message management methods
    viewMessage(id) {
        const message = this.filteredMessages.find(m => m.id === id);
        if (!message) return;
        
        const details = document.getElementById('messageDetails');
        details.innerHTML = `
            <div class="message-detail-grid">
                <div class="detail-item">
                    <label>From:</label>
                    <span>${message.name} (${message.email})</span>
                </div>
                <div class="detail-item">
                    <label>Subject:</label>
                    <span>${message.subject}</span>
                </div>
                <div class="detail-item">
                    <label>Date:</label>
                    <span>${message.date}</span>
                </div>
                <div class="detail-item full-width">
                    <label>Message:</label>
                    <p>${message.message}</p>
                </div>
            </div>
        `;
        
        // Mark as read
        if (!message.read) {
            this.markMessageAsRead(id);
        }
        
        this.openModal('messageModal');
    }

    replyToMessage(id) {
        const message = this.filteredMessages.find(m => m.id === id);
        if (!message) return;
        
        document.getElementById('replySubject').value = `Re: ${message.subject}`;
        this.currentReplyMessageId = id;
        this.openModal('replyModal');
    }

    handleReply(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const reply = {
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };
        
        // In a real app, this would send an email
        console.log('Reply sent:', reply);
        
        // Mark message as replied
        if (this.currentReplyMessageId) {
            this.markMessageAsReplied(this.currentReplyMessageId);
        }
        
        this.closeModal('replyModal');
        this.showNotification('Reply sent successfully!', 'success');
        e.target.reset();
    }

    markMessageAsRead(id) {
        const message = this.filteredMessages.find(m => m.id === id);
        if (!message) return;
        
        message.read = true;
        this.updateMessageInStorage(message);
        this.loadMessages();
        this.updateDashboardStats();
    }

    markMessageAsReplied(id) {
        const message = this.filteredMessages.find(m => m.id === id);
        if (!message) return;
        
        message.replied = true;
        this.updateMessageInStorage(message);
        this.loadMessages();
    }

    updateMessageInStorage(updatedMessage) {
        const messages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
        const index = messages.findIndex(m => 
            m.name === updatedMessage.name &&
            m.email === updatedMessage.email &&
            m.timestamp === updatedMessage.timestamp
        );
        
        if (index !== -1) {
            messages[index] = { ...messages[index], ...updatedMessage };
            localStorage.setItem('esiContactMessages', JSON.stringify(messages));
        }
    }

    deleteMessage(id) {
        const message = this.filteredMessages.find(m => m.id === id);
        if (!message) return;
        
        if (confirm('Are you sure you want to delete this message?')) {
            this.filteredMessages = this.filteredMessages.filter(m => m.id !== id);
            this.removeMessageFromStorage(message);
            this.displayMessages();
            this.updateDashboardStats();
            
            this.showNotification('Message deleted successfully!', 'success');
        }
    }

    removeMessageFromStorage(messageToDelete) {
        const messages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
        const filteredMessages = messages.filter(m => 
            !(m.name === messageToDelete.name &&
              m.email === messageToDelete.email &&
              m.timestamp === messageToDelete.timestamp)
        );
        localStorage.setItem('esiContactMessages', JSON.stringify(filteredMessages));
    }

    // Competition management methods
    editCompetition(id) {
        // Implementation for editing competition
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    deleteCompetition(id) {
        if (confirm('Are you sure you want to delete this competition?')) {
            const competitions = JSON.parse(localStorage.getItem('esiCompetitions') || '[]');
            const filteredCompetitions = competitions.filter(c => c.id !== id);
            localStorage.setItem('esiCompetitions', JSON.stringify(filteredCompetitions));
            
            this.loadCompetitions();
            this.showNotification('Competition deleted successfully!', 'success');
        }
    }

    // Modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    openReplyModal() {
        this.closeModal('messageModal');
        this.openModal('replyModal');
    }

    closeReplyModal() {
        this.closeModal('replyModal');
    }

    // Quick actions
    exportRegistrations() {
        const registrations = this.filteredRegistrations;
        const csvContent = this.convertToCSV(registrations);
        this.downloadCSV(csvContent, 'esi-registrations.csv');
        
        this.showNotification('Registrations exported successfully!', 'success');
    }

    convertToCSV(data) {
        const headers = ['ID', 'Participant', 'School', 'Category', 'Email', 'Status', 'Registration Date'];
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = [
                row.id,
                `"${row.participantName}"`,
                `"${row.schoolName}"`,
                this.formatCategory(row.competitionCategory),
                row.email,
                row.status,
                row.registrationDate
            ];
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    sendBulkEmail() {
        this.showNotification('Bulk email functionality coming soon!', 'info');
    }

    generateReport() {
        this.showNotification('Report generation coming soon!', 'info');
    }

    manageEvent() {
        this.showNotification('Event settings coming soon!', 'info');
    }

    // Utility methods
    showNotification(message, type = 'info') {
        // Remove any existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    logout(reason = 'User logged out') {
        // Clear session timeout
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
            this.sessionTimeoutId = null;
        }
        
        // Clear session data
        localStorage.removeItem('esiAdminSession');
        
        // Log the activity
        this.logActivity('LOGOUT', this.currentUser, reason);
        
        // Prevent multiple redirects
        if (window.location.pathname.includes('admin.html')) {
            window.location.replace('admin-login.html');
        }
    }

    logActivity(action, username, details = '') {
        const logEntry = {
            action: action,
            username: username,
            details: details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        const logs = JSON.parse(localStorage.getItem('esiAdminLogs') || '[]');
        logs.push(logEntry);
        
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('esiAdminLogs', JSON.stringify(logs));
    }

    loadActivitiesContent() {
        const activitiesData = JSON.parse(localStorage.getItem('esiActivities') || '{}');
        
        // Load background content
        if (activitiesData.background) {
            document.getElementById('backgroundContent').value = activitiesData.background;
        }
        
        // Load objectives
        if (activitiesData.objectives) {
            this.loadObjectives(activitiesData.objectives);
        } else {
            this.loadDefaultObjectives();
        }
        
        // Load rules
        if (activitiesData.rules) {
            if (activitiesData.rules.debate) {
                document.getElementById('debateRules').value = activitiesData.rules.debate.join('\n');
            }
            if (activitiesData.rules.poetry) {
                document.getElementById('poetryRules').value = activitiesData.rules.poetry.join('\n');
            }
            if (activitiesData.rules.speech) {
                document.getElementById('speechRules').value = activitiesData.rules.speech.join('\n');
            }
        } else {
            this.loadDefaultRules();
        }
        
        // Load schedule
        if (activitiesData.schedule) {
            this.loadSchedule(activitiesData.schedule);
        } else {
            this.loadDefaultSchedule();
        }
    }

    loadDefaultObjectives() {
        const defaultObjectives = [
            'Promote awareness of gender equality issues',
            'Encourage critical thinking and public speaking skills',
            'Foster dialogue between students from different backgrounds',
            'Highlight the role of education in achieving gender equality'
        ];
        this.loadObjectives(defaultObjectives);
    }

    loadObjectives(objectives) {
        const container = document.getElementById('objectivesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        objectives.forEach((objective, index) => {
            const objectiveDiv = document.createElement('div');
            objectiveDiv.className = 'objective-item';
            objectiveDiv.innerHTML = `
                <input type="text" value="${objective}" class="objective-input" data-index="${index}">
                <button class="btn btn-danger btn-small" onclick="removeObjective(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(objectiveDiv);
        });
    }

    loadDefaultRules() {
        const defaultDebateRules = `Team format: 3 students per team
Time limit: 15 minutes per team
Topics announced 1 week before
Judged on argument strength, delivery, and teamwork`;
        
        const defaultPoetryRules = `Individual participation
Original work required
Time limit: 5 minutes
Judged on creativity, message, and performance`;
        
        const defaultSpeechRules = `Individual participation
Time limit: 8 minutes
Topics provided in advance
Judged on content, delivery, and impact`;
        
        document.getElementById('debateRules').value = defaultDebateRules;
        document.getElementById('poetryRules').value = defaultPoetryRules;
        document.getElementById('speechRules').value = defaultSpeechRules;
    }

    loadDefaultSchedule() {
        const defaultSchedule = [
            { time: '8:00 AM', event: 'Registration & Welcome' },
            { time: '9:00 AM', event: 'Opening Ceremony' },
            { time: '10:00 AM', event: 'Competition Rounds Begin' },
            { time: '2:00 PM', event: 'Lunch Break' },
            { time: '3:00 PM', event: 'Final Rounds' },
            { time: '5:00 PM', event: 'Awards Ceremony' }
        ];
        this.loadSchedule(defaultSchedule);
    }

    loadSchedule(schedule) {
        const container = document.getElementById('scheduleContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        schedule.forEach((item, index) => {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.className = 'schedule-item';
            scheduleDiv.innerHTML = `
                <div class="schedule-time">
                    <input type="text" value="${item.time}" class="time-input" data-index="${index}">
                </div>
                <div class="schedule-event">
                    <input type="text" value="${item.event}" class="event-input" data-index="${index}">
                </div>
                <button class="btn btn-danger btn-small" onclick="removeScheduleItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(scheduleDiv);
        });
    }

    loadHomeContent() {
        const homeData = JSON.parse(localStorage.getItem('esiHomeContent') || '{}');
        
        // Load basic info
        if (homeData.heroBadge) {
            document.getElementById('heroBadge').value = homeData.heroBadge;
        }
        if (homeData.heroTitle) {
            document.getElementById('heroTitle').value = homeData.heroTitle;
        }
        if (homeData.heroSubtitle) {
            document.getElementById('heroSubtitle').value = homeData.heroSubtitle;
        }
        if (homeData.eventDate) {
            document.getElementById('eventDate').value = homeData.eventDate;
        }
        if (homeData.eventVenue) {
            document.getElementById('eventVenue').value = homeData.eventVenue;
        }
        if (homeData.eventAudience) {
            document.getElementById('eventAudience').value = homeData.eventAudience;
        }
        
        // Load countdown settings
        if (homeData.countdownDate) {
            document.getElementById('countdownDate').value = homeData.countdownDate;
        }
        if (homeData.countdownTime) {
            document.getElementById('countdownTime').value = homeData.countdownTime;
        }
        if (homeData.countdownMessage) {
            document.getElementById('countdownMessage').value = homeData.countdownMessage;
        }
        
        // Load default values if no custom content
        if (!homeData.heroBadge) {
            document.getElementById('heroBadge').value = 'ESI 2025';
        }
        if (!homeData.heroTitle) {
            document.getElementById('heroTitle').value = 'Equality Beyond Gender Roles';
        }
        if (!homeData.heroSubtitle) {
            document.getElementById('heroSubtitle').value = 'A Gender Equality Debate, Poetry, and Public Speech Competition';
        }
        if (!homeData.eventDate) {
            document.getElementById('eventDate').value = '2025-09-21';
        }
        if (!homeData.eventVenue) {
            document.getElementById('eventVenue').value = 'Mbogo Mixed Secondary School';
        }
        if (!homeData.eventAudience) {
            document.getElementById('eventAudience').value = 'Open to All Schools';
        }
        if (!homeData.countdownDate) {
            document.getElementById('countdownDate').value = '2025-09-21T00:00';
        }
        if (!homeData.countdownTime) {
            document.getElementById('countdownTime').value = '00:00';
        }
        if (!homeData.countdownMessage) {
            document.getElementById('countdownMessage').value = 'Date has arrived!';
        }
        
        // Update preview
        this.updatePreview();
    }

    updatePreview() {
        // Update basic info preview
        document.getElementById('previewBadge').textContent = document.getElementById('heroBadge').value || 'ESI 2025';
        document.getElementById('previewTitle').textContent = document.getElementById('heroTitle').value || 'Equality Beyond Gender Roles';
        document.getElementById('previewSubtitle').textContent = document.getElementById('heroSubtitle').value || 'A Gender Equality Debate, Poetry, and Public Speech Competition';
        
        const eventDate = document.getElementById('eventDate').value;
        document.getElementById('previewDate').textContent = eventDate ? new Date(eventDate).toLocaleDateString() : 'Select event date';
        document.getElementById('previewVenue').textContent = document.getElementById('eventVenue').value || 'Mbogo Mixed Secondary School';
        document.getElementById('previewAudience').textContent = document.getElementById('eventAudience').value || 'Open to All Schools';
        
        // Update countdown preview
        this.updateCountdownPreview();
    }

    updateCountdownPreview() {
        const countdownDate = document.getElementById('countdownDate').value;
        const countdownTime = document.getElementById('countdownTime').value;
        
        if (!countdownDate) return;
        
        const targetDateTime = new Date(`${countdownDate}T${countdownTime || '00:00'}`).getTime();
        const now = new Date().getTime();
        const distance = targetDateTime - now;
        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('previewDays').textContent = days.toString().padStart(2, '0');
            document.getElementById('previewHours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('previewMinutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('previewSeconds').textContent = seconds.toString().padStart(2, '0');
            
            document.getElementById('previewCountdownDays').textContent = days.toString().padStart(2, '0');
            document.getElementById('previewCountdownHours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('previewCountdownMinutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('previewCountdownSeconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            const message = document.getElementById('countdownMessage').value || 'Date has arrived!';
            const previewCountdownTimer = document.getElementById('previewCountdownTimer');
            if (previewCountdownTimer) {
                previewCountdownTimer.innerHTML = `<div class="event-passed">${message}</div>`;
            }
            
            document.getElementById('previewDays').textContent = '00';
            document.getElementById('previewHours').textContent = '00';
            document.getElementById('previewMinutes').textContent = '00';
            document.getElementById('previewSeconds').textContent = '00';
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for onclick handlers
function logout() {
    // Prevent multiple logout calls
    if (window.adminDashboard && !window.isLoggingOut) {
        window.isLoggingOut = true;
        adminDashboard.logout();
    }
}

function filterRegistrations() {
    if (window.adminDashboard) {
        adminDashboard.filterRegistrations();
    }
}

function searchRegistrations() {
    if (window.adminDashboard) {
        adminDashboard.searchRegistrations();
    }
}

function changePage(direction) {
    if (window.adminDashboard) {
        adminDashboard.changePage(direction);
    }
}

function filterMessages() {
    if (window.adminDashboard) {
        adminDashboard.filterMessages();
    }
}

function searchMessages() {
    if (window.adminDashboard) {
        adminDashboard.searchMessages();
    }
}

function exportRegistrations() {
    if (window.adminDashboard) {
        adminDashboard.exportRegistrations();
    }
}

function sendBulkEmail() {
    if (window.adminDashboard) {
        adminDashboard.sendBulkEmail();
    }
}

function generateReport() {
    if (window.adminDashboard) {
        adminDashboard.generateReport();
    }
}

function removeImage() {
    if (window.adminDashboard) {
        adminDashboard.clearFilePreviews();
    }
}

function removeFile() {
    if (window.adminDashboard) {
        adminDashboard.clearFilePreviews();
    }
}

function manageEvent() {
    if (window.adminDashboard) {
        adminDashboard.manageEvent();
    }
}

// Gallery management global functions
function removePhotoPreview() {
    if (window.adminDashboard) {
        window.adminDashboard.clearGalleryPreviews();
    }
}

function removeThumbnailPreview() {
    if (window.adminDashboard) {
        window.adminDashboard.clearGalleryPreviews();
    }
}

function removeVideoPreview() {
    if (window.adminDashboard) {
        window.adminDashboard.clearGalleryPreviews();
    }
}

function removePressImagePreview() {
    if (window.adminDashboard) {
        window.adminDashboard.clearGalleryPreviews();
    }
}

// Activities Management Functions
function switchActivitiesTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding content
    const targetContent = document.getElementById(`${tabName}-tab`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

function addObjective() {
    const container = document.getElementById('objectivesContainer');
    if (!container) return;
    
    const index = container.children.length;
    const objectiveDiv = document.createElement('div');
    objectiveDiv.className = 'objective-item';
    objectiveDiv.innerHTML = `
        <input type="text" placeholder="Enter new objective..." class="objective-input" data-index="${index}">
        <button class="btn btn-danger btn-small" onclick="removeObjective(${index})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(objectiveDiv);
}

function removeObjective(index) {
    const container = document.getElementById('objectivesContainer');
    if (!container) return;
    
    const items = container.querySelectorAll('.objective-item');
    if (items[index]) {
        items[index].remove();
    }
}

function addScheduleItem() {
    const container = document.getElementById('scheduleContainer');
    if (!container) return;
    
    const index = container.children.length;
    const scheduleDiv = document.createElement('div');
    scheduleDiv.className = 'schedule-item';
    scheduleDiv.innerHTML = `
        <div class="schedule-time">
            <input type="text" placeholder="Time (e.g., 8:00 AM)" class="time-input" data-index="${index}">
        </div>
        <div class="schedule-event">
            <input type="text" placeholder="Event description" class="event-input" data-index="${index}">
        </div>
        <button class="btn btn-danger btn-small" onclick="removeScheduleItem(${index})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(scheduleDiv);
}

function removeScheduleItem(index) {
    const container = document.getElementById('scheduleContainer');
    if (!container) return;
    
    const items = container.querySelectorAll('.schedule-item');
    if (items[index]) {
        items[index].remove();
    }
}

function saveActivitiesContent(type) {
    if (!window.adminDashboard) return;
    
    const activitiesData = JSON.parse(localStorage.getItem('esiActivities') || '{}');
    
    switch(type) {
        case 'background':
            activitiesData.background = document.getElementById('backgroundContent').value;
            break;
        case 'objectives':
            const objectives = Array.from(document.querySelectorAll('.objective-input'))
                .map(input => input.value.trim())
                .filter(value => value.length > 0);
            activitiesData.objectives = objectives;
            break;
        case 'rules':
            activitiesData.rules = {
                debate: document.getElementById('debateRules').value.split('\n').filter(line => line.trim()),
                poetry: document.getElementById('poetryRules').value.split('\n').filter(line => line.trim()),
                speech: document.getElementById('speechRules').value.split('\n').filter(line => line.trim())
            };
            break;
        case 'schedule':
            const scheduleItems = Array.from(document.querySelectorAll('.schedule-item')).map(item => ({
                time: item.querySelector('.time-input').value.trim(),
                event: item.querySelector('.event-input').value.trim()
            })).filter(item => item.time && item.event);
            activitiesData.schedule = scheduleItems;
            break;
    }
    
    localStorage.setItem('esiActivities', JSON.stringify(activitiesData));
    
    // Show success notification
    window.adminDashboard.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`, 'success');
    
    // Trigger welcome page refresh
    try {
        localStorage.setItem('esiActivitiesUpdated', Date.now().toString());
    } catch (e) {
        console.log('Could not update localStorage timestamp');
    }
}

function previewActivities() {
    const activitiesData = JSON.parse(localStorage.getItem('esiActivities') || '{}');
    console.log('Current Activities Data:', activitiesData);
    
    if (window.adminDashboard) {
        window.adminDashboard.showNotification('Check console for preview data', 'info');
    }
}

// Home Section Management Functions
function switchHomeTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Show corresponding content
    const targetContent = document.getElementById(`${tabName}-tab`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

function saveHomeContent(type) {
    if (!window.adminDashboard) return;
    
    const homeData = JSON.parse(localStorage.getItem('esiHomeContent') || '{}');
    
    switch(type) {
        case 'basic':
            homeData.heroBadge = document.getElementById('heroBadge').value;
            homeData.heroTitle = document.getElementById('heroTitle').value;
            homeData.heroSubtitle = document.getElementById('heroSubtitle').value;
            homeData.eventDate = document.getElementById('eventDate').value;
            homeData.eventVenue = document.getElementById('eventVenue').value;
            homeData.eventAudience = document.getElementById('eventAudience').value;
            break;
        case 'countdown':
            homeData.countdownDate = document.getElementById('countdownDate').value;
            homeData.countdownTime = document.getElementById('countdownTime').value;
            homeData.countdownMessage = document.getElementById('countdownMessage').value;
            break;
    }
    
    localStorage.setItem('esiHomeContent', JSON.stringify(homeData));
    
    // Show success notification
    window.adminDashboard.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`, 'success');
    
    // Trigger welcome page refresh
    try {
        localStorage.setItem('esiHomeContentUpdated', Date.now().toString());
    } catch (e) {
        console.log('Could not update localStorage timestamp');
    }
    
    // Update preview
    if (window.adminDashboard) {
        window.adminDashboard.updatePreview();
    }
}

function updatePreview() {
    if (window.adminDashboard) {
        window.adminDashboard.updatePreview();
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the admin page
    if (window.location.pathname.includes('admin.html') || window.location.href.includes('admin.html')) {
        console.log('Initializing AdminDashboard...');
        window.adminDashboard = new AdminDashboard();
        
        // Ensure registrations and messages are loaded after a short delay to ensure DOM is fully ready
        setTimeout(() => {
            if (window.adminDashboard) {
                console.log('Reloading registrations and messages to ensure display...');
                window.adminDashboard.loadRegistrations();
                window.adminDashboard.loadMessages();
            }
        }, 200);
    }
});

console.log('ESI Admin Dashboard System loaded successfully!');