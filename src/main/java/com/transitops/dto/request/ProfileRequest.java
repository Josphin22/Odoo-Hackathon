package com.transitops.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String password;
}
