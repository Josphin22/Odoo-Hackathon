package com.transitops.service.impl;

import com.transitops.dto.request.ExpenseRequest;
import com.transitops.dto.response.ExpenseResponse;
import com.transitops.entity.Expense;
import com.transitops.entity.Vehicle;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.ExpenseRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.ExpenseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository,
                              VehicleRepository vehicleRepository) {
        this.expenseRepository = expenseRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @Transactional
    public ExpenseResponse addExpense(ExpenseRequest request) {
        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        }

        Expense expense = Expense.builder()
                .vehicle(vehicle)
                .category(request.getCategory())
                .amount(request.getAmount())
                .date(request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now())
                .description(request.getDescription())
                .referenceId(request.getReferenceId())
                .build();

        expenseRepository.save(expense);
        return map(expense);
    }

    @Override
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return map(expense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            expense.setVehicle(vehicle);
        } else if (request.getVehicleId() == null && request.getCategory() != null) {
            // allows removing vehicle mapping for non-fleet expenses if vehicleId is sent as null explicitly (can check request or keep)
        }

        if (request.getCategory() != null) {
            expense.setCategory(request.getCategory());
        }
        if (request.getAmount() != null) {
            expense.setAmount(request.getAmount());
        }
        if (request.getDate() != null) {
            expense.setDate(LocalDate.parse(request.getDate()));
        }
        if (request.getDescription() != null) {
            expense.setDescription(request.getDescription());
        }
        if (request.getReferenceId() != null) {
            expense.setReferenceId(request.getReferenceId());
        }

        expenseRepository.save(expense);
        return map(expense);
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    private ExpenseResponse map(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .vehicleId(expense.getVehicle() != null ? expense.getVehicle().getId() : null)
                .vehicleNumber(expense.getVehicle() != null ? expense.getVehicle().getVehicleNumber() : null)
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .date(expense.getDate().toString())
                .description(expense.getDescription())
                .referenceId(expense.getReferenceId())
                .build();
    }
}
