package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExpenseResponse {

    private Long id;

    private Long vehicleId;

    private String vehicleNumber;

    private String category;

    private Double amount;

    private String date;

    private String description;

    private String referenceId;
}
