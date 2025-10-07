package com.devwonder.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dealers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dealer {
    
    @Id
    @Column(name = "account_id")
    private Long accountId;
    
    @Column(name = "company_name")
    private String companyName;
    
    private String address;
    
    @Column(unique = true)
    private String phone;
    
    @Column(unique = true)
    private String email;
    
    private String district;
    
    private String city;
}