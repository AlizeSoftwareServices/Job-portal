export declare class MailService {
    private transporter;
    constructor();
    sendApplicationConfirmation(email: string, firstName: string, jobTitle: string, referenceNumber: string): Promise<void>;
    sendCustomEmail(email: string, subject: string, message: string): Promise<void>;
    sendRegistrationOtpEmail(email: string, code: string): Promise<void>;
    sendForgotPasswordOtpEmail(email: string, code: string): Promise<void>;
    sendStatusUpdateEmail(email: string, firstName: string, jobTitle: string, status: string, referenceNumber: string): Promise<void>;
    sendAdminNewApplicationEmail(adminEmail: string, candidateDetails: any, jobTitle: string, referenceNumber: string): Promise<void>;
}
