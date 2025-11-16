# 🍽️ Restaurant Management System

A modern, responsive Restaurant Management System UI built with **React** and **TailwindCSS**. This is a frontend-only project with no backend, using dummy data to simulate a complete restaurant management workflow.

## ✨ Features

### 🏠 Landing Page (Public)
- Restaurant homepage with hero section
- Sample menu showcase
- About section
- **Public Feedback Form** - Submit feedback without login
- **Staff Login** - For Admin and Cashier access

### 📊 Dashboard (Admin & Cashier)
- Summary cards with key metrics:
  - Total Sales
  - Total Orders
  - Top Selling Item
  - Total Feedback
- Weekly sales visualization
- Recent orders overview
- Customer feedback display

### 🍕 Menu Management (Admin Only)
- Complete CRUD operations for menu items
- Table view with all menu items
- Add, Edit, and Delete functionality
- Categories: Pizza, Burgers, Sides, Drinks, Salads, Appetizers, Desserts

### 💵 POS (Point of Sale) - Admin & Cashier
- Grid view of all menu items
- Category filtering
- Shopping cart functionality
- Quantity controls (increase/decrease)
- Real-time price calculation
- Bill generation
- Customer name input

### 📦 Orders Management (Admin & Cashier)
- Table view of all orders
- Order status management:
  - Pending
  - Preparing
  - Served
  - Cancelled
- Status filter functionality
- Order details view
- Delete orders

### 🧾 Billing (Admin & Cashier)
- All generated bills listing
- Bill details view
- Print bill functionality (preview)
- Payment method tracking (Cash/Card)
- Revenue statistics:
  - Total bills
  - Total revenue
  - Average bill amount

### 💬 Feedback (Public)
- View all customer feedback
- Rating system (1-5 stars)
- Submit new feedback
- No login required

## 🛠️ Tech Stack

- **React** - UI library
- **React Router** - Navigation and routing
- **TailwindCSS** - Styling and responsive design
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download the repository

2. Navigate to the project directory:
```bash
cd rms_3
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

## 👥 User Roles

### Admin
- Full access to all features
- Menu Management (Add/Edit/Delete items)
- POS (Point of Sale)
- Orders Management
- Billing
- Dashboard

### Cashier
- POS (Point of Sale)
- Orders Management
- Billing
- Dashboard

## 🔐 How to Login

1. On the landing page, click **"Staff Login"**
2. Enter any email and password (dummy authentication)
3. Select your role:
   - **Admin** - Full access
   - **Cashier** - Limited access (no menu management)
4. Click **"Login"**

### Demo Credentials
Since this uses dummy authentication, any email/password combination will work. Just select your desired role.

## 📁 Project Structure

```
rms_3/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx     # Top navigation bar
│   │   ├── Sidebar.jsx    # Side navigation menu
│   │   └── ProtectedRoute.jsx  # Route protection
│   │
│   ├── context/           # React Context
│   │   └── AuthContext.jsx    # Authentication state
│   │
│   ├── data/              # Dummy data
│   │   ├── menuData.js    # Menu items
│   │   ├── ordersData.js  # Orders
│   │   ├── billsData.js   # Bills
│   │   └── feedbackData.js # Customer feedback
│   │
│   ├── pages/             # Page components
│   │   ├── LandingPage.jsx    # Public homepage
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── MenuManagement.jsx # Menu CRUD
│   │   ├── POS.jsx           # Point of sale
│   │   ├── Orders.jsx        # Orders management
│   │   └── Billing.jsx       # Billing management
│   │
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
│
├── public/                # Static assets
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── README.md             # This file
```

## 🗂️ Dummy Data

All data is stored in the `src/data/` directory:

- **menuData.js** - 10 sample menu items across different categories
- **ordersData.js** - 5 sample orders with different statuses
- **billsData.js** - 3 sample bills
- **feedbackData.js** - 4 sample customer feedback entries

### Modifying Dummy Data

To add or modify dummy data:

1. Navigate to `src/data/`
2. Open the relevant data file
3. Add/modify the array of objects
4. The UI will automatically reflect the changes

Example - Adding a menu item:
```javascript
// src/data/menuData.js
export const menuData = [
  // ... existing items
  {
    id: 11,
    name: "Chocolate Cake",
    category: "Desserts",
    price: 6.99,
    description: "Rich chocolate cake with frosting"
  }
];
```

## 🎨 Features Breakdown

### State Management
- **AuthContext** - Manages user authentication and roles
- **Local State** - Each page manages its own data using React hooks

### Routing
- Public route: `/` (Landing Page)
- Protected routes (require login):
  - `/dashboard` - Dashboard
  - `/menu` - Menu Management (Admin only)
  - `/pos` - Point of Sale
  - `/orders` - Orders Management
  - `/billing` - Billing

### Responsive Design
- Mobile-friendly layout
- Responsive grid system
- Adaptive navigation

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Key Features

### No Backend Required
- All data stored in local state
- No API calls or database
- Perfect for demos and prototypes

### Role-Based Access
- Admin has full access
- Cashier has limited access
- Protected routes enforce permissions

### Interactive UI
- Real-time cart updates
- Dynamic status changes
- Instant feedback submission

## 🐛 Known Limitations

1. **No Persistence** - Data resets on page refresh
2. **No Real Authentication** - Accepts any credentials
3. **No Backend** - All operations are client-side only
4. **Print Functionality** - Shows alert preview instead of actual printing

## 🚀 Future Enhancements

- Add local storage for data persistence
- Implement real backend API
- Add PDF generation for bills
- Enhanced reporting and analytics
- Multi-language support
- Dark mode

## 📝 Notes

- This is a **UI-only** project for demonstration purposes
- All data is **dummy data** and not persistent
- Designed to showcase frontend development skills
- Built with modern React patterns and best practices

## 🤝 Contributing

This is a demo project. Feel free to fork and modify as needed.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Built with ❤️ using React and TailwindCSS

---

**Happy Coding! 🎉**
