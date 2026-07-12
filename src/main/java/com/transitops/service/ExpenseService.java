package com.transitops.service;

import com.transitops.dto.request.ExpenseRequest;
import com.transitops.dto.response.ExpenseResponse;
import java.util.List;

public interface ExpenseService {

    ExpenseResponse addExpense(ExpenseRequest request);

    List<ExpenseResponse> getAllExpenses();

    ExpenseResponse getExpenseById(Long id);

    ExpenseResponse updateExpense(Long id, ExpenseRequest request);

    void deleteExpense(Long id);
}
