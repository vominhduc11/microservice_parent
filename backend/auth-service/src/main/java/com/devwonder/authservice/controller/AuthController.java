package com.devwonder.authservice.controller;

import com.devwonder.authservice.dto.*;
import com.devwonder.authservice.service.AuthService;
import com.devwonder.common.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication endpoints for user login and token management")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
        summary = "User Login",
        description = "Authenticate user credentials and return JWT access token. " +
                    "Optional userType field can be provided to validate against specific user role. " +
                    "The token can be used for accessing protected resources in other microservices.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful, JWT token returned"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload"),
        @ApiResponse(responseCode = "401", description = "Invalid username or password"),
        @ApiResponse(responseCode = "403", description = "Account is disabled"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(BaseResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(
        summary = "User Logout",
        description = "Invalidate JWT token from Authorization header and add it to blacklist. " +
                    "The token will no longer be valid for accessing protected resources. " +
                    "No request body required - token is automatically extracted from Authorization header."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful, token invalidated"),
        @ApiResponse(responseCode = "401", description = "Invalid or expired token"),
        @ApiResponse(responseCode = "403", description = "No authorization header provided"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<LogoutResponse>> logout(HttpServletRequest request) {
        LogoutResponse response = authService.logoutUser(request);
        return ResponseEntity.ok(BaseResponse.success("Logout successful", response));
    }

    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh JWT Token",
        description = "Refresh an expired or soon-to-expire JWT token and get a new access token. " +
                    "The old token must have valid signature but can be expired. " +
                    "After refresh, the old token becomes invalid and should not be used.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully, new token returned"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload or token format"),
        @ApiResponse(responseCode = "401", description = "Invalid token signature or user not found"),
        @ApiResponse(responseCode = "403", description = "Token is blacklisted or account is disabled"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<RefreshTokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        RefreshTokenResponse response = authService.refreshToken(refreshRequest);
        return ResponseEntity.ok(BaseResponse.success("Token refreshed successfully", response));
    }


    @PostMapping("/change-password")
    @Operation(
        summary = "Change Password",
        description = "Change password for authenticated user. Requires valid JWT token in Authorization header. " +
                    "User must provide current password, new password, and confirm new password.",
        security = @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or passwords do not match"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid token or incorrect current password"),
        @ApiResponse(responseCode = "403", description = "No authorization header provided"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ChangePasswordResponse>> changePassword(
            @Parameter(hidden = true) HttpServletRequest request,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        ChangePasswordResponse response = authService.changePassword(request, changePasswordRequest);
        return ResponseEntity.ok(BaseResponse.success("Password changed successfully", response));
    }

    @PostMapping("/send-login-confirmation")
    @Operation(
        summary = "Send Login Confirmation Email",
        description = "Send a login confirmation email to the specified email address. " +
                    "Requires ADMIN role. This endpoint can be called after successful login to notify the user about the login activity.",
        security = @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login confirmation email sent successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires ADMIN role"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<SendLoginConfirmationResponse>> sendLoginConfirmation(
            @Valid @RequestBody SendLoginConfirmationRequest request,
            @Parameter(hidden = true) HttpServletRequest httpRequest) {
        SendLoginConfirmationResponse response = authService.sendLoginConfirmation(request, httpRequest);
        return ResponseEntity.ok(BaseResponse.success("Login confirmation email sent successfully", response));
    }

    @GetMapping("/confirm-login")
    @Operation(
        summary = "Confirm Login from Email",
        description = "Confirm login by validating the JWT token from email link. " +
                    "This endpoint validates the token and sends a WebSocket notification to the user's active session. " +
                    "Returns an HTML page with success/error message and auto-redirect.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login confirmed successfully - returns HTML page"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired token - returns HTML error page"),
        @ApiResponse(responseCode = "404", description = "Account not found - returns HTML error page"),
        @ApiResponse(responseCode = "500", description = "Internal server error - returns HTML error page")
    })
    public ResponseEntity<String> confirmLogin(@RequestParam String token) {
        try {
            ConfirmLoginResponse response = authService.confirmLogin(token);

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login Confirmed</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            padding: 20px;
                        }
                        .container {
                            background: white;
                            padding: 50px 40px;
                            border-radius: 20px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 500px;
                            width: 100%%;
                            animation: slideIn 0.5s ease-out;
                        }
                        @keyframes slideIn {
                            from {
                                opacity: 0;
                                transform: translateY(-30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        .success-icon {
                            width: 80px;
                            height: 80px;
                            border-radius: 50%%;
                            background: #28a745;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 30px;
                            animation: scaleIn 0.5s ease-out 0.2s both;
                        }
                        @keyframes scaleIn {
                            from {
                                transform: scale(0);
                            }
                            to {
                                transform: scale(1);
                            }
                        }
                        .success-icon svg {
                            width: 50px;
                            height: 50px;
                            stroke: white;
                            stroke-width: 3;
                            stroke-linecap: round;
                            stroke-linejoin: round;
                            fill: none;
                            stroke-dasharray: 100;
                            stroke-dashoffset: 100;
                            animation: checkmark 0.5s ease-out 0.5s forwards;
                        }
                        @keyframes checkmark {
                            to {
                                stroke-dashoffset: 0;
                            }
                        }
                        h1 {
                            color: #2c3e50;
                            font-size: 28px;
                            margin-bottom: 15px;
                            font-weight: 600;
                        }
                        .username {
                            color: #667eea;
                            font-size: 20px;
                            font-weight: 500;
                            margin-bottom: 20px;
                        }
                        .message {
                            color: #7f8c8d;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 30px;
                        }
                        .spinner {
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #667eea;
                            border-radius: 50%%;
                            width: 40px;
                            height: 40px;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 15px;
                        }
                        @keyframes spin {
                            0%% { transform: rotate(0deg); }
                            100%% { transform: rotate(360deg); }
                        }
                        .redirect-text {
                            font-size: 14px;
                            color: #95a5a6;
                            font-style: italic;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success-icon">
                            <svg viewBox="0 0 52 52">
                                <path d="M14 27l7 7 16-16"/>
                            </svg>
                        </div>
                        <h1>Login Confirmed Successfully!</h1>
                        <div class="username">Welcome back, %s</div>
                        <p class="message">
                            Your login has been verified.<br>
                            You can now close this window and return to your application.
                        </p>
                        <div class="spinner"></div>
                        <p class="redirect-text">This window will close automatically...</p>
                    </div>
                    <script>
                        setTimeout(() => {
                            window.close();
                            if (!window.closed) {
                                window.location.href = 'about:blank';
                            }
                        }, 3000);
                    </script>
                </body>
                </html>
                """.formatted(response.getUsername());

            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(html);

        } catch (Exception e) {
            String errorHtml = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Login Confirmation Failed</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%);
                            padding: 20px;
                        }
                        .container {
                            background: white;
                            padding: 50px 40px;
                            border-radius: 20px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 500px;
                            width: 100%%;
                            animation: slideIn 0.5s ease-out;
                        }
                        @keyframes slideIn {
                            from {
                                opacity: 0;
                                transform: translateY(-30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        .error-icon {
                            width: 80px;
                            height: 80px;
                            border-radius: 50%%;
                            background: #dc3545;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 30px;
                            animation: scaleIn 0.5s ease-out 0.2s both;
                        }
                        @keyframes scaleIn {
                            from {
                                transform: scale(0);
                            }
                            to {
                                transform: scale(1);
                            }
                        }
                        .error-icon svg {
                            width: 50px;
                            height: 50px;
                            stroke: white;
                            stroke-width: 3;
                            stroke-linecap: round;
                            stroke-linejoin: round;
                            fill: none;
                        }
                        h1 {
                            color: #2c3e50;
                            font-size: 28px;
                            margin-bottom: 15px;
                            font-weight: 600;
                        }
                        .error-message {
                            color: #e74c3c;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 20px;
                            padding: 15px;
                            background: #fee;
                            border-radius: 8px;
                            border-left: 4px solid #dc3545;
                        }
                        .help-text {
                            color: #7f8c8d;
                            font-size: 14px;
                            line-height: 1.6;
                        }
                        .help-text a {
                            color: #667eea;
                            text-decoration: none;
                            font-weight: 500;
                        }
                        .help-text a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error-icon">
                            <svg viewBox="0 0 52 52">
                                <line x1="16" y1="16" x2="36" y2="36"/>
                                <line x1="36" y1="16" x2="16" y2="36"/>
                            </svg>
                        </div>
                        <h1>Confirmation Failed</h1>
                        <div class="error-message">%s</div>
                        <p class="help-text">
                            The confirmation link may have expired or is invalid.<br>
                            Please try logging in again or contact <a href="mailto:support@devwonder.com">support</a> if the problem persists.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(e.getMessage());

            return ResponseEntity.badRequest()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(errorHtml);
        }
    }

    @PostMapping("/forgot-password")
    @Operation(
        summary = "Forgot Password",
        description = "Request a password reset link to be sent to the provided email address. " +
                    "For security reasons, the response will always indicate success even if the email doesn't exist in the system. " +
                    "If the email exists, a reset link will be sent valid for 30 minutes.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Request processed - check email for reset link"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ForgotPasswordResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        ForgotPasswordResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(BaseResponse.success("Password reset request processed", response));
    }

    @GetMapping("/reset-password-form")
    @Operation(
        summary = "Show Reset Password Form",
        description = "Display HTML form for resetting password. Validates token and shows form if valid.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset form displayed"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired token - shows error page")
    })
    public ResponseEntity<String> showResetPasswordForm(@RequestParam String token) {
        try {
            // Verify token and get masked email
            io.jsonwebtoken.Claims claims = authService.jwtService.validatePasswordResetToken(token);
            String email = claims.get("email", String.class);
            String maskedEmail = authService.maskEmail(email);

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Password</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            padding: 20px;
                        }
                        .container {
                            background: white;
                            padding: 40px;
                            border-radius: 20px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            max-width: 500px;
                            width: 100%%;
                            animation: slideIn 0.5s ease-out;
                        }
                        @keyframes slideIn {
                            from {
                                opacity: 0;
                                transform: translateY(-30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .lock-icon {
                            width: 60px;
                            height: 60px;
                            border-radius: 50%%;
                            background: #dc3545;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 20px;
                        }
                        .lock-icon svg {
                            width: 30px;
                            height: 30px;
                            fill: white;
                        }
                        h1 {
                            color: #2c3e50;
                            font-size: 24px;
                            margin-bottom: 10px;
                        }
                        .email-info {
                            color: #7f8c8d;
                            font-size: 14px;
                            margin-bottom: 20px;
                        }
                        .form-group {
                            margin-bottom: 20px;
                        }
                        label {
                            display: block;
                            color: #2c3e50;
                            font-weight: 500;
                            margin-bottom: 8px;
                            font-size: 14px;
                        }
                        input[type="password"] {
                            width: 100%%;
                            padding: 12px 15px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            font-size: 14px;
                            transition: border-color 0.3s;
                        }
                        input[type="password"]:focus {
                            outline: none;
                            border-color: #667eea;
                        }
                        .password-requirements {
                            font-size: 12px;
                            color: #7f8c8d;
                            margin-top: 5px;
                        }
                        .submit-btn {
                            width: 100%%;
                            padding: 14px;
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: transform 0.2s, box-shadow 0.2s;
                        }
                        .submit-btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
                        }
                        .submit-btn:disabled {
                            opacity: 0.6;
                            cursor: not-allowed;
                            transform: none;
                        }
                        .error-message {
                            background: #fee;
                            border-left: 4px solid #dc3545;
                            color: #dc3545;
                            padding: 12px;
                            border-radius: 4px;
                            margin-bottom: 20px;
                            font-size: 14px;
                            display: none;
                        }
                        .success-message {
                            background: #e8f5e9;
                            border-left: 4px solid #28a745;
                            color: #28a745;
                            padding: 12px;
                            border-radius: 4px;
                            margin-bottom: 20px;
                            font-size: 14px;
                            display: none;
                        }
                        .spinner {
                            display: none;
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #667eea;
                            border-radius: 50%%;
                            width: 20px;
                            height: 20px;
                            animation: spin 1s linear infinite;
                            margin: 0 auto;
                        }
                        @keyframes spin {
                            0%% { transform: rotate(0deg); }
                            100%% { transform: rotate(360deg); }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="lock-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277c-.595-.347-1-.985-1-1.723 0-1.103.897-2 2-2s2 .897 2 2c0 .738-.405 1.376-1 1.723z"/>
                                </svg>
                            </div>
                            <h1>Reset Your Password</h1>
                            <p class="email-info">Account: %s</p>
                        </div>

                        <div class="error-message" id="errorMessage"></div>
                        <div class="success-message" id="successMessage"></div>

                        <form id="resetPasswordForm">
                            <input type="hidden" id="token" value="%s">

                            <div class="form-group">
                                <label for="newPassword">New Password</label>
                                <input type="password" id="newPassword" name="newPassword" required minlength="6">
                                <div class="password-requirements">Minimum 6 characters</div>
                            </div>

                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
                            </div>

                            <button type="submit" class="submit-btn" id="submitBtn">Reset Password</button>
                            <div class="spinner" id="spinner"></div>
                        </form>
                    </div>

                    <script>
                        const form = document.getElementById('resetPasswordForm');
                        const submitBtn = document.getElementById('submitBtn');
                        const spinner = document.getElementById('spinner');
                        const errorMessage = document.getElementById('errorMessage');
                        const successMessage = document.getElementById('successMessage');

                        form.addEventListener('submit', async (e) => {
                            e.preventDefault();

                            const token = document.getElementById('token').value;
                            const newPassword = document.getElementById('newPassword').value;
                            const confirmPassword = document.getElementById('confirmPassword').value;

                            // Validate passwords match
                            if (newPassword !== confirmPassword) {
                                showError('Passwords do not match');
                                return;
                            }

                            // Show loading
                            submitBtn.style.display = 'none';
                            spinner.style.display = 'block';
                            errorMessage.style.display = 'none';

                            try {
                                const response = await fetch('/api/auth/reset-password', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        token: token,
                                        newPassword: newPassword,
                                        confirmPassword: confirmPassword
                                    })
                                });

                                const data = await response.json();

                                if (response.ok) {
                                    showSuccess('Password reset successfully! Redirecting to login...');
                                    setTimeout(() => {
                                        window.location.href = '/login';
                                    }, 2000);
                                } else {
                                    showError(data.message || 'Failed to reset password');
                                }
                            } catch (error) {
                                showError('Network error. Please try again.');
                            } finally {
                                submitBtn.style.display = 'block';
                                spinner.style.display = 'none';
                            }
                        });

                        function showError(message) {
                            errorMessage.textContent = message;
                            errorMessage.style.display = 'block';
                            successMessage.style.display = 'none';
                        }

                        function showSuccess(message) {
                            successMessage.textContent = message;
                            successMessage.style.display = 'block';
                            errorMessage.style.display = 'none';
                        }
                    </script>
                </body>
                </html>
                """.formatted(maskedEmail, token);

            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(html);

        } catch (Exception e) {
            String errorHtml = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Invalid Reset Link</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%);
                            padding: 20px;
                        }
                        .container {
                            background: white;
                            padding: 50px 40px;
                            border-radius: 20px;
                            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                            text-align: center;
                            max-width: 500px;
                            width: 100%%;
                            animation: slideIn 0.5s ease-out;
                        }
                        @keyframes slideIn {
                            from {
                                opacity: 0;
                                transform: translateY(-30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        .error-icon {
                            width: 80px;
                            height: 80px;
                            border-radius: 50%%;
                            background: #dc3545;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 30px;
                        }
                        .error-icon svg {
                            width: 50px;
                            height: 50px;
                            stroke: white;
                            stroke-width: 3;
                            stroke-linecap: round;
                            stroke-linejoin: round;
                            fill: none;
                        }
                        h1 {
                            color: #2c3e50;
                            font-size: 28px;
                            margin-bottom: 15px;
                            font-weight: 600;
                        }
                        .error-message {
                            color: #e74c3c;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 20px;
                            padding: 15px;
                            background: #fee;
                            border-radius: 8px;
                            border-left: 4px solid #dc3545;
                        }
                        .help-text {
                            color: #7f8c8d;
                            font-size: 14px;
                            line-height: 1.6;
                        }
                        .help-text a {
                            color: #667eea;
                            text-decoration: none;
                            font-weight: 500;
                        }
                        .help-text a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="error-icon">
                            <svg viewBox="0 0 52 52">
                                <line x1="16" y1="16" x2="36" y2="36"/>
                                <line x1="36" y1="16" x2="16" y2="36"/>
                            </svg>
                        </div>
                        <h1>Invalid Reset Link</h1>
                        <div class="error-message">%s</div>
                        <p class="help-text">
                            The reset link may have expired or is invalid.<br>
                            Please request a new password reset or contact <a href="mailto:support@devwonder.com">support</a> if the problem persists.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(e.getMessage());

            return ResponseEntity.badRequest()
                .contentType(org.springframework.http.MediaType.TEXT_HTML)
                .body(errorHtml);
        }
    }

    @PostMapping("/reset-password")
    @Operation(
        summary = "Reset Password",
        description = "Reset password using the token received via email. " +
                    "The token must be valid and not expired. New password must match the confirmation password. " +
                    "After successful reset, all existing sessions will be invalidated.",
        security = {}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password reset successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid token, expired token, or passwords don't match"),
        @ApiResponse(responseCode = "404", description = "Account not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<ResetPasswordResponse>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        ResetPasswordResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(BaseResponse.success("Password reset successfully", response));
    }

}