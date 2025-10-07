package com.devwonder.blogservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "category_blogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBlog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @OneToMany(mappedBy = "categoryBlog", cascade = CascadeType.ALL)
    private List<Blog> blogs;
}