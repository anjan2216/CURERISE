# CureRise Backend API

A comprehensive Flask-based REST API for the CureRise healthcare crowdfunding platform.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Patient Management**: CRUD operations for patient cases with filtering and pagination
- **Donation Processing**: Support for patient donations and food bank contributions
- **Hospital Management**: Verified hospital directory
- **Education Content**: Health education articles and resources
- **Admin Dashboard**: Administrative functions for platform management
- **Food Bank Support**: Nutrition support for patients and families

## Technology Stack

- **Framework**: Flask 2.3.3
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Authentication**: Flask-JWT-Extended
- **ORM**: SQLAlchemy
- **CORS**: Flask-CORS for cross-origin requests

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CureRise/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `PUT /api/auth/profile` - Update user profile (requires authentication)

### Patients
- `GET /api/patients` - Get all patients with filtering and pagination
- `GET /api/patients/<patient_id>` - Get specific patient details
- `POST /api/patients` - Create new patient (admin only)

### Donations
- `POST /api/donations` - Create a donation
- `PUT /api/donations/<donation_id>/confirm` - Confirm donation payment

### Food Bank
- `POST /api/food-bank/donations` - Create food bank donation
- `GET /api/food-bank/stats` - Get food bank statistics

### Hospitals
- `GET /api/hospitals` - Get all verified hospitals

### Education
- `GET /api/education` - Get education content
- `GET /api/education/<content_id>` - Get specific education article

### Admin
- `GET /api/admin/stats` - Get platform statistics (admin only)
- `GET /api/admin/patients` - Get all patients for admin (admin only)
- `PUT /api/admin/patients/<patient_id>/verify` - Verify patient (admin only)

### System
- `GET /api/health` - Health check endpoint
- `GET /` - API information and available endpoints

## Database Models

### User
- User authentication and profile information
- Admin role support
- Password hashing with Werkzeug

### Patient
- Patient case information
- Medical condition details
- Funding progress tracking
- Hospital association

### Hospital
- Verified hospital directory
- Location and contact information
- Patient associations

### Donation
- Patient donation tracking
- Payment status management
- Donor information (with anonymous option)

### FoodBankDonation
- Food bank contribution tracking
- Monthly and one-time donations
- Nutrition support metrics

### EducationContent
- Health education articles
- Categorized content
- Author and publication management

## Sample Data

The application automatically creates sample data on first run:

- **Default Admin User**: `admin@curerise.com` / `admin123`
- **Sample Hospitals**: 6 verified hospitals across major Indian cities
- **Sample Patients**: 6 patient cases with different medical conditions
- **Education Content**: 3 health education articles

## API Usage Examples

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+91-9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Patients with Filtering
```bash
curl "http://localhost:5000/api/patients?category=cardiac&urgency=critical&page=1&per_page=10"
```

### Create a Donation
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "donation_type": "patient",
    "patient_id": "patient-uuid",
    "donor_name": "John Doe",
    "donor_email": "john@example.com",
    "donor_phone": "+91-9876543210",
    "payment_method": "card"
  }'
```

## Configuration

### Environment Variables
- `SECRET_KEY`: Flask secret key for sessions
- `JWT_SECRET_KEY`: JWT token signing key
- `DATABASE_URL`: Database connection string

### Default Configuration
- Database: SQLite (`curerise.db`)
- JWT Expiration: 24 hours
- Debug Mode: Enabled (development)

## Testing

Use the provided test file to verify API functionality:

1. **Open `api-test.html`** in your browser
2. **Click "Run All Tests"** to test all endpoints
3. **Check individual test results** for specific functionality

## Security Features

- **Password Hashing**: Secure password storage with Werkzeug
- **JWT Authentication**: Stateless authentication with expiration
- **Input Validation**: Email format and required field validation
- **CORS Support**: Configurable cross-origin resource sharing
- **Error Handling**: Comprehensive error responses

## Production Deployment

For production deployment:

1. **Set environment variables** for secrets and database
2. **Use a production database** (PostgreSQL recommended)
3. **Disable debug mode**
4. **Use a production WSGI server** (Gunicorn, uWSGI)
5. **Set up SSL/HTTPS**
6. **Configure proper logging**

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error description",
  "details": { ... }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

