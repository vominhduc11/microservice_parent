package com.devwonder.warrantyservice.entity;

import com.devwonder.warrantyservice.enums.WarrantyStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "warranties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warranty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "id_product_serial", nullable = false)
    private Long idProductSerial;

    @NotBlank
    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @NotBlank
    @Column(name = "customer_email", nullable = false, unique = true)
    private String customerEmail;

    @NotBlank
    @Column(name = "customer_phone", nullable = false, unique = true)
    private String customerPhone;

    @Column(name = "customer_address")
    private String customerAddress;

    @NotBlank
    @Column(name = "warranty_code", unique = true, nullable = false, length = 50)
    private String warrantyCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WarrantyStatus status = WarrantyStatus.ACTIVE;

    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}