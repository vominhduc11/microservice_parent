package com.devwonder.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
@Documented
@NotNull(message = "ID cannot be null")
@Min(value = 1, message = "ID must be positive")
public @interface ValidId {
    String message() default "Invalid ID";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}