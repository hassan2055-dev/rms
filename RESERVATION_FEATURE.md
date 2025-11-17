# Reservation Feature Documentation

## Overview
The reservation feature allows customers to reserve tables at the restaurant by entering a reservation code received after payment.

## Features Implemented

### Frontend Components

#### 1. Reservation Page (`src/pages/Reservation.jsx`)
- Displays all available tables in a grid layout
- Shows table status (Available/Reserved)
- Allows customers to click on available tables
- Modal dialog for entering reservation details
- Real-time validation and feedback

#### 2. Navigation Integration
- **Navbar**: Added "Reserve Table" button with Calendar icon (visible to all users)
- **Sidebar**: Added "Reservations" link for admin and cashier roles

#### 3. Routing
- Added `/reservation` route in `App.jsx` (publicly accessible)

### Backend API Endpoints

#### 1. GET `/api/tables`
- Returns all tables with their reservation status
- Shows customer information for reserved tables

#### 2. POST `/api/reservations`
- Creates a new reservation
- Validates reservation code
- Creates customer entry if doesn't exist
- Links reservation to customer and table

**Request Body:**
```json
{
  "tableId": 1,
  "reservationCode": "RES1",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Table reserved successfully",
  "reservation": {
    "id": 1,
    "tableId": 1,
    "customerId": 1,
    "customerName": "John Doe"
  }
}
```

#### 3. DELETE `/api/reservations/{id}`
- Cancels an existing reservation
- Frees up the table

### Database Schema

The feature utilizes existing tables:
- **restaurant_table**: Stores table information (12 tables initialized by default)
- **customer**: Stores customer details (CustomerID, CustomerName)
- **reservation**: Links customers to reserved tables

### Reservation Code System

For demonstration purposes, the reservation code follows this pattern:
- Format: `RES{TableID}`
- Examples: `RES1`, `RES2`, `RES3`, etc.

**Note**: In production, this should be replaced with secure randomly-generated codes sent via email/SMS after payment confirmation.

## User Flow

1. Customer clicks "Reserve Table" in the navbar
2. Customer views all available tables on the Reservation page
3. Customer clicks on an available table
4. Modal opens requesting:
   - Customer Name
   - Reservation Code
5. System validates the code
6. If valid:
   - Creates customer entry (or retrieves existing)
   - Creates reservation record
   - Updates table status to "Reserved"
7. Customer receives confirmation message

## Color Coding

- **Green**: Available tables (can be reserved)
- **Amber/Orange**: Reserved tables (cannot be reserved)

## API Service Methods

Added to `src/services/apiService.js`:
- `getTables()`: Fetches all tables with status
- `makeReservation(data)`: Creates a reservation
- `cancelReservation(id)`: Cancels a reservation

## Testing the Feature

### Test Reservation Codes:
- Table 1: `RES1`
- Table 2: `RES2`
- Table 3: `RES3`
- ... up to Table 12: `RES12`

### Steps:
1. Start the backend: `python backend/app.py`
2. Start the frontend: `npm run dev`
3. Navigate to `/reservation`
4. Click on any available table
5. Enter your name and the code (e.g., `RES1` for Table 1)
6. Click "Confirm Reservation"

## Future Enhancements

1. **Payment Integration**: Connect to payment gateway for reservation fees
2. **Code Generation**: Implement secure random code generation
3. **Email/SMS Notifications**: Send codes to customers via email/SMS
4. **Time Slots**: Add time-based reservations
5. **Cancellation**: Allow customers to cancel reservations
6. **Admin Management**: Admin dashboard to view/manage all reservations
7. **Reservation History**: Track past reservations per customer
8. **Capacity Management**: Set maximum capacity per table
