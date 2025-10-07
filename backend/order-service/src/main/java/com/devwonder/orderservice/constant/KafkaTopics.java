package com.devwonder.orderservice.constant;

public final class KafkaTopics {

    // Prevent instantiation
    private KafkaTopics() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // Topic names
    public static final String ORDER_NOTIFICATIONS = "order-notifications";
}