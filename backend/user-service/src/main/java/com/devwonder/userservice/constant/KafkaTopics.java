package com.devwonder.userservice.constant;

public final class KafkaTopics {
    
    // Prevent instantiation
    private KafkaTopics() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }
    
    // Topic names
    public static final String DEALER_EMAIL = "email-notifications";
    public static final String DEALER_SOCKET = "dealer-registration-notifications";
}