# API Documentation - Hotel Management System

Base URL: `https://dev.kacc.mn/api/`

---

## API Usage by Page

### **Login Page**
- `/EmployeeLogin/` (POST)
- `/properties/{id}` (GET)

### **Register Page**
- `/properties/create/` (POST)
- `/EmployeeRegister/` (POST)
- `/combined-data/` (GET)

### **Hotel Registration - Step 1: Basic Info**
- `/combined-data/` (GET)
- `/property-basic-info/` (GET)
- `/property-basic-info/` (POST/PUT)

### **Hotel Registration - Step 2: Address**
- `/combined-data/` (GET)
- `/confirm-address/` (GET)
- `/confirm-address/` (POST/PUT)

### **Hotel Registration - Step 3: Google Map**
- `/confirm-address/` (POST/PUT)

### **Hotel Registration - Step 4: Policies**
- `/property-policies/` (GET)
- `/property-policies/` (POST/PUT)

### **Hotel Registration - Step 5: Images**
- `/property-images/` (GET)
- `/property-images/` (POST)
- `/property-images/{id}/` (DELETE)

### **Hotel Registration - Step 6: Details**
- `/combined-data/` (GET)
- `/property-details/` (GET)
- `/property-details/` (POST/PUT)

### **Hotel Admin Dashboard**
- `/properties/{id}` (GET)
- `/property-basic-info/` (GET)
- `/property-policies/` (GET)
- `/combined-data/` (GET)
- `/property-images/` (GET)
- `/property-details/` (GET)

### **Hotel Info Tabs**
- `/property-details/` (GET)
- `/property-policies/` (GET)
- `/confirm-address/` (GET)
- `/property-basic-info/` (GET)
- `/combined-data/` (GET)
- `/properties/{id}` (GET)
- `/property-images/` (GET)
- `/additionalInfo/{id}` (GET)

### **About Hotel Tab**
- `/additionalInfo/` (POST)
- `/property-details/{id}/` (PATCH)

### **Services Tab**
- `/combined-data/` (GET)

### **FAQ Tab**
- `/faqs/` (GET)

### **Room Management Page**
- `/all-data/` (GET)
- `/roomsNew/` (GET) *requires token*
- `/roomsNew/` (POST) *requires token*
- `/roomsNew/{id}/` (PUT) *requires token*
- `/roomsNew/{id}/` (DELETE) *requires token*

### **Room Price Management**
- `/all-data/` (GET)
- `/roomsNew/` (GET) *requires token*
- `/room-prices/` (GET)
- `/room-prices/` (POST) *requires token*
- `/room-prices/{id}/` (PUT) *requires token*
- `/room-prices/{id}/` (DELETE) *requires token*

### **Price Settings Page**
- `/all-data/` (GET)
- `/roomsNew/` (GET) *requires token*
- `/pricesettings/` (GET)
- `/pricesettings/` (POST)
- `/pricesettings/{id}/` (PUT)
- `/pricesettings/{id}/` (DELETE)

### **Create Employee Page**
- `/EmployeeRegister/` (POST)

### **SuperAdmin Dashboard**
- `/all-owners/` (GET)
- `/approve_user/` (POST)

### **User Profile Component**
- `/user-types/` (GET)

---

## Total APIs: 24 endpoints
- **GET APIs**: 16
- **POST APIs**: 5
- **PUT APIs**: 1
- **PATCH APIs**: 1
- **DELETE APIs**: 1

---

## Notes

**Authentication Required:**
- All `/roomsNew/` and `/room-prices/` endpoints require token: `?token={token}`

**Common Query Parameters:**
- `?property={hotelId}` - Filter by hotel
- `?hotel={hotelId}` - Filter by hotel
- `?token={token}` - Authentication token
