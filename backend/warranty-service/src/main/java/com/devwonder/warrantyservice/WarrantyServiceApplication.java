package com.devwonder.warrantyservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableFeignClients
@ComponentScan(basePackages = {"com.devwonder.warrantyservice", "com.devwonder.common"})
public class WarrantyServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WarrantyServiceApplication.class, args);
    }

}
