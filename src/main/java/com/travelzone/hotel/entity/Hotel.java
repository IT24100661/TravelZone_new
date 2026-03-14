package com.travelzone.hotel.entity;

import com.travelzone.user.entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false, length = 1500)
    private String description;

    @ElementCollection
    @CollectionTable(name = "hotel_facilities", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "facility")
    private List<String> facilities = new ArrayList<>();

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal minPrice = BigDecimal.ZERO;

    public Hotel() {
    }

    public Long getId() {
        return id;
    }

    public User getOwner() {
        return owner;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getFacilities() {
        return facilities;
    }

    public boolean isActive() {
        return active;
    }

    public Double getRating() {
        return rating;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setFacilities(List<String> facilities) {
        this.facilities = facilities;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }
}
