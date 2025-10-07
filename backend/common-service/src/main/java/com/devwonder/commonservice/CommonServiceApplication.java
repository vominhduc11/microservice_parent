package com.devwonder.commonservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.devwonder.commonservice", "com.devwonder.common"})
public class CommonServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommonServiceApplication.class, args);
    }

}
