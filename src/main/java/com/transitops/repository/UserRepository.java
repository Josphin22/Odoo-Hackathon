package com.transitops.repository;

import com.transitops.entity.Role;
import com.transitops.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIsDeletedFalse(String email);

    Optional<User> findByEmployeeIdAndIsDeletedFalse(String employeeId);

    boolean existsByEmployeeId(String employeeId);

    List<User> findAllByIsDeletedFalse();

    @Query("SELECT u FROM User u WHERE u.isDeleted = false AND " +
           "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.employeeId) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<User> searchEmployees(@Param("search") String search);

    long countByIsDeletedFalse();
    long countByIsDeletedFalseAndStatus(String status);
    long countByRoleAndIsDeletedFalse(Role role);
}