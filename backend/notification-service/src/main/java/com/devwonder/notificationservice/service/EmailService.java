package com.devwonder.notificationservice.service;

import com.devwonder.common.event.DealerEmailEvent;
import com.devwonder.common.event.LoginConfirmationEvent;
import com.devwonder.common.event.PasswordResetEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendDealerWelcomeEmail(DealerEmailEvent event) throws MessagingException, UnsupportedEncodingException {
        log.info("Sending dealer welcome email to: {}", event.getEmail());
        
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail, "DevWonder E-commerce Platform");
        helper.setTo(event.getEmail());
        helper.setSubject("Welcome to DevWonder E-commerce Platform - Account Created");
        
        String emailContent = buildEmailContent(event);
        helper.setText(emailContent, true);
        
        javaMailSender.send(message);
        log.info("✅ Email sent successfully to {}", event.getEmail());
    }

    
    private String buildEmailContent(DealerEmailEvent event) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #007bff; text-align: center;">Welcome to DevWonder E-commerce Platform!</h2>
                    
                    <p>Dear <strong>%s</strong>,</p>
                    
                    <p>Welcome to DevWonder E-commerce Platform! Your dealer account has been successfully created.</p>
                    
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #1976d2; margin-top: 0;">Your Login Credentials:</h3>
                        <p><strong>Username:</strong> %s</p>
                        <p><strong>Password:</strong> %s</p>
                    </div>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #424242; margin-top: 0;">Company Information:</h3>
                        <p><strong>Company Name:</strong> %s</p>
                        <p><strong>Email:</strong> %s</p>
                        <p><strong>Phone:</strong> %s</p>
                        <p><strong>Address:</strong> %s</p>
                        <p><strong>City:</strong> %s, %s</p>
                    </div>
                    
                    <h3 style="color: #2e7d32;">Next Steps:</h3>
                    <ol style="color: #424242;">
                        <li>Login to our dealer portal using your credentials</li>
                        <li>Complete your dealer profile verification</li>
                        <li>Browse our wholesale product catalog</li>
                        <li>Start placing your first orders</li>
                    </ol>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:8080/api/auth/login"
                           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                           Access Portal
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        For support, contact us at <a href="mailto:support@devwonder.com">support@devwonder.com</a>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Best regards,<br>
                        DevWonder E-commerce Team<br>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(
                event.getCompanyName(),
                event.getUsername(),
                event.getPassword(),
                event.getCompanyName(),
                event.getEmail(),
                event.getPhone(),
                event.getAddress(),
                event.getDistrict(),
                event.getCity()
            );
    }

    public void sendLoginConfirmationEmail(LoginConfirmationEvent event) throws MessagingException, UnsupportedEncodingException {
        log.info("Sending login confirmation email to: {}", event.getEmail());

        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, "DevWonder E-commerce Platform");
        helper.setTo(event.getEmail());
        helper.setSubject("Login Confirmation - DevWonder E-commerce Platform");

        String emailContent = buildLoginConfirmationEmailContent(event);
        helper.setText(emailContent, true);

        javaMailSender.send(message);
        log.info("✅ Login confirmation email sent successfully to {}", event.getEmail());
    }

    private String buildLoginConfirmationEmailContent(LoginConfirmationEvent event) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        String formattedLoginTime = event.getLoginTime().format(formatter);

        // Build confirmation URL with JWT token
        String confirmationUrl = "http://localhost:8080/api/auth/confirm-login?token=" + event.getConfirmationToken();

        return """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #ffc107; text-align: center;">🔔 Login Confirmation Required</h2>

                    <p>Dear <strong>%s</strong>,</p>

                    <p>We detected a new login to your account on the DevWonder E-commerce Platform.</p>

                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <h3 style="color: #2e7d32; margin-top: 0;">Login Details:</h3>
                        <p><strong>Username:</strong> %s</p>
                        <p><strong>User Type:</strong> %s</p>
                        <p><strong>Login Time:</strong> %s</p>
                        <p><strong>IP Address:</strong> %s</p>
                        <p><strong>Device:</strong> %s</p>
                    </div>

                    <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8; text-align: center;">
                        <h3 style="color: #0c5460; margin-top: 0;">✓ Confirm This Login</h3>
                        <p style="color: #0c5460; margin-bottom: 20px;">
                            If this was you, please click the button below to confirm:
                        </p>
                        <a href="%s"
                           style="background-color: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
                           ✓ Confirm Login
                        </a>
                        <p style="color: #0c5460; font-size: 12px; margin-top: 15px;">
                            This confirmation link will expire in 90 seconds.
                        </p>
                    </div>

                    <p style="color: #666; font-size: 14px;">
                        For support, contact us at <a href="mailto:support@devwonder.com">support@devwonder.com</a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Best regards,<br>
                        DevWonder E-commerce Security Team<br>
                        This is an automated security notification.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(
                event.getUsername(),
                event.getUsername(),
                event.getUserType(),
                formattedLoginTime,
                event.getIpAddress(),
                event.getUserAgent(),
                confirmationUrl
            );
    }

    public void sendPasswordResetEmail(PasswordResetEvent event) throws MessagingException, UnsupportedEncodingException {
        log.info("Sending password reset email to: {}", event.getEmail());

        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, "DevWonder E-commerce Platform");
        helper.setTo(event.getEmail());
        helper.setSubject("Password Reset Request - DevWonder E-commerce Platform");

        String emailContent = buildPasswordResetEmailContent(event);
        helper.setText(emailContent, true);

        javaMailSender.send(message);
        log.info("✅ Password reset email sent successfully to {}", event.getEmail());
    }

    private String buildPasswordResetEmailContent(PasswordResetEvent event) {
        // Build password reset URL with JWT token - points to backend form
        String resetUrl = "http://localhost:8080/api/auth/reset-password-form?token=" + event.getResetToken();

        return """
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #dc3545; text-align: center;">🔐 Password Reset Request</h2>

                    <p>Dear <strong>%s</strong>,</p>

                    <p>We received a request to reset your password for your DevWonder E-commerce Platform account.</p>

                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <h3 style="color: #856404; margin-top: 0;">⚠️ Important Security Notice</h3>
                        <p style="color: #856404;">
                            If you did not request this password reset, please ignore this email or contact our support team immediately.
                        </p>
                    </div>

                    <div style="background-color: #d1ecf1; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8; text-align: center;">
                        <h3 style="color: #0c5460; margin-top: 0;">🔑 Reset Your Password</h3>
                        <p style="color: #0c5460; margin-bottom: 20px;">
                            Click the button below to reset your password:
                        </p>
                        <a href="%s"
                           style="background-color: #dc3545; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
                           Reset Password
                        </a>
                        <p style="color: #0c5460; font-size: 12px; margin-top: 15px;">
                            This reset link will expire in 30 minutes.
                        </p>
                    </div>

                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <h3 style="color: #2e7d32; margin-top: 0;">📧 Alternative Option</h3>
                        <p style="color: #2e7d32; font-size: 14px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px; display: block; margin-top: 10px; word-break: break-all;">%s</code>
                        </p>
                    </div>

                    <p style="color: #666; font-size: 14px;">
                        For support, contact us at <a href="mailto:support@devwonder.com">support@devwonder.com</a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Best regards,<br>
                        DevWonder E-commerce Security Team<br>
                        This is an automated security notification.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(
                event.getUsername(),
                resetUrl,
                resetUrl
            );
    }

}