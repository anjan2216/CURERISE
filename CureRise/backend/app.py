from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import uuid

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///curerise.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
cors = CORS(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    donations = db.relationship('Donation', backref='donor', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.public_id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Hospital(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    patients = db.relationship('Patient', backref='hospital', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.public_id,
            'name': self.name,
            'location': self.location,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat()
        }

class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    condition = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # cardiac, cancer, emergency, etc.
    urgency = db.Column(db.String(20), nullable=False)  # critical, urgent, moderate
    target_amount = db.Column(db.Float, nullable=False)
    raised_amount = db.Column(db.Float, default=0.0)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)
    image_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    donations = db.relationship('Donation', backref='patient', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.public_id,
            'name': self.name,
            'age': self.age,
            'condition': self.condition,
            'category': self.category,
            'urgency': self.urgency,
            'target_amount': self.target_amount,
            'raised_amount': self.raised_amount,
            'hospital': self.hospital.to_dict() if self.hospital else None,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'progress_percentage': round((self.raised_amount / self.target_amount) * 100, 2) if self.target_amount > 0 else 0
        }

class Donation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, default=lambda: str(uuid.uuid4()))
    amount = db.Column(db.Float, nullable=False)
    donor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    donation_type = db.Column(db.String(50), nullable=False)  # patient, food_bank, general
    payment_method = db.Column(db.String(50))  # card, upi, netbanking
    payment_status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    transaction_id = db.Column(db.String(100))
    donor_name = db.Column(db.String(100))
    donor_email = db.Column(db.String(120))
    donor_phone = db.Column(db.String(20))
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.public_id,
            'amount': self.amount,
            'donation_type': self.donation_type,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'transaction_id': self.transaction_id,
            'donor_name': self.donor_name if not self.is_anonymous else 'Anonymous',
            'donor_email': self.donor_email if not self.is_anonymous else None,
            'donor_phone': self.donor_phone if not self.is_anonymous else None,
            'is_anonymous': self.is_anonymous,
            'created_at': self.created_at.isoformat(),
            'patient': self.patient.to_dict() if self.patient else None
        }

class FoodBankDonation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, default=lambda: str(uuid.uuid4()))
    amount = db.Column(db.Float, nullable=False)
    donation_type = db.Column(db.String(20), nullable=False)  # monthly, onetime
    donor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    donor_name = db.Column(db.String(100))
    donor_email = db.Column(db.String(120))
    donor_phone = db.Column(db.String(20))
    payment_method = db.Column(db.String(50))
    payment_status = db.Column(db.String(20), default='pending')
    transaction_id = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)  # For monthly donations
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.public_id,
            'amount': self.amount,
            'donation_type': self.donation_type,
            'donor_name': self.donor_name,
            'donor_email': self.donor_email,
            'donor_phone': self.donor_phone,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'transaction_id': self.transaction_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class EducationContent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # health, nutrition, recovery, etc.
    image_url = db.Column(db.String(500))
    author = db.Column(db.String(100))
    is_published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.public_id,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'image_url': self.image_url,
            'author': self.author,
            'is_published': self.is_published,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Helper Functions
def validate_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_required_fields(data, required_fields):
    missing_fields = [field for field in required_fields if not data.get(field)]
    return missing_fields

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name']
        missing_fields = validate_required_fields(data, required_fields)
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user = User(
            email=data['email'],
            name=data['name'],
            phone=data.get('phone')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.public_id)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.public_id)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'email' in data:
            if not validate_email(data['email']):
                return jsonify({'error': 'Invalid email format'}), 400
            if User.query.filter_by(email=data['email']).filter(User.id != user.id).first():
                return jsonify({'error': 'Email already in use'}), 409
            user.email = data['email']
        
        if 'name' in data:
            user.name = data['name']
        
        if 'phone' in data:
            user.phone = data['phone']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Patient Routes
@app.route('/api/patients', methods=['GET'])
def get_patients():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category = request.args.get('category')
        urgency = request.args.get('urgency')
        location = request.args.get('location')
        search = request.args.get('search')
        
        query = Patient.query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        if urgency:
            query = query.filter_by(urgency=urgency)
        if location:
            query = query.join(Hospital).filter(Hospital.location.ilike(f'%{location}%'))
        if search:
            query = query.filter(
                db.or_(
                    Patient.name.ilike(f'%{search}%'),
                    Patient.condition.ilike(f'%{search}%'),
                    Hospital.name.ilike(f'%{search}%')
                )
            )
        
        patients = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'patients': [patient.to_dict() for patient in patients.items],
            'total': patients.total,
            'pages': patients.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    try:
        patient = Patient.query.filter_by(public_id=patient_id, is_active=True).first()
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        return jsonify({'patient': patient.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['POST'])
@jwt_required()
def create_patient():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        required_fields = ['name', 'age', 'condition', 'category', 'urgency', 'target_amount', 'hospital_id']
        missing_fields = validate_required_fields(data, required_fields)
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Check if hospital exists
        hospital = Hospital.query.filter_by(public_id=data['hospital_id']).first()
        if not hospital:
            return jsonify({'error': 'Hospital not found'}), 404
        
        patient = Patient(
            name=data['name'],
            age=data['age'],
            condition=data['condition'],
            category=data['category'],
            urgency=data['urgency'],
            target_amount=data['target_amount'],
            hospital_id=hospital.id,
            image_url=data.get('image_url'),
            is_verified=data.get('is_verified', False)
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify({
            'message': 'Patient created successfully',
            'patient': patient.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Donation Routes
@app.route('/api/donations', methods=['POST'])
def create_donation():
    try:
        data = request.get_json()
        
        required_fields = ['amount', 'donation_type', 'donor_name', 'donor_email']
        missing_fields = validate_required_fields(data, required_fields)
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        if not validate_email(data['donor_email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if patient exists (for patient donations)
        patient = None
        if data['donation_type'] == 'patient' and data.get('patient_id'):
            patient = Patient.query.filter_by(public_id=data['patient_id']).first()
            if not patient:
                return jsonify({'error': 'Patient not found'}), 404
        
        donation = Donation(
            amount=data['amount'],
            donation_type=data['donation_type'],
            patient_id=patient.id if patient else None,
            payment_method=data.get('payment_method'),
            donor_name=data['donor_name'],
            donor_email=data['donor_email'],
            donor_phone=data.get('donor_phone'),
            is_anonymous=data.get('is_anonymous', False)
        )
        
        db.session.add(donation)
        
        # Update patient raised amount if it's a patient donation
        if patient:
            patient.raised_amount += data['amount']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Donation created successfully',
            'donation': donation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/donations/<donation_id>/confirm', methods=['PUT'])
def confirm_donation(donation_id):
    try:
        data = request.get_json()
        
        donation = Donation.query.filter_by(public_id=donation_id).first()
        if not donation:
            return jsonify({'error': 'Donation not found'}), 404
        
        donation.payment_status = 'completed'
        donation.transaction_id = data.get('transaction_id')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Donation confirmed successfully',
            'donation': donation.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Food Bank Routes
@app.route('/api/food-bank/donations', methods=['POST'])
def create_food_bank_donation():
    try:
        data = request.get_json()
        
        required_fields = ['amount', 'donation_type', 'donor_name', 'donor_email']
        missing_fields = validate_required_fields(data, required_fields)
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        if not validate_email(data['donor_email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        donation = FoodBankDonation(
            amount=data['amount'],
            donation_type=data['donation_type'],
            donor_name=data['donor_name'],
            donor_email=data['donor_email'],
            donor_phone=data.get('donor_phone'),
            payment_method=data.get('payment_method')
        )
        
        db.session.add(donation)
        db.session.commit()
        
        return jsonify({
            'message': 'Food bank donation created successfully',
            'donation': donation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/food-bank/stats', methods=['GET'])
def get_food_bank_stats():
    try:
        total_donations = db.session.query(db.func.sum(FoodBankDonation.amount)).filter_by(payment_status='completed').scalar() or 0
        total_donors = FoodBankDonation.query.filter_by(payment_status='completed').count()
        monthly_donations = FoodBankDonation.query.filter_by(donation_type='monthly', is_active=True, payment_status='completed').count()
        
        return jsonify({
            'total_amount': total_donations,
            'total_donors': total_donors,
            'monthly_donors': monthly_donations,
            'meals_provided': int(total_donations / 50),  # Assuming ₹50 per meal
            'families_supported': int(total_donations / 1500)  # Assuming ₹1500 per family per month
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Education Routes
@app.route('/api/education', methods=['GET'])
def get_education_content():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        category = request.args.get('category')
        
        query = EducationContent.query.filter_by(is_published=True)
        
        if category:
            query = query.filter_by(category=category)
        
        content = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'content': [item.to_dict() for item in content.items],
            'total': content.total,
            'pages': content.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/education/<content_id>', methods=['GET'])
def get_education_item(content_id):
    try:
        content = EducationContent.query.filter_by(public_id=content_id, is_published=True).first()
        
        if not content:
            return jsonify({'error': 'Content not found'}), 404
        
        return jsonify({'content': content.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Hospital Routes
@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    try:
        hospitals = Hospital.query.filter_by(is_verified=True).all()
        
        return jsonify({
            'hospitals': [hospital.to_dict() for hospital in hospitals]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Routes
@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        total_patients = Patient.query.filter_by(is_active=True).count()
        total_donations = db.session.query(db.func.sum(Donation.amount)).filter_by(payment_status='completed').scalar() or 0
        total_donors = Donation.query.filter_by(payment_status='completed').count()
        total_hospitals = Hospital.query.filter_by(is_verified=True).count()
        
        return jsonify({
            'total_patients': total_patients,
            'total_donations': total_donations,
            'total_donors': total_donors,
            'total_hospitals': total_hospitals,
            'active_cases': Patient.query.filter_by(is_active=True, is_verified=True).count()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/patients', methods=['GET'])
@jwt_required()
def admin_get_patients():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        patients = Patient.query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'patients': [patient.to_dict() for patient in patients.items],
            'total': patients.total,
            'pages': patients.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/patients/<patient_id>/verify', methods=['PUT'])
@jwt_required()
def verify_patient(patient_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        patient = Patient.query.filter_by(public_id=patient_id).first()
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        patient.is_verified = True
        db.session.commit()
        
        return jsonify({
            'message': 'Patient verified successfully',
            'patient': patient.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Health Check and Home Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'CureRise API is running'}), 200

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Welcome to CureRise API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'auth': '/api/auth/*',
            'patients': '/api/patients/*',
            'donations': '/api/donations/*',
            'food-bank': '/api/food-bank/*',
            'education': '/api/education/*',
            'hospitals': '/api/hospitals/*',
            'admin': '/api/admin/*'
        }
    }), 200

# Error Handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin user if it doesn't exist
        admin_user = User.query.filter_by(email='admin@curerise.com').first()
        if not admin_user:
            admin = User(
                email='admin@curerise.com',
                name='Admin User',
                is_admin=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Default admin user created: admin@curerise.com / admin123")
        
        # Create demo user if it doesn't exist
        demo_user = User.query.filter_by(email='demo@curerise.com').first()
        if not demo_user:
            demo = User(
                email='demo@curerise.com',
                name='Demo User',
                phone='+919876543210'
            )
            demo.set_password('demo123')
            db.session.add(demo)
            db.session.commit()
            print("Demo user created: demo@curerise.com / demo123")
        
        # Create sample hospitals if they don't exist
        if Hospital.query.count() == 0:
            hospitals_data = [
                {
                    'name': 'Apollo Hospital',
                    'location': 'Mumbai',
                    'address': 'Mumbai, Maharashtra',
                    'phone': '+91-22-12345678',
                    'email': 'info@apollo.com',
                    'is_verified': True
                },
                {
                    'name': 'Tata Memorial Hospital',
                    'location': 'Mumbai',
                    'address': 'Mumbai, Maharashtra',
                    'phone': '+91-22-87654321',
                    'email': 'info@tata.com',
                    'is_verified': True
                },
                {
                    'name': 'AIIMS',
                    'location': 'Delhi',
                    'address': 'New Delhi',
                    'phone': '+91-11-12345678',
                    'email': 'info@aiims.com',
                    'is_verified': True
                },
                {
                    'name': 'Fortis Hospital',
                    'location': 'Bangalore',
                    'address': 'Bangalore, Karnataka',
                    'phone': '+91-80-12345678',
                    'email': 'info@fortis.com',
                    'is_verified': True
                },
                {
                    'name': 'Narayana Health',
                    'location': 'Bangalore',
                    'address': 'Bangalore, Karnataka',
                    'phone': '+91-80-87654321',
                    'email': 'info@narayana.com',
                    'is_verified': True
                },
                {
                    'name': 'Max Hospital',
                    'location': 'Delhi',
                    'address': 'New Delhi',
                    'phone': '+91-11-87654321',
                    'email': 'info@max.com',
                    'is_verified': True
                }
            ]
            
            for hospital_data in hospitals_data:
                hospital = Hospital(**hospital_data)
                db.session.add(hospital)
            
            db.session.commit()
            print("Sample hospitals created")
        
        # Create sample patients if they don't exist
        if Patient.query.count() == 0:
            hospitals = Hospital.query.all()
            if hospitals:
                patients_data = [
                    {
                        'name': 'Rajesh Kumar',
                        'age': 45,
                        'condition': 'Requires urgent cardiac surgery for blocked arteries. Family unable to afford the ₹3.5L treatment cost.',
                        'category': 'cardiac',
                        'urgency': 'critical',
                        'target_amount': 350000,
                        'raised_amount': 125000,
                        'hospital_id': hospitals[0].id,
                        'is_verified': True
                    },
                    {
                        'name': 'Priya Sharma',
                        'age': 8,
                        'condition': 'Diagnosed with acute lymphoblastic leukemia. Needs immediate chemotherapy treatment.',
                        'category': 'cancer',
                        'urgency': 'critical',
                        'target_amount': 500000,
                        'raised_amount': 280000,
                        'hospital_id': hospitals[1].id,
                        'is_verified': True
                    },
                    {
                        'name': 'Mohammed Ali',
                        'age': 32,
                        'condition': 'Severe spinal injury from accident. Requires complex orthopedic surgery for mobility restoration.',
                        'category': 'orthopedic',
                        'urgency': 'urgent',
                        'target_amount': 275000,
                        'raised_amount': 95000,
                        'hospital_id': hospitals[2].id,
                        'is_verified': True
                    },
                    {
                        'name': 'Lakshmi Devi',
                        'age': 58,
                        'condition': 'Brain tumor requiring immediate surgical intervention. Family seeking financial assistance.',
                        'category': 'neurological',
                        'urgency': 'critical',
                        'target_amount': 450000,
                        'raised_amount': 180000,
                        'hospital_id': hospitals[3].id,
                        'is_verified': True
                    },
                    {
                        'name': 'Arjun Patel',
                        'age': 12,
                        'condition': 'Congenital heart defect requiring corrective surgery. Parents are daily wage workers.',
                        'category': 'pediatric',
                        'urgency': 'urgent',
                        'target_amount': 320000,
                        'raised_amount': 145000,
                        'hospital_id': hospitals[4].id,
                        'is_verified': True
                    },
                    {
                        'name': 'Sunita Rao',
                        'age': 41,
                        'condition': 'Kidney failure requiring urgent transplant. Seeking help for medical expenses.',
                        'category': 'emergency',
                        'urgency': 'critical',
                        'target_amount': 600000,
                        'raised_amount': 220000,
                        'hospital_id': hospitals[5].id,
                        'is_verified': True
                    }
                ]
                
                for patient_data in patients_data:
                    patient = Patient(**patient_data)
                    db.session.add(patient)
                
                db.session.commit()
                print("Sample patients created")
        
        # Create sample education content if it doesn't exist
        if EducationContent.query.count() == 0:
            education_data = [
                {
                    'title': 'Understanding Heart Disease',
                    'content': 'Heart disease is a leading cause of death worldwide. Learn about prevention, symptoms, and treatment options.',
                    'category': 'health',
                    'author': 'Dr. Rajesh Kumar'
                },
                {
                    'title': 'Nutrition During Cancer Treatment',
                    'content': 'Proper nutrition is crucial during cancer treatment. Discover foods that can help with recovery and side effects.',
                    'category': 'nutrition',
                    'author': 'Dr. Priya Sharma'
                },
                {
                    'title': 'Post-Surgery Recovery Tips',
                    'content': 'Essential tips for faster recovery after surgery, including wound care, physical therapy, and lifestyle changes.',
                    'category': 'recovery',
                    'author': 'Dr. Mohammed Ali'
                }
            ]
            
            for content_data in education_data:
                content = EducationContent(**content_data)
                db.session.add(content)
            
            db.session.commit()
            print("Sample education content created")
    
    app.run(debug=True, host='0.0.0.0', port=5000)