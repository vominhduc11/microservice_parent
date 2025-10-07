package com.devwonder.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginConfirmationEvent {
    private Long accountId;
    private String username;
    private String email;
    private String userType;
    private LocalDateTime loginTime;
    private String ipAddress;
    private String userAgent;
    private String confirmationToken;
}
