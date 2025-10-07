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
public class LoginConfirmationNotificationEvent {
    private Long accountId;
    private String username;
    private String message;
    private LocalDateTime confirmedAt;
}
