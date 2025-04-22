# E-library Management System

A web-based library management system designed for educational institutions, specifically for Poblacion, Arayat Pampanga. The system allows teachers and students to access digital books while providing administrators with comprehensive management capabilities.

## Features

- **User Management**
  - Multiple user roles (Admin, Teacher, Student)
  - Secure authentication system
  - Role-specific access control
  - Teacher registration with Employee ID verification
  - Student registration with LRN (Learner Reference Number) verification

- **Book Management**
  - Digital book upload and storage
  - Support for multiple file formats (.pdf, .epub, .docx, .txt)
  - Book metadata management (title, author, year)
  - Search functionality with real-time highlighting
  - Easy-to-use interface for browsing books

- **Admin Dashboard**
  - User management interface
  - Book inventory control
  - User activity monitoring
  - System administration tools

## Technical Requirements

- Node.js
- MySQL Database
- Modern web browser
- Internet connection

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Import the database schema:
   ```bash
   mysql -u your_username -p your_database_name < library_db.sql
   ```

4. Configure the database connection in `server.js`:
   ```javascript
   const db = mysql.createConnection({
       host: "localhost",
       user: "root",
       password: "",
       database: "library_db"
   });
   ```

5. Start the server:
   ```bash
   node server.js
   ```

6. Access the application at `http://localhost:4000`

## Project Structure

```
E-library/
├── public/
│   ├── Images/         # Logo and image assets
│   ├── Styles/         # CSS stylesheets
│   ├── uploads/        # Uploaded book files
│   └── *.html          # Frontend pages
├── server.js           # Backend server
├── library_db.sql      # Database schema
└── package.json        # Project dependencies
```

## User Roles

1. **Admin**
   - Manage users and books
   - Add/edit/delete books
   - Monitor user activities
   - System configuration

2. **Teacher**
   - Access digital library
   - Download/read books
   - Unique Employee ID verification

3. **Student**
   - Access digital library
   - Download/read books
   - LRN-based authentication

## Security Features

- Password protection
- Role-based access control
- Unique identification verification (Employee ID/LRN)
- Session management
- Secure file upload handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
