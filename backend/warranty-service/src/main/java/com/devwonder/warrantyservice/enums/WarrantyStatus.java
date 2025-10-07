package com.devwonder.warrantyservice.enums;

public enum WarrantyStatus {
    ACTIVE("Active"),
    EXPIRED("Expired");

    private final String displayName;

    WarrantyStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}