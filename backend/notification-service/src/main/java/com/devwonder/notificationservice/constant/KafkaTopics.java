package com.devwonder.notificationservice.constant;

public final class KafkaTopics {

    // Prevent instantiation
    private KafkaTopics() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // Topic names
    public static final String DEALER_EMAIL = "email-notifications";
    public static final String DEALER_SOCKET = "dealer-registration-notifications";
    public static final String ORDER_NOTIFICATIONS = "order-notifications";
    public static final String LOGIN_CONFIRMATION = "login-confirmation-notifications";
    public static final String LOGIN_CONFIRMED = "login-confirmed-notifications";

    // Consumer groups
    public static final String NOTIFICATION_SERVICE_GROUP = "notification-service-group";
}