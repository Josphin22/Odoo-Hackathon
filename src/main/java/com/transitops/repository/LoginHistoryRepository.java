package com.transitops.repository;

import com.transitops.entity.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findAllByOrderByLoginTimeDesc();
    List<LoginHistory> findByUsernameOrderByLoginTimeDesc(String username);
}
