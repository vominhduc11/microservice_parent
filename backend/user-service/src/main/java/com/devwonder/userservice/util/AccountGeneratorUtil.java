package com.devwonder.userservice.util;

import lombok.experimental.UtilityClass;

import java.util.UUID;

@UtilityClass
public class AccountGeneratorUtil {
    
    /**
     * Generate username from company name with random suffix
     * 
     * @param companyName The company name to base username on
     * @return Generated username (max 12 characters)
     */
    public static String generateUsername(String companyName) {
        // Generate username from company name + random suffix
        String baseUsername = companyName.toLowerCase()
                .replaceAll("[^a-z0-9]", "")
                .substring(0, Math.min(companyName.replaceAll("[^a-z0-9]", "").length(), 8));
        
        String suffix = UUID.randomUUID().toString().substring(0, 4);
        return baseUsername + suffix;
    }
    
    /**
     * Generate secure random password with prefix and special character
     * 
     * @param prefix Prefix for the password (e.g., "Dealer")
     * @return Generated secure password
     */
    public static String generatePassword(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 8) + "!";
    }
    
    /**
     * Generate dealer-specific password
     * 
     * @return Generated dealer password
     */
    public static String generateDealerPassword() {
        return generatePassword("Dealer");
    }
    
}