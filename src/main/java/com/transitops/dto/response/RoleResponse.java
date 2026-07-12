package com.transitops.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean isSystemRole;
    private Long numberOfUsers;
    private List<String> permissions; // e.g. ["VEHICLES_READ"]
}
