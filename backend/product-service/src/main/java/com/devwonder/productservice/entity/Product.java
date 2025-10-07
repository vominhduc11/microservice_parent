package com.devwonder.productservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String sku;
    
    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String shortDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String image;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String descriptions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String videos;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String specifications;
    
    @Column(name = "retail_price", precision = 10, scale = 2)
    private BigDecimal price;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "wholesale_price", columnDefinition = "jsonb")
    private String wholesalePrice;
    
    
    @Column(name = "show_on_homepage")
    private Boolean showOnHomepage = false;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "stock")
    private Long stock = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductSerial> productSerials;
    
}