package com.transitops.security;

import com.transitops.entity.User;
import com.transitops.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndIsDeletedFalse(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        if (user.getIsLocked()) {
            throw new UsernameNotFoundException("Account is locked. Please contact Admin.");
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        // Add main Role authority (e.g. ROLE_ADMIN)
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName()));

        // Add Permission authorities (e.g. PERM_VEHICLES_READ)
        if (user.getRole().getPermissions() != null) {
            user.getRole().getPermissions().forEach(perm -> {
                String permissionName = "PERM_" + perm.getModule() + "_" + perm.getAction();
                authorities.add(new SimpleGrantedAuthority(permissionName));
            });
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}
