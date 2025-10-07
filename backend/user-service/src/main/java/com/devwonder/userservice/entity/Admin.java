package com.devwonder.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Admin {
    
    @Id
    @Column(name = "account_id")
    private Long accountId;
    
    private String name;
    
    private String email;
    
    private String phone;
    
    @Column(name = "company_name")
    private String companyName;

    @Column(name = "require_login_email_confirmation")
    @Builder.Default
    private Boolean requireLoginEmailConfirmation = false;
}