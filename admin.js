// ESI Admin Dashboard System

class AdminDashboard {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredRegistrations = [];
        this.filteredMessages = [];
        this.currentUser = null;
        this.sessionTimeoutId = null;
        
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
        const addPhotoForm = document.getElementById('addPhotoForm');
        if (addPhotoForm) {
            addPhotoForm.addEventListener('submit', (e) => this.handleAddPhoto(e));
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
            btn.addEventListener('click', (e) => this.switchGalleryTab(e));
        });

        // Handle page unload to clean up timeouts
        window.addEventListener('beforeunload', () => {
            if (this.sessionTimeoutId) {
                clearTimeout(this.sessionTimeoutId);
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
        this.loadGalleryData();
    }

    updateDashboardStats() {
        const registrations = JSON.parse(localStorage.getItem('esiRegistrations') || '[]');
        const messages = JSON.parse(localStorage.getItem('esiContactMessages') || '[]');
        
        // Total registrations
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
        this.filteredRegistrations = registrations.map((reg, index) => ({
            ...reg,
            id: index + 1,
            status: reg.status || 'pending',
            registrationDate: reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A'
        }));
        
        this.displayRegistrations();
        this.populateSchoolFilter();
    }

    displayRegistrations() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageRegistrations = this.filteredRegistrations.slice(startIndex, endIndex);
        
        const tbody = document.getElementById('registrationsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = pageRegistrations.map(reg => `
            <tr>
                <td>${reg.id}</td>
                <td>${reg.participantName}</td>
                <td>${reg.schoolName}</td>
                <td>${this.formatCategory(reg.competitionCategory)}</td>
                <td>${reg.email}</td>
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
        this.filteredMessages = messages.map((msg, index) => ({
            ...msg,
            id: index + 1,
            read: msg.read || false,
            replied: msg.replied || false,
            date: msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : 'N/A'
        }));
        
        this.displayMessages();
    }

    displayMessages() {
        const messagesList = document.getElementById('messagesList');
        if (!messagesList) return;
        
        messagesList.innerHTML = this.filteredMessages.map(msg => `
            <div class="message-item ${msg.read ? 'read' : 'unread'} ${msg.replied ? 'replied' : ''}">
                <div class="message-header">
                    <h4>${msg.subject}</h4>
                    <div class="message-meta">
                        <span class="sender">${msg.name}</span>
                        <span class="email">${msg.email}</span>
                        <span class="date">${msg.date}</span>
                        <span class="status-badge status-${msg.read ? 'read' : 'unread'}">
                            ${msg.read ? 'Read' : 'Unread'}
                        </span>
                    </div>
                </div>
                <div class="message-content">
                    <p>${msg.message.substring(0, 150)}${msg.message.length > 150 ? '...' : ''}</p>
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
        
        const formData = new FormData(e.target);
        const photoData = {
            id: Date.now().toString(),
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            image: this.currentGalleryImageData || null,
            createdAt: new Date().toISOString()
        };
        
        if (!photoData.image) {
            this.showNotification('Please select a photo to upload', 'error');
            return;
        }
        
        const photos = JSON.parse(localStorage.getItem('esiGalleryPhotos') || '[]');
        photos.push(photoData);
        localStorage.setItem('esiGalleryPhotos', JSON.stringify(photos));
        
        this.loadGalleryPhotos();
        e.target.reset();
        this.clearGalleryPreviews();
        
        this.showNotification('Photo added successfully!', 'success');
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
        
        this.showNotification('Press coverage added successfully!', 'success');
    }

    handleGalleryImageUpload(e, type) {
        const file = e.target.files[0];
        if (!file) return;

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
                case 'photo':
                    previewId = 'photoPreview';
                    previewImgId = 'previewPhotoImg';
                    this.currentGalleryImageData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: event.target.result
                    };
                    break;
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

    clearGalleryPreviews() {
        // Clear all gallery previews
        const previews = ['photoPreview', 'thumbnailPreview', 'pressImagePreview'];
        previews.forEach(previewId => {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.style.display = 'none';
            }
        });
        
        // Clear stored data
        this.currentGalleryImageData = null;
        this.currentGalleryThumbnailData = null;
        this.currentGalleryPressImageData = null;
        
        // Clear input values
        const inputs = ['photoImage', 'videoThumbnail', 'pressImage'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) input.value = '';
        });
    }

    loadGalleryPhotos() {
        const photos = JSON.parse(localStorage.getItem('esiGalleryPhotos') || '[]');
        const photosList = document.getElementById('photosList');
        
        if (photosList) {
            photosList.innerHTML = photos.map(photo => `
                <div class="gallery-item-admin">
                    <div class="gallery-item-image">
                        <img src="${photo.image.data}" alt="${photo.title}">
                    </div>
                    <div class="gallery-item-info">
                        <h4>${photo.title}</h4>
                        <p>${photo.description || 'No description'}</p>
                        <span class="category-badge">${photo.category}</span>
                    </div>
                    <div class="gallery-item-actions">
                        <button class="btn-small btn-danger" onclick="adminDashboard.deleteGalleryItem('photo', '${photo.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    loadGalleryVideos() {
        const videos = JSON.parse(localStorage.getItem('esiGalleryVideos') || '[]');
        const videosList = document.getElementById('videosList');
        
        if (videosList) {
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
                        <button class="btn-small btn-danger" onclick="adminDashboard.deleteGalleryItem('video', '${video.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    loadGalleryPress() {
        const pressItems = JSON.parse(localStorage.getItem('esiGalleryPress') || '[]');
        const pressList = document.getElementById('pressList');
        
        if (pressList) {
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
                        <button class="btn-small btn-danger" onclick="adminDashboard.deleteGalleryItem('press', '${press.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
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
        }
        
        const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedItems = items.filter(item => item.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        
        loadFunction();
        this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
        
        // Trigger welcome page refresh
        this.refreshWelcomePageGallery();
    }

    refreshWelcomePageGallery() {
        // Check if welcome page is open and refresh gallery
        if (window.opener && window.opener.loadGalleryData) {
            window.opener.loadGalleryData();
        }
        
        // Also try to refresh if using localStorage events
        try {
            localStorage.setItem('esiGalleryUpdated', Date.now().toString());
        } catch (e) {
            console.log('Could not update localStorage timestamp');
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

    loadGalleryData() {
        this.loadGalleryPhotos();
        this.loadGalleryVideos();
        this.loadGalleryPress();
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
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        notification.style.background = colors[type] || colors.info;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
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

function removePressImagePreview() {
    if (window.adminDashboard) {
        window.adminDashboard.clearGalleryPreviews();
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the admin page
    if (window.location.pathname.includes('admin.html')) {
        window.adminDashboard = new AdminDashboard();
    }
});

console.log('ESI Admin Dashboard System loaded successfully!'); 
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

function loadActivitiesContent() {
    const activitiesData = JSON.parse(localStorage.getItem('esiActivities') || '{}');
    
    // Load background content
    if (activitiesData.background) {
        document.getElementById('backgroundContent').value = activitiesData.background;
    }
    
    // Load objectives
    if (activitiesData.objectives) {
        loadObjectives(activitiesData.objectives);
    } else {
        loadDefaultObjectives();
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
        loadDefaultRules();
    }
    
    // Load schedule
    if (activitiesData.schedule) {
        loadSchedule(activitiesData.schedule);
    } else {
        loadDefaultSchedule();
    }
}

function loadDefaultObjectives() {
    const defaultObjectives = [
        'Promote awareness of gender equality issues',
        'Encourage critical thinking and public speaking skills',
        'Foster dialogue between students from different backgrounds',
        'Highlight the role of education in achieving gender equality'
    ];
    loadObjectives(defaultObjectives);
}

function loadObjectives(objectives) {
    const container = document.getElementById('objectivesContainer');
    container.innerHTML = '';
    
    objectives.forEach((objective, index) => {
        const objectiveDiv = document.createElement('div');
        objectiveDiv.className = 'objective-item';
        objectiveDiv.innerHTML = `
            <input type="text" value="${objective}" class="objective-input" data-index="${index}">
            <button class="btn-danger btn-small" onclick="removeObjective(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(objectiveDiv);
    });
}

function addObjective() {
    const container = document.getElementById('objectivesContainer');
    const index = container.children.length;
    const objectiveDiv = document.createElement('div');
    objectiveDiv.className = 'objective-item';
    objectiveDiv.innerHTML = `
        <input type="text" placeholder="Enter new objective..." class="objective-input" data-index="${index}">
        <button class="btn-danger btn-small" onclick="removeObjective(${index})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(objectiveDiv);
}

function removeObjective(index) {
    const container = document.getElementById('objectivesContainer');
    const items = container.querySelectorAll('.objective-item');
    if (items[index]) {
        items[index].remove();
    }
}

function loadDefaultRules() {
    document.getElementById('debateRules').value = `Team format: 3 students per team
Time limit: 15 minutes per team
Topics announced 1 week before
Judged on argument strength, delivery, and teamwork`;
    
    document.getElementById('poetryRules').value = `Individual participation
Original work required
Time limit: 5 minutes
Judged on creativity, message, and performance`;
    
    document.getElementById('speechRules').value = `Individual participation
Time limit: 8 minutes
Topics provided in advance
Judged on content, delivery, and impact`;
}

function loadDefaultSchedule() {
    const defaultSchedule = [
        { time: '8:00 AM', event: 'Registration & Welcome' },
        { time: '9:00 AM', event: 'Opening Ceremony' },
        { time: '10:00 AM', event: 'Competition Rounds Begin' },
        { time: '2:00 PM', event: 'Lunch Break' },
        { time: '3:00 PM', event: 'Final Rounds' },
        { time: '5:00 PM', event: 'Awards Ceremony' }
    ];
    loadSchedule(defaultSchedule);
}

function loadSchedule(schedule) {
    const container = document.getElementById('scheduleContainer');
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
            <button class="btn-danger btn-small" onclick="removeScheduleItem(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(scheduleDiv);
    });
}

function addScheduleItem() {
    const container = document.getElementById('scheduleContainer');
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
        <button class="btn-danger btn-small" onclick="removeScheduleItem(${index})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(scheduleDiv);
}

function removeScheduleItem(index) {
    const container = document.getElementById('scheduleContainer');
    const items = container.querySelectorAll('.schedule-item');
    if (items[index]) {
        items[index].remove();
    }
}

function saveActivitiesContent(type) {
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
    if (window.adminDashboard) {
        adminDashboard.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`, 'success');
    }
    
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
        adminDashboard.showNotification('Check console for preview data', 'info');
    }
}

// Initialize Activities management when admin dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    // Load activities content if we're on the admin page
    if (window.location.pathname.includes('admin.html')) {
        setTimeout(() => {
            loadActivitiesContent();
        }, 1000);
    }
});


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

function loadHomeContent() {
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
        document.getElementById('eventDate').value = '21st September 2025';
    }
    if (!homeData.eventVenue) {
        document.getElementById('eventVenue').value = 'Mbogo Mixed Secondary School';
    }
    if (!homeData.eventAudience) {
        document.getElementById('eventAudience').value = 'Open to All Schools';
    }
    if (!homeData.countdownDate) {
        document.getElementById('countdownDate').value = '2025-09-21';
    }
    if (!homeData.countdownTime) {
        document.getElementById('countdownTime').value = '09:00';
    }
    if (!homeData.countdownMessage) {
        document.getElementById('countdownMessage').value = 'Event Day Has Arrived!';
    }
    
    // Update preview
    updatePreview();
}

function saveHomeContent(type) {
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
    if (window.adminDashboard) {
        adminDashboard.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`, 'success');
    }
    
    // Trigger welcome page refresh
    try {
        localStorage.setItem('esiHomeContentUpdated', Date.now().toString());
    } catch (e) {
        console.log('Could not update localStorage timestamp');
    }
    
    // Update preview
    updatePreview();
}

function updatePreview() {
    // Update basic info preview
    document.getElementById('previewBadge').textContent = document.getElementById('heroBadge').value || 'ESI 2025';
    document.getElementById('previewTitle').textContent = document.getElementById('heroTitle').value || 'Equality Beyond Gender Roles';
    document.getElementById('previewSubtitle').textContent = document.getElementById('heroSubtitle').value || 'A Gender Equality Debate, Poetry, and Public Speech Competition';
    document.getElementById('previewDate').textContent = document.getElementById('eventDate').value || '21st September 2025';
    document.getElementById('previewVenue').textContent = document.getElementById('eventVenue').value || 'Mbogo Mixed Secondary School';
    document.getElementById('previewAudience').textContent = document.getElementById('eventAudience').value || 'Open to All Schools';
    
    // Update countdown preview
    updateCountdownPreview();
}

function updateCountdownPreview() {
    const countdownDate = document.getElementById('countdownDate').value;
    const countdownTime = document.getElementById('countdownTime').value;
    
    if (countdownDate && countdownTime) {
        const targetDateTime = new Date(`${countdownDate}T${countdownTime}`).getTime();
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
            const message = document.getElementById('countdownMessage').value || 'Event Day Has Arrived!';
            document.getElementById('previewDays').textContent = '00';
            document.getElementById('previewHours').textContent = '00';
            document.getElementById('previewMinutes').textContent = '00';
            document.getElementById('previewSeconds').textContent = '00';
            
            document.getElementById('previewCountdownDays').textContent = '00';
            document.getElementById('previewCountdownHours').textContent = '00';
            document.getElementById('previewCountdownMinutes').textContent = '00';
            document.getElementById('previewCountdownSeconds').textContent = '00';
        }
    }
}

// Initialize Home Section management when admin dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    // Load home content if we're on the admin page
    if (window.location.pathname.includes('admin.html')) {
        setTimeout(() => {
            loadHomeContent();
        }, 1000);
    }
});

