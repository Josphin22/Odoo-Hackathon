package com.transitops.config;

import com.transitops.entity.*;
import com.transitops.enums.RoleName;
import com.transitops.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initRolesAndData(RoleRepository roleRepository,
                                       UserRepository userRepository,
                                       VehicleRepository vehicleRepository,
                                       DriverRepository driverRepository,
                                       TripRepository tripRepository,
                                       MaintenanceLogRepository maintenanceLogRepository,
                                       FuelLogRepository fuelLogRepository,
                                       ExpenseRepository expenseRepository,
                                       PermissionRepository permissionRepository,
                                       CompanySettingRepository companySettingRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Seed Permissions
            Map<String, List<String>> permissionMatrix = new LinkedHashMap<>();
            permissionMatrix.put("VEHICLES", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
            permissionMatrix.put("DRIVERS", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
            permissionMatrix.put("TRIPS", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE", "DISPATCH", "COMPLETE", "CANCEL"));
            permissionMatrix.put("MAINTENANCE", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
            permissionMatrix.put("FUEL", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
            permissionMatrix.put("EXPENSES", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
            permissionMatrix.put("REPORTS", Arrays.asList("READ", "EXPORT"));
            permissionMatrix.put("USERS", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
            permissionMatrix.put("ROLES", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
            permissionMatrix.put("AUDIT_LOGS", Arrays.asList("READ"));
            permissionMatrix.put("SETTINGS", Arrays.asList("READ", "UPDATE"));

            Map<String, Permission> seededPermissions = new HashMap<>();
            for (Map.Entry<String, List<String>> entry : permissionMatrix.entrySet()) {
                String module = entry.getKey();
                for (String action : entry.getValue()) {
                    String key = module + "_" + action;
                    Permission perm = permissionRepository.findByModuleAndAction(module, action)
                            .stream().findFirst()
                            .orElseGet(() -> {
                                Permission newPerm = Permission.builder()
                                        .module(module)
                                        .action(action)
                                        .build();
                                return permissionRepository.save(newPerm);
                            });
                    seededPermissions.put(key, perm);
                }
            }

            // 2. Seed Roles and Map Permissions
            for (RoleName roleName : RoleName.values()) {
                Role role = roleRepository.findByName(roleName.name())
                        .orElseGet(() -> {
                            Role newRole = Role.builder()
                                    .name(roleName.name())
                                    .isSystemRole(true)
                                    .build();
                            return roleRepository.save(newRole);
                        });

                Set<Permission> rolePerms = new HashSet<>();
                if (roleName == RoleName.ADMIN) {
                    rolePerms.addAll(seededPermissions.values());
                } else if (roleName == RoleName.FLEET_MANAGER) {
                    addPermissionsToRole(rolePerms, seededPermissions, "VEHICLES", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
                    addPermissionsToRole(rolePerms, seededPermissions, "DRIVERS", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
                    addPermissionsToRole(rolePerms, seededPermissions, "TRIPS", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE", "DISPATCH", "COMPLETE", "CANCEL"));
                    addPermissionsToRole(rolePerms, seededPermissions, "MAINTENANCE", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
                    addPermissionsToRole(rolePerms, seededPermissions, "FUEL", Arrays.asList("READ", "CREATE"));
                    addPermissionsToRole(rolePerms, seededPermissions, "EXPENSES", Arrays.asList("READ"));
                    addPermissionsToRole(rolePerms, seededPermissions, "REPORTS", Arrays.asList("READ", "EXPORT"));
                    addPermissionsToRole(rolePerms, seededPermissions, "SETTINGS", Arrays.asList("READ"));
                } else if (roleName == RoleName.DISPATCHER) {
                    addPermissionsToRole(rolePerms, seededPermissions, "TRIPS", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE", "DISPATCH", "COMPLETE", "CANCEL"));
                    addPermissionsToRole(rolePerms, seededPermissions, "VEHICLES", Arrays.asList("READ"));
                    addPermissionsToRole(rolePerms, seededPermissions, "DRIVERS", Arrays.asList("READ"));
                } else if (roleName == RoleName.SAFETY_OFFICER) {
                    addPermissionsToRole(rolePerms, seededPermissions, "DRIVERS", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
                    addPermissionsToRole(rolePerms, seededPermissions, "VEHICLES", Arrays.asList("READ"));
                    addPermissionsToRole(rolePerms, seededPermissions, "REPORTS", Arrays.asList("READ"));
                } else if (roleName == RoleName.FINANCIAL_ANALYST) {
                    addPermissionsToRole(rolePerms, seededPermissions, "FUEL", Arrays.asList("READ", "CREATE"));
                    addPermissionsToRole(rolePerms, seededPermissions, "EXPENSES", Arrays.asList("READ", "CREATE", "UPDATE", "DELETE"));
                    addPermissionsToRole(rolePerms, seededPermissions, "REPORTS", Arrays.asList("READ", "EXPORT"));
                } else if (roleName == RoleName.DRIVER) {
                    addPermissionsToRole(rolePerms, seededPermissions, "TRIPS", Arrays.asList("READ"));
                    addPermissionsToRole(rolePerms, seededPermissions, "FUEL", Arrays.asList("READ", "CREATE"));
                }

                role.setPermissions(rolePerms);
                roleRepository.save(role);
                System.out.println("Role " + roleName + " permissions initialized.");
            }

            // 3. Seed Users (idempotently based on email)
            User uManu = seedUser(userRepository, roleRepository, passwordEncoder, "TOPS-EMP-0001", "Manu", "manu@transitops.com", "Manu@123", RoleName.ADMIN, "Administration", "+91-9999912345");
            seedUser(userRepository, roleRepository, passwordEncoder, "TOPS-EMP-0002", "Josphin", "josphin@transitops.com", "Josphin@123", RoleName.FLEET_MANAGER, "Fleet Operations", "+91-9999923456");
            seedUser(userRepository, roleRepository, passwordEncoder, "TOPS-EMP-0003", "RajShree", "rajshree@transitops.com", "RajShree@123", RoleName.DISPATCHER, "Logistics Dispatch", "+91-9999934567");
            seedUser(userRepository, roleRepository, passwordEncoder, "TOPS-EMP-0004", "Kokil", "kokil@transitops.com", "Kokil@123", RoleName.SAFETY_OFFICER, "Safety Compliance", "+91-9999945678");
            seedUser(userRepository, roleRepository, passwordEncoder, "TOPS-EMP-0005", "Akil", "akil@transitops.com", "Akil@123", RoleName.FINANCIAL_ANALYST, "Finance Ledger", "+91-9999956789");
            User uSurya = seedUser(userRepository, roleRepository, passwordEncoder, "TOPS-EMP-0006", "Surya", "surya@transitops.com", "Surya@123", RoleName.DRIVER, "Logistics Delivery", "+91-9999967890");

            // 4. Seed Singleton Company Settings
            if (companySettingRepository.count() == 0) {
                CompanySetting config = CompanySetting.builder()
                        .id(1L) // Singleton ID
                        .companyName("TransitOps Logistics Private Limited")
                        .logo("/assets/logo.png")
                        .gstNumber("33AAAAA1111A1Z1")
                        .panNumber("AAAAA1111A")
                        .transportLicenseNo("TOPS-TN-TL-2026")
                        .address("100, Mount Road, Guindy, Chennai - 600032")
                        .phoneNumber("+91-44-22334455")
                        .email("info@transitops.com")
                        .website("www.transitops.com")
                        .workingHours("9:00 AM - 6:00 PM")
                        .timezone("Asia/Kolkata")
                        .currency("INR")
                        .fiscalYear("2026-2027")
                        .defaultFuelPrice(102.50)
                        .defaultMaintenanceInterval(5000)
                        .build();
                companySettingRepository.save(config);
                System.out.println("Singleton Company Profile seeded.");
            }

            // Seed only if no vehicles exist
            if (vehicleRepository.count() == 0) {
                System.out.println("Seeding operational transport data (Vehicles, Drivers, Trips, Logs)...");

                // 5. Seed Vehicles
                Vehicle v1 = saveVehicle(vehicleRepository, "TN-09-AB-1205", "Tata Ace Gold", "Mini Truck", 1000, 12000, 500000.0, "Chennai", "Available");
                Vehicle v2 = saveVehicle(vehicleRepository, "TN-22-CD-4587", "Ashok Leyland Dost", "Box Truck", 2000, 24000, 750000.0, "Madurai", "Available");
                Vehicle v3 = saveVehicle(vehicleRepository, "TN-14-EF-7782", "Mahindra Bolero Pickup", "Pickup", 2500, 35000, 850000.0, "Coimbatore", "Available");
                Vehicle v4 = saveVehicle(vehicleRepository, "TN-18-GH-9921", "Tata Intra V30", "Box Truck", 1500, 18000, 680000.0, "Trichy", "Available");
                Vehicle v5 = saveVehicle(vehicleRepository, "TN-33-JK-3410", "Eicher Pro 2049", "Light Truck", 5000, 52000, 1500000.0, "Salem", "Available");
                Vehicle v6 = saveVehicle(vehicleRepository, "TN-67-LM-8456", "BharatBenz 1217R", "Heavy Truck", 12000, 85000, 2800000.0, "Tirunelveli", "Available");
                Vehicle v7 = saveVehicle(vehicleRepository, "TN-45-NP-2178", "Tata Signa", "Semi-Trailer", 28000, 115000, 4200000.0, "Erode", "Available");
                Vehicle v8 = saveVehicle(vehicleRepository, "TN-10-QR-6543", "Ashok Leyland Partner", "Light Truck", 4000, 48000, 1200000.0, "Vellore", "In Shop");
                Vehicle v9 = saveVehicle(vehicleRepository, "TN-28-ST-1189", "Mahindra Blazo", "Heavy Truck", 16000, 95000, 3200000.0, "Tuticorin", "On Trip");
                Vehicle v10 = saveVehicle(vehicleRepository, "TN-72-UV-9034", "Eicher Pro 3015", "Heavy Truck", 14000, 72000, 2400000.0, "Karur", "Retired");

                // 6. Seed Drivers (linked to Employee Accounts if possible)
                Driver d1 = saveDriver(driverRepository, "Arun Kumar", "DL-TN01-1001", "Class A CDL", LocalDate.of(2027, 12, 31), "+91-9840012345", 92, "Available", null);
                Driver d2 = saveDriver(driverRepository, "Praveen", "DL-TN02-2002", "Class A CDL", LocalDate.of(2028, 6, 30), "+91-9840023456", 88, "Available", null);
                Driver d3 = saveDriver(driverRepository, "Santhosh", "DL-TN03-3003", "Class B CDL", LocalDate.of(2026, 8, 15), "+91-9840034567", 95, "Available", null);
                Driver d4 = saveDriver(driverRepository, "Karthick", "DL-TN04-4004", "Class A CDL", LocalDate.of(2029, 3, 20), "+91-9840045678", 91, "Available", null);
                Driver d5 = saveDriver(driverRepository, "Dinesh", "DL-TN05-5005", "Class B CDL", LocalDate.of(2027, 9, 10), "+91-9840056789", 86, "Available", null);
                Driver d6 = saveDriver(driverRepository, "Naveen", "DL-TN06-6006", "Class A CDL", LocalDate.of(2028, 5, 25), "+91-9840067890", 94, "Available", null);
                Driver d7 = saveDriver(driverRepository, "Vignesh", "DL-TN07-7007", "Class A CDL", LocalDate.of(2027, 11, 15), "+91-9840078901", 90, "Available", null);
                Driver d8 = saveDriver(driverRepository, "Hari", "DL-TN08-8008", "Class C CDL", LocalDate.of(2029, 1, 10), "+91-9840089012", 85, "Available", null);
                
                // Surya is a system employee with DRIVER role, let's link Surya's employee account to Surya's Driver profile!
                Driver d9 = saveDriver(driverRepository, "Surya", "DL-TN09-9009", "Class A CDL", LocalDate.of(2028, 4, 18), "+91-9840090123", 93, "On Trip", uSurya);
                
                Driver d10 = saveDriver(driverRepository, "Balaji", "DL-TN10-0010", "Class A CDL", LocalDate.of(2029, 12, 1), "+91-9840001234", 45, "Suspended", null);
                Driver dJohn = saveDriver(driverRepository, "John Doe", "DL-99887C", "Class C CDL", LocalDate.of(2026, 2, 10), "+1-555-0121", 72, "Available", null);

                // 7. Seed Trips
                saveTrip(tripRepository, "TRIP-1001", "Chennai", "Coimbatore", v1, d1, 800.0, 500.0, 500.0, 40.0, "Completed", LocalDate.of(2026, 7, 1).toString());
                saveTrip(tripRepository, "TRIP-1002", "Madurai", "Trichy", v2, d2, 1500.0, 140.0, 140.0, 12.0, "Completed", LocalDate.of(2026, 7, 3).toString());
                saveTrip(tripRepository, "TRIP-1003", "Salem", "Chennai", v3, d3, 2000.0, 340.0, 340.0, 30.0, "Completed", LocalDate.of(2026, 7, 5).toString());
                saveTrip(tripRepository, "TRIP-1004", "Erode", "Tirunelveli", v4, d4, 1200.0, 380.0, 380.0, 32.0, "Completed", LocalDate.of(2026, 7, 7).toString());
                saveTrip(tripRepository, "TRIP-1005", "Vellore", "Madurai", v5, d5, 4000.0, 420.0, 420.0, 45.0, "Completed", LocalDate.of(2026, 7, 9).toString());
                saveTrip(tripRepository, "TRIP-1006", "Chennai", "Bangalore", v6, d6, 10000.0, 350.0, 350.0, 70.0, "Completed", LocalDate.of(2026, 7, 10).toString());
                saveTrip(tripRepository, "TRIP-1007", "Coimbatore", "Chennai", v7, d7, 22000.0, 510.0, 510.0, 170.0, "Completed", LocalDate.of(2026, 7, 11).toString());
                saveTrip(tripRepository, "TRIP-1008", "Tuticorin", "Madurai", v9, d9, 15000.0, 160.0, null, null, "Dispatched", LocalDate.of(2026, 7, 12).toString());

                // 8. Seed Maintenance Logs
                saveMaintenanceLog(maintenanceLogRepository, v1, "Oil Change", "Standard engine oil service", 1500.0, LocalDate.of(2026, 6, 20), LocalDate.of(2026, 6, 20), "Completed");
                saveMaintenanceLog(maintenanceLogRepository, v2, "Brake Service", "Brake pad replacement", 3500.0, LocalDate.of(2026, 6, 25), LocalDate.of(2026, 6, 25), "Completed");
                saveMaintenanceLog(maintenanceLogRepository, v8, "Clutch Replacement", "Full clutch kit change", 12000.0, LocalDate.of(2026, 7, 10), null, "In Progress");

                // 9. Seed Fuel Logs
                FuelLog f1 = saveFuelLog(fuelLogRepository, v1, d1, LocalDate.of(2026, 7, 1), 40.0, 3800.0, 12000);
                FuelLog f2 = saveFuelLog(fuelLogRepository, v2, d2, LocalDate.of(2026, 7, 3), 12.0, 1140.0, 24000);
                FuelLog f3 = saveFuelLog(fuelLogRepository, v3, d3, LocalDate.of(2026, 7, 5), 30.0, 2850.0, 35000);
                FuelLog f4 = saveFuelLog(fuelLogRepository, v4, d4, LocalDate.of(2026, 7, 7), 32.0, 3040.0, 18000);
                FuelLog f5 = saveFuelLog(fuelLogRepository, v5, d5, LocalDate.of(2026, 7, 9), 45.0, 4275.0, 52000);

                // 10. Seed Expenses
                saveExpense(expenseRepository, v1, "Fuel", 3800.0, LocalDate.of(2026, 7, 1), "Automated fuel cost registration for Fuel Log #" + f1.getId(), "FUEL-" + f1.getId());
                saveExpense(expenseRepository, v2, "Fuel", 1140.0, LocalDate.of(2026, 7, 3), "Automated fuel cost registration for Fuel Log #" + f2.getId(), "FUEL-" + f2.getId());
                saveExpense(expenseRepository, v3, "Fuel", 2850.0, LocalDate.of(2026, 7, 5), "Automated fuel cost registration for Fuel Log #" + f3.getId(), "FUEL-" + f3.getId());
                saveExpense(expenseRepository, v4, "Fuel", 3040.0, LocalDate.of(2026, 7, 7), "Automated fuel cost registration for Fuel Log #" + f4.getId(), "FUEL-" + f4.getId());
                saveExpense(expenseRepository, v5, "Fuel", 4275.0, LocalDate.of(2026, 7, 9), "Automated fuel cost registration for Fuel Log #" + f5.getId(), "FUEL-" + f5.getId());

                saveExpense(expenseRepository, v1, "Tolls", 500.0, LocalDate.of(2026, 7, 1), "National highway tolls", null);
                saveExpense(expenseRepository, v2, "Tolls", 180.0, LocalDate.of(2026, 7, 3), "National highway tolls", null);
                saveExpense(expenseRepository, v3, "Insurance", 15000.0, LocalDate.of(2026, 7, 5), "Annual insurance renewal", null);
                saveExpense(expenseRepository, v4, "Permit Fees", 2500.0, LocalDate.of(2026, 7, 7), "State transport permit fees", null);
                saveExpense(expenseRepository, v8, "Maintenance", 12000.0, LocalDate.of(2026, 7, 10), "Clutch replacement charge", null);
                saveExpense(expenseRepository, v1, "Maintenance", 1500.0, LocalDate.of(2026, 6, 20), "Oil Change service charge", null);
                saveExpense(expenseRepository, v2, "Maintenance", 3500.0, LocalDate.of(2026, 6, 25), "Brake Service charge", null);

                System.out.println("Operational transport data seeding complete.");
            }
        };
    }

    private void addPermissionsToRole(Set<Permission> rolePerms, Map<String, Permission> seededPermissions,
                                       String module, List<String> actions) {
        for (String action : actions) {
            Permission perm = seededPermissions.get(module + "_" + action);
            if (perm != null) {
                rolePerms.add(perm);
            }
        }
    }

    private User seedUser(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
                          String empId, String fullName, String email, String password, RoleName roleName, String dept, String phone) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            Role role = roleRepository.findByName(roleName.name())
                    .orElseThrow(() -> new IllegalStateException("Role " + roleName + " not found."));
            User user = User.builder()
                    .employeeId(empId)
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .department(dept)
                    .phoneNumber(phone)
                    .status("ACTIVE")
                    .dob(LocalDate.of(1990, 5, 15))
                    .emergencyContact("+91-9999900000")
                    .bloodGroup("O+")
                    .nationality("Indian")
                    .isDeleted(false)
                    .failedLoginAttempts(0)
                    .isLocked(false)
                    .forcePasswordChange(false)
                    .build();
            return userRepository.save(user);
        });
    }

    private Vehicle saveVehicle(VehicleRepository repository, String regNo, String name, String type,
                                 Integer maxCap, Integer odom, Double cost, String region, String status) {
        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber(regNo)
                .name(name)
                .vehicleType(type)
                .capacity(maxCap)
                .odometer(odom)
                .acquisitionCost(cost)
                .region(region)
                .status(status)
                .build();
        return repository.save(vehicle);
    }

    private Driver saveDriver(DriverRepository repository, String name, String licNo, String licCat,
                              LocalDate expiry, String phone, Integer safety, String status, User user) {
        Driver driver = Driver.builder()
                .fullName(name)
                .licenseNumber(licNo)
                .licenseCategory(licCat)
                .licenseExpiryDate(expiry)
                .phoneNumber(phone)
                .safetyScore(safety)
                .status(status)
                .user(user)
                .build();
        return repository.save(driver);
    }

    private void saveTrip(TripRepository repository, String tripNo, String source, String dest,
                          Vehicle vehicle, Driver driver, Double cargo, Double plannedDist, Double actualDist,
                          Double fuel, String status, String date) {
        Trip trip = Trip.builder()
                .tripNumber(tripNo)
                .source(source)
                .destination(dest)
                .vehicle(vehicle)
                .driver(driver)
                .cargoWeight(cargo)
                .plannedDistance(plannedDist)
                .actualDistance(actualDist)
                .fuelConsumed(fuel)
                .status(status)
                .tripDate(date)
                .createdAt(LocalDateTime.now())
                .build();
        repository.save(trip);
    }

    private void saveMaintenanceLog(MaintenanceLogRepository repository, Vehicle vehicle, String type,
                                     String desc, Double cost, LocalDate schedDate, LocalDate compDate, String status) {
        MaintenanceLog log = MaintenanceLog.builder()
                .vehicle(vehicle)
                .type(type)
                .description(desc)
                .cost(cost)
                .scheduledDate(schedDate)
                .completedDate(compDate)
                .status(status)
                .build();
        repository.save(log);
    }

    private FuelLog saveFuelLog(FuelLogRepository repository, Vehicle vehicle, Driver driver, LocalDate date,
                                Double liters, Double cost, Integer odometer) {
        FuelLog log = FuelLog.builder()
                .vehicle(vehicle)
                .driver(driver)
                .date(date)
                .liters(liters)
                .cost(cost)
                .odometer(odometer)
                .build();
        return repository.save(log);
    }

    private void saveExpense(ExpenseRepository repository, Vehicle vehicle, String cat, Double amt,
                             LocalDate date, String desc, String refId) {
        Expense expense = Expense.builder()
                .vehicle(vehicle)
                .category(cat)
                .amount(amt)
                .date(date)
                .description(desc)
                .referenceId(refId)
                .build();
        repository.save(expense);
    }
}