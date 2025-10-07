package com.devwonder.userservice.controller;

import com.devwonder.common.dto.BaseResponse;
import com.devwonder.userservice.dto.AdminRegisterRequest;
import com.devwonder.userservice.dto.AdminResponse;
import com.devwonder.userservice.dto.AdminUpdateRequest;
import com.devwonder.userservice.dto.DealerResponse;
import com.devwonder.userservice.dto.DealerUpdateRequest;
import com.devwonder.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user/admin")
@Tag(name = "Admin", description = "🔧 Admin operations - Dealer management")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserService userService;

    @GetMapping
    @Operation(
        summary = "Get All Admins (SYSTEM + ADMIN Only)",
        description = "Retrieve list of all admin accounts that have ADMIN role but NOT SYSTEM role. " +
                    "This endpoint returns only regular admin accounts, excluding the super admin. " +
                    "Requires both SYSTEM and ADMIN roles for authorization.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin list retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires both SYSTEM and ADMIN roles"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<List<AdminResponse>>> getAllAdmins() {

        log.info("Fetching all admin accounts");

        List<AdminResponse> admins = userService.getAllAdmins();
        BaseResponse<List<AdminResponse>> response = new BaseResponse<>(
            true,
            "Admin list retrieved successfully",
            admins
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(
        summary = "Register New Admin (SYSTEM + ADMIN Only)",
        description = "Create a new admin account with ADMIN role. This endpoint creates both " +
                    "an authentication account in auth-service and an admin profile in user-service. " +
                    "Requires both SYSTEM and ADMIN roles for authorization.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires both SYSTEM and ADMIN roles"),
        @ApiResponse(responseCode = "409", description = "Username, phone, or email already exists"),
        @ApiResponse(responseCode = "500", description = "Internal server error or account creation failed")
    })
    public ResponseEntity<BaseResponse<AdminResponse>> registerAdmin(
            @Valid @RequestBody AdminRegisterRequest registerRequest) {

        log.info("Registering new admin with username: {}", registerRequest.getUsername());

        AdminResponse adminResponse = userService.registerAdmin(registerRequest);
        BaseResponse<AdminResponse> response = new BaseResponse<>(
            true,
            "Admin registered successfully",
            adminResponse
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get Admin Information by ID",
        description = "Retrieve detailed information of a specific admin by ID. " +
                    "This endpoint returns admin profile including name, email, phone and company information. " +
                    "Requires ADMIN role authorization.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin information retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Admin not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<AdminResponse>> getAdminById(@PathVariable Long id) {

        log.info("Fetching admin information for ID: {}", id);

        AdminResponse adminResponse = userService.getAdminInfo(id);
        BaseResponse<AdminResponse> response = new BaseResponse<>(
            true,
            "Admin information retrieved successfully",
            adminResponse
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update Admin Information",
        description = "Update existing admin information. This endpoint allows admin users to modify admin " +
                    "name, email, phone, and company name. Requires ADMIN role authorization.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires ADMIN role"),
        @ApiResponse(responseCode = "404", description = "Admin not found"),
        @ApiResponse(responseCode = "409", description = "Phone or email already exists for another admin"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<AdminResponse>> updateAdmin(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateRequest updateRequest) {

        log.info("Admin updating admin ID: {}", id);

        AdminResponse adminResponse = userService.updateAdmin(id, updateRequest);
        BaseResponse<AdminResponse> response = new BaseResponse<>(
            true,
            "Admin updated successfully",
            adminResponse
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dealers/{id}")
    @Operation(
        summary = "Get Dealer by ID (ADMIN Only)",
        description = "Retrieve detailed information of a specific dealer by ID with optional field filtering. " +
                    "This endpoint provides complete dealer profile including company information, contact details and location. " +
                    "Use 'fields' parameter to specify which fields to return (e.g., ?fields=companyName,email,phone). " +
                    "Available fields: accountId, companyName, address, phone, email, district, city. " +
                    "Requires ADMIN role authorization.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dealer retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "Dealer not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<DealerResponse>> getDealerById(
            @PathVariable Long id,
            @RequestParam(required = false) String fields) {

        log.info("Admin retrieving dealer details for ID: {}", id);

        DealerResponse dealer = userService.getDealerById(id, fields);
        BaseResponse<DealerResponse> response = new BaseResponse<>(
            true,
            "Dealer retrieved successfully",
            dealer
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/dealers/{id}")
    @Operation(
        summary = "Update Dealer Information (ADMIN Only)",
        description = "Update existing dealer information. This endpoint allows admin users to modify dealer " +
                    "company information, contact details, and location. Requires ADMIN role authorization.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dealer updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires ADMIN role"),
        @ApiResponse(responseCode = "404", description = "Dealer not found"),
        @ApiResponse(responseCode = "409", description = "Phone or email already exists for another dealer"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<DealerResponse>> updateDealer(
            @PathVariable Long id,
            @Valid @RequestBody DealerUpdateRequest updateRequest) {

        log.info("Admin updating dealer ID: {}", id);

        DealerResponse dealerResponse = userService.updateDealer(id, updateRequest);
        BaseResponse<DealerResponse> response = new BaseResponse<>(
            true,
            "Dealer updated successfully",
            dealerResponse
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/dealers/{id}")
    @Operation(
        summary = "Delete Dealer (ADMIN Only)",
        description = "Delete an existing dealer from the system. This endpoint permanently removes the dealer " +
                    "record from the database. Requires ADMIN role authorization. Use with caution as this operation " +
                    "cannot be undone.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dealer deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires ADMIN role"),
        @ApiResponse(responseCode = "404", description = "Dealer not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<String>> deleteDealer(@PathVariable Long id) {
        log.info("Admin deleting dealer ID: {}", id);

        userService.deleteDealer(id);
        BaseResponse<String> response = new BaseResponse<>(
            true,
            "Dealer deleted successfully",
            "Dealer with ID " + id + " has been permanently removed"
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete Admin (SYSTEM + ADMIN Only)",
        description = "Delete an existing admin from the system. This endpoint permanently removes both " +
                    "the admin profile from user-service and the associated authentication account from auth-service. " +
                    "Requires both SYSTEM and ADMIN roles for authorization. Use with caution as this operation " +
                    "cannot be undone and will delete all related data.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires both SYSTEM and ADMIN roles"),
        @ApiResponse(responseCode = "404", description = "Admin not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error or account deletion failed")
    })
    public ResponseEntity<BaseResponse<String>> deleteAdmin(@PathVariable Long id) {
        log.info("Deleting admin with ID: {}", id);

        userService.deleteAdmin(id);
        BaseResponse<String> response = new BaseResponse<>(
            true,
            "Admin deleted successfully",
            "Admin with ID " + id + " has been permanently removed from the system"
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/batch")
    @Operation(
        summary = "Delete Multiple Admins (SYSTEM + ADMIN Only)",
        description = "Delete multiple admins from the system in a single request. This endpoint permanently removes " +
                    "all specified admin profiles from user-service and their associated authentication accounts from auth-service. " +
                    "Requires both SYSTEM and ADMIN roles for authorization. Use with caution as this operation " +
                    "cannot be undone and will delete all related data. Returns a summary of successful and failed deletions.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Batch deletion completed (check response for details)"),
        @ApiResponse(responseCode = "400", description = "Invalid request - empty or null ID list"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires both SYSTEM and ADMIN roles"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<java.util.Map<String, Object>>> deleteAdminsBatch(
            @RequestBody List<Long> adminIds) {

        log.info("Batch deleting {} admins", adminIds.size());

        if (adminIds == null || adminIds.isEmpty()) {
            return ResponseEntity.badRequest().body(
                new BaseResponse<>(false, "Admin ID list cannot be empty", null)
            );
        }

        java.util.Map<String, Object> result = userService.deleteAdminsBatch(adminIds);

        BaseResponse<java.util.Map<String, Object>> response = new BaseResponse<>(
            true,
            "Batch deletion completed",
            result
        );
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{accountId}/login-email-confirmation")
    @Operation(
        summary = "Update Login Email Confirmation Setting",
        description = "Update the login email confirmation requirement for a specific admin account. " +
                    "When enabled, the admin will receive an email notification each time they log in. " +
                    "Requires ADMIN role authorization.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login email confirmation setting updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Requires ADMIN role"),
        @ApiResponse(responseCode = "404", description = "Admin not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<BaseResponse<AdminResponse>> updateLoginEmailConfirmation(
            @PathVariable Long accountId,
            @Valid @RequestBody com.devwonder.userservice.dto.UpdateLoginEmailConfirmationRequest request) {

        log.info("Updating login email confirmation setting for admin accountId: {}", accountId);

        AdminResponse adminResponse = userService.updateLoginEmailConfirmation(accountId, request);
        BaseResponse<AdminResponse> response = new BaseResponse<>(
            true,
            "Login email confirmation setting updated successfully",
            adminResponse
        );
        return ResponseEntity.ok(response);
    }

}