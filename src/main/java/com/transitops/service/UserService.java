package com.transitops.service;

import com.transitops.dto.request.EmployeeRequest;
import com.transitops.dto.response.EmployeeResponse;
import java.util.List;

public interface UserService {
    List<EmployeeResponse> getAllEmployees();
    List<EmployeeResponse> searchEmployees(String query);
    EmployeeResponse getEmployeeById(Long id);
    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);
    void deleteEmployee(Long id);
    void unlockEmployee(Long id);
    void resetEmployeePassword(Long id, String newPassword);
}
