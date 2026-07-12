package com.transitops.config;

import com.transitops.entity.Role;
import com.transitops.enums.RoleName;
import com.transitops.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {

            for (RoleName roleName : RoleName.values()) {

                if (!roleRepository.existsByName(roleName)) {

                    Role role = new Role();
                    role.setName(roleName);

                    roleRepository.save(role);

                    System.out.println(roleName + " inserted.");
                }

            }

        };
    }
}