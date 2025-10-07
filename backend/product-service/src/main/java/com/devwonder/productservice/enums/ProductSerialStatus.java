package com.devwonder.productservice.enums;

public enum ProductSerialStatus {
    IN_STOCK("In Stock"),
    ALLOCATED_TO_DEALER("Allocated to Dealer"),
    ASSIGN_TO_ORDER_ITEM("Assigned to Order Item"),
    SOLD_TO_CUSTOMER("Sold to Customer");

    private final String displayName;

    ProductSerialStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}