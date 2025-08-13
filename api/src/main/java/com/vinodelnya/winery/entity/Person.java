package com.vinodelnya.winery.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "persons")
@Getter
@Setter
public class Person extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private Boolean active = true;
}