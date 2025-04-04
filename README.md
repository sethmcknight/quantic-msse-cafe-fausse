# Café Fausse - Fine Dining Restaurant Website

A full-stack web application for Café Fausse, an elegant fine-dining establishment. This project was developed for the Quantic MSSE Cohort 66 Web Application & Interface Design course.

![Café Fausse Logo](frontend/public/logo192.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Environment Variables](#environment-variables)
  - [Test Login Credentials](#test-login-credentials)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [UI/UX Design](#uiux-design)
- [Development Process](#development-process)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [License](#license)

## 🌟 Overview

Café Fausse is a fine dining restaurant that needed a modern website to showcase their menu, allow customers to make reservations, and highlight their awards and customer testimonials. This web application provides a seamless user experience across desktop and mobile devices, with an intuitive interface that matches the elegant atmosphere of the restaurant.

## ✨ Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices using CSS Grid
- **Interactive Menu**: Categorized menu items with descriptions, prices, and dietary information
- **Reservation System**: Allows customers to check availability and book tables in real time
- **Newsletter Signup**: Email subscription form with backend integration and validation
- **Photo Gallery**: Lightbox gallery showcasing restaurant ambiance and dishes
- **Awards & Reviews**: Display of restaurant accolades and customer testimonials
- **Notification System**: Real-time feedback for user actions throughout the site

## 🛠️ Technology Stack

### Frontend
- **React**: UI library with JSX for component-based development
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **React Router**: Navigation and routing between pages
- **CSS Grid**: Responsive layout system for consistent design across devices
- **Context API**: State management for sharing data across components

### Backend
- **Flask**: Python web framework for building the API
- **PostgreSQL**: Relational database for storing reservation and customer data
- **SQLAlchemy**: ORM for database interactions
- **Flask-Migrate**: Database migration management
- **Flask-CORS**: Cross-Origin Resource Sharing support

### Project Constraints
- The front-end must be built using React and JSX
- Styling employs CSS Grid for responsive design
- The back-end utilizes Flask with a PostgreSQL database
- The website functions consistently across major browsers and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+) and npm
- Python (v3.8+) and pip
- PostgreSQL (v13+)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file in the backend directory (see Environment Variables section)

5. Create the PostgreSQL database:
   ```bash
   createdb cafe_fausse_dev
   ```

6. Initialize the database with sample data:
   ```bash
   python init_db.py
   ```

7. Start the Flask server:
   ```bash
   # Development mode
   python run_dev.py
   
   # Production mode
   python run_prod.py
   ```

8. The backend API will be available at [http://localhost:5001](http://localhost:5001)


### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the frontend directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   For production build:
   ```bash
   npm run build
   ```

5. The frontend will be available at [http://localhost:3000](http://localhost:3000)

### Environment Variables

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
```

#### Backend (.env)
```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://localhost/cafe_fausse_dev
SECRET_KEY=your_secret_key_here
```

### Test Login Credentials

After running the database initialization, you can use these credentials to log into the admin panel:

#### Admin User
- **Username**: admin
- **Password**: admin123
- **Role**: admin (full access to all admin features)

#### Manager User
- **Username**: manager
- **Password**: manager123
- **Role**: manager (access to management features)

To access the admin panel, navigate to: `http://localhost:3000/admin/login`

## 📁 Project Structure

```
cafe-fausse/
├── frontend/               # React frontend application
│   ├── public/             # Static files
│   └── src/                # Source code
│       ├── assets/         # Images and resources
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context API providers
│       ├── pages/          # Page components
│       ├── styles/         # CSS styles
│       └── utils/          # Utility functions and API clients
│
├── backend/                # Flask backend application
│   ├── api/                # API endpoints
│   │   ├── menu.py         # Menu-related endpoints
│   │   ├── newsletter.py   # Newsletter subscription endpoints
│   │   └── reservations.py # Reservation endpoints
│   ├── config/             # Configuration settings
│   ├── models/             # Database models
│   │   ├── base.py         # Base model class
│   │   ├── category.py     # Menu category model
│   │   ├── customer.py     # Customer model
│   │   ├── menu_item.py    # Menu item model
│   │   ├── newsletter.py   # Newsletter subscription model
│   │   └── reservation.py  # Reservation model
│   ├── services/           # Business logic
│   ├── tests/              # Unit and integration tests
│   └── utils/              # Helper functions
│
└── README.md               # This file
```

## 📡 API Documentation

### Reservation Endpoints

- **POST** `/api/reservations` - Create a new reservation
  - Request: 
    ```json
    { 
      "name": "John Doe",
      "email": "john@example.com",
      "date": "2025-04-15",
      "time": "19:00",
      "guests": 4,
      "phone": "202-555-1234",
      "special_requests": "Window seat preferred"
    }
    ```
  - Response: 
    ```json
    { 
      "success": true,
      "message": "Reservation confirmed",
      "reservation_id": 123,
      "table_number": 5
    }
    ```

- **POST** `/api/reservations/check-availability` - Check table availability
  - Request: 
    ```json
    { 
      "date": "2025-04-15",
      "time": "19:00",
      "guests": 4
    }
    ```
  - Response: 
    ```json
    { 
      "available": true,
      "tables_remaining": 12
    }
    ```

### Newsletter Endpoints

- **POST** `/api/newsletter/subscribe` - Subscribe to newsletter
  - Request: 
    ```json
    { 
      "email": "customer@example.com"
    }
    ```
  - Response: 
    ```json
    { 
      "success": true,
      "message": "Successfully subscribed to the newsletter"
    }
    ```

- **POST** `/api/newsletter/unsubscribe` - Unsubscribe from newsletter
  - Request: 
    ```json
    { 
      "email": "customer@example.com"
    }
    ```
  - Response: 
    ```json
    { 
      "success": true,
      "message": "Successfully unsubscribed from the newsletter"
    }
    ```

### Menu Endpoints

- **GET** `/api/menu/categories` - Get all menu categories
  - Response:
    ```json
    {
      "success": true,
      "categories": [
        {
          "id": 1,
          "name": "Starters",
          "description": "Perfect beginnings to your meal"
        },
        {...}
      ]
    }
    ```

- **GET** `/api/menu/items` - Get all menu items
  - Response:
    ```json
    {
      "success": true,
      "items": [
        {
          "id": 1,
          "name": "Bruschetta",
          "description": "Fresh tomatoes, basil, olive oil, and toasted baguette slices",
          "price": 8.50,
          "category_id": 1,
          "is_vegetarian": true,
          "is_vegan": false,
          "is_gluten_free": false,
          "image_url": "/images/bruschetta.jpg"
        },
        {...}
      ]
    }
    ```

- **GET** `/api/menu/categories/:id/items` - Get items for a specific category
  - Response: Same format as the items endpoint but filtered by category

## 🎨 UI/UX Design

The website features a clean, elegant design that matches the fine dining experience of Café Fausse. Key design elements include:

- **Color Scheme**: Rich, warm colors that evoke a sophisticated dining atmosphere
- **Typography**: Classic, readable fonts that maintain elegance across devices
- **Navigation**: Intuitive menu with clear pathways to all sections
- **Responsive Design**: CSS Grid layout that adapts beautifully to all screen sizes
- **Form Design**: Clean, user-friendly forms with real-time validation feedback
- **Notification System**: Non-intrusive notifications that provide feedback on user actions

## 🔧 Development Process

The application was developed using a component-based approach with React:

1. **Planning Phase**:
   - Analyzed the Software Requirements Specification (SRS)
   - Created wireframes for all pages
   - Designed the database schema
   - Planned API endpoints

2. **Frontend Development**:
   - Set up React with TypeScript
   - Created reusable components
   - Implemented responsive CSS Grid layouts
   - Set up Context API for state management
   - Built forms with validation
   - Created API utility functions

3. **Backend Development**:
   - Set up Flask application structure
   - Defined SQLAlchemy models
   - Implemented API endpoints
   - Created database management scripts
   - Added authentication and security measures

4. **Integration**:
   - Connected frontend forms to backend API
   - Implemented error handling
   - Added loading states
   - Ensured cross-browser compatibility

5. **Testing**:
   - Tested API endpoints
   - Verified form validation
   - Confirmed responsive design across devices
   - Validated data persistence

## 👥 Contributors

- Seth McKnight - MSSE Cohort 66
- Toby Pasquale - MSSE Cohort 66

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
