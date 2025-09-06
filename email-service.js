// Email Service for MARTIN Website
// This is a demonstration file showing how email notifications would be implemented
// In production, you would need a backend server to handle actual email sending

class EmailService {
    constructor() {
        this.adminEmail = 'nankundlilian5@gmail.com';
        this.companyName = 'MARTIN';
        this.baseUrl = window.location.origin;
    }

    // Send contact form notification
    async sendContactNotification(contactData) {
        const emailData = {
            to: this.adminEmail,
            subject: `New Contact Message: ${contactData.subject}`,
            body: this.formatContactEmail(contactData),
            from: contactData.email,
            replyTo: contactData.email
        };

        try {
            // In a real application, this would send to your server
            console.log('Sending contact notification:', emailData);
            
            // Simulate email sending
            await this.simulateEmailSending(emailData);
            
            return {
                success: true,
                message: 'Contact notification sent successfully'
            };
        } catch (error) {
            console.error('Error sending contact notification:', error);
            return {
                success: false,
                message: 'Failed to send contact notification'
            };
        }
    }

    // Send Google Form submission notification
    async sendFormSubmissionNotification(formData) {
        const emailData = {
            to: this.adminEmail,
            subject: 'New Google Form Submission - MARTIN',
            body: this.formatFormSubmissionEmail(formData),
            from: 'noreply@martin.com',
            replyTo: formData.email || 'noreply@martin.com'
        };

        try {
            console.log('Sending form submission notification:', emailData);
            
            // Simulate email sending
            await this.simulateEmailSending(emailData);
            
            return {
                success: true,
                message: 'Form submission notification sent successfully'
            };
        } catch (error) {
            console.error('Error sending form submission notification:', error);
            return {
                success: false,
                message: 'Failed to send form submission notification'
            };
        }
    }

    // Send competition update notification
    async sendCompetitionNotification(competitionData, action) {
        const emailData = {
            to: this.adminEmail,
            subject: `Competition ${action}: ${competitionData.title}`,
            body: this.formatCompetitionEmail(competitionData, action),
            from: 'noreply@martin.com',
            replyTo: 'noreply@martin.com'
        };

        try {
            console.log('Sending competition notification:', emailData);
            
            await this.simulateEmailSending(emailData);
            
            return {
                success: true,
                message: `Competition ${action} notification sent successfully`
            };
        } catch (error) {
            console.error('Error sending competition notification:', error);
            return {
                success: false,
                message: `Failed to send competition ${action} notification`
            };
        }
    }

    // Format contact form email
    formatContactEmail(contactData) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e3c72;">New Contact Message from MARTIN Website</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2a5298; margin-top: 0;">Message Details</h3>
                    
                    <p><strong>Name:</strong> ${contactData.name}</p>
                    <p><strong>Email:</strong> ${contactData.email}</p>
                    <p><strong>Subject:</strong> ${contactData.subject}</p>
                    <p><strong>Date:</strong> ${new Date(contactData.timestamp).toLocaleString()}</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 15px;">
                        <strong>Message:</strong><br>
                        ${contactData.message}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${this.baseUrl}/admin.html" 
                       style="background: #1e3c72; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 6px; display: inline-block;">
                        View in Admin Dashboard
                    </a>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
                <p style="color: #666; font-size: 14px; text-align: center;">
                    This email was sent from the MARTIN website contact form.<br>
                    Please do not reply to this email directly.
                </p>
            </div>
        `;
    }

    // Format Google Form submission email
    formatFormSubmissionEmail(formData) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e3c72;">New Google Form Submission - MARTIN</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2a5298; margin-top: 0;">Application Details</h3>
                    
                    <p><strong>Submission Date:</strong> ${new Date(formData.timestamp).toLocaleString()}</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 15px;">
                        <strong>Form Data:</strong><br>
                        <pre style="white-space: pre-wrap; font-family: inherit;">${JSON.stringify(formData.formData, null, 2)}</pre>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${this.baseUrl}/admin.html#applications" 
                       style="background: #1e3c72; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 6px; display: inline-block;">
                        View in Admin Dashboard
                    </a>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
                <p style="color: #666; font-size: 14px; text-align: center;">
                    This notification was sent for a new Google Form submission.<br>
                    Please review the application in the admin dashboard.
                </p>
            </div>
        `;
    }

    // Format competition email
    formatCompetitionEmail(competitionData, action) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e3c72;">Competition ${action.charAt(0).toUpperCase() + action.slice(1)} - MARTIN</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2a5298; margin-top: 0;">Competition Details</h3>
                    
                    <p><strong>Title:</strong> ${competitionData.title}</p>
                    <p><strong>Description:</strong> ${competitionData.description}</p>
                    <p><strong>Deadline:</strong> ${competitionData.deadline}</p>
                    <p><strong>Prize:</strong> ${competitionData.prize}</p>
                    <p><strong>Status:</strong> ${competitionData.status}</p>
                    <p><strong>Date ${action}:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${this.baseUrl}/admin.html#competitions" 
                       style="background: #1e3c72; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 6px; display: inline-block;">
                        Manage Competitions
                    </a>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e9ecef;">
                <p style="color: #666; font-size: 14px; text-align: center;">
                    This notification was sent for a competition ${action} action.<br>
                    Please review the changes in the admin dashboard.
                </p>
            </div>
        `;
    }

    // Simulate email sending (replace with actual email service)
    async simulateEmailSending(emailData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`📧 Email would be sent to: ${emailData.to}`);
                console.log(`📧 Subject: ${emailData.subject}`);
                console.log(`📧 From: ${emailData.from}`);
                console.log(`📧 Body length: ${emailData.body.length} characters`);
                
                // In production, this would send to your email service
                // Examples: SendGrid, Mailgun, AWS SES, etc.
                
                resolve(true);
            }, 1000); // Simulate network delay
        });
    }

    // Get email service status
    getStatus() {
        return {
            service: 'Email Service Demo',
            status: 'Active',
            adminEmail: this.adminEmail,
            companyName: this.companyName,
            features: [
                'Contact Form Notifications',
                'Google Form Submission Alerts',
                'Competition Management Updates',
                'HTML Email Templates'
            ]
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
} else {
    // Browser environment
    window.EmailService = EmailService;
}

// Usage example:
/*
const emailService = new EmailService();

// Send contact notification
emailService.sendContactNotification({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'General Inquiry',
    message: 'Hello, I have a question about your competitions.',
    timestamp: new Date().toISOString()
});

// Send form submission notification
emailService.sendFormSubmissionNotification({
    timestamp: new Date().toISOString(),
    formData: {
        age: '25',
        name: 'Jane Smith',
        email: 'jane@example.com'
    }
});
*/ 