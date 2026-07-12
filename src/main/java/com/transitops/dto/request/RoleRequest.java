package com.transitops.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

    private List<String> permissions; // e.g. ["VEHICLES_READ", "VEHICLES_CREATE"]
}
