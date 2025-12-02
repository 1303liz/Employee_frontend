# Employee Management System - Frontend

A modern React-based frontend application for managing employees, leaves, and attendance.

## Features

- **Authentication**: Secure login and registration
- **Employee Management**: Add, edit, view, and manage employees
- **Leave Management**: Apply for leaves and manage leave requests (HR)
- **Attendance Tracking**: Check in/out and view attendance records
- **Role-Based Access**: Different features for HR and regular employees
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool

## Project Structure

```
employee-frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── EmployeeCard.jsx
│   │   └── Loader.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── employees/
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── AddEmployee.jsx
│   │   │   └── EditEmployee.jsx
│   │   ├── leaves/
│   │   │   ├── LeaveList.jsx
│   │   │   ├── ApplyLeave.jsx
│   │   │   └── ManageLeave.jsx
│   │   ├── attendance/
│   │   │   ├── AttendanceList.jsx
│   │   │   └── MarkAttendance.jsx
│   │   └── Dashboard.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── employeeService.js
│   │   ├── leaveService.js
│   │   ├── attendanceService.js
│   │   └── authService.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── validators.js
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (default: http://localhost:5000)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd employee-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features by Role

### Employee
- View dashboard
- Mark attendance (check in/out)
- View personal attendance records
- Apply for leaves
- View leave history

### HR
- All employee features
- Add new employees
- Edit employee information
- View all employees
- Approve/reject leave requests
- View all attendance records

## API Integration

The application connects to the backend API through axios instances configured in `src/services/api.js`. All API calls include JWT token authentication automatically.

### API Endpoints Used

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /employees` - Get all employees
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `GET /leaves` - Get leaves
- `POST /leaves` - Apply leave
- `PUT /leaves/:id` - Update leave status
- `GET /attendance` - Get attendance
- `POST /attendance/check-in` - Check in
- `POST /attendance/check-out` - Check out

## Authentication

The application uses JWT tokens for authentication:
- Tokens are stored in localStorage
- Automatically included in API requests via axios interceptors
- Protected routes redirect to login if not authenticated
- Role-based access control for HR-specific features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository.
