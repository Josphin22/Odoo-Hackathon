package com.transitops.dto.request;

import lombok.Data;

@Data
public class ExpenseRequest {

    private Long vehicleId;

    private String category;

    private Double amount;

    private String date;

    private String description;

    private String referenceId;
}
