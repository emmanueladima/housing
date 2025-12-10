import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { isValidEduEmail } from '../../utils/schoolEmailValidator';

const SignUp = ({ onSuccess, onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Form
  const [role, setRole] = useState('student'); // 'student' or 'landlord'
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    school: '',
    graduationYear: new Date().getFullYear() + 4,
    // Landlord specific
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    propertiesCount: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const validate = () => {
    const newErrors = {};

    if (role === 'student' && !isValidEduEmail(formData.email)) {
      newErrors.email = 'Must be a valid .edu email address';
    } else if (role === 'landlord' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Must be a valid email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (role === 'landlord') {
      if (!formData.companyName) newErrors.companyName = 'Company/Individual Name is required';
      if (!formData.propertiesCount) newErrors.propertiesCount = 'Properties count is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    console.log('📝 Starting signup process...');

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        userType: role,
        role: role,
      };

      if (role === 'student') {
        payload.school = formData.school;
        payload.graduationYear = formData.graduationYear;
      } else {
        payload.landlordProfile = {
          companyName: formData.companyName,
          contactEmail: formData.contactEmail || formData.email,
          contactPhone: formData.contactPhone || formData.phone,
          propertiesCount: Number(formData.propertiesCount),
          isVerified: true // Placeholder verification
        };
      }

      console.log('📤 Sending signup request with payload:', payload);
      const result = await signup(payload);
      console.log('✅ Signup successful:', result);
      setSuccess(true);
    } catch (err) {
      console.error('❌ Signup error:', err);
      setErrors({ submit: err.message || 'Error creating account' });
    } finally {
      console.log('🏁 Signup process finished, setting loading to false');
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // Success screen
  if (success) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
        <p className="text-gray-600">
          Your account has been successfully created. Please check your email to verify your account.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors"
        >
          Log In Now
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleRoleSelect('student')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-center group"
          >
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-bold text-gray-900 group-hover:text-orange-600">Student</h3>
            <p className="text-sm text-gray-500 mt-2">I'm looking for housing or roommates</p>
          </button>
          <button
            onClick={() => handleRoleSelect('landlord')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
          >
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600">Landlord</h3>
            <p className="text-sm text-gray-500 mt-2">I want to list properties for students</p>
          </button>
        </div>
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-orange-600 hover:text-orange-700 font-medium">
              Log In
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600">
          ← Back
        </button>
        <h2 className="text-xl font-bold">
          {role === 'student' ? 'Student Sign Up' : 'Landlord Registration'}
        </h2>
      </div>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label={role === 'student' ? "University Email" : "Work Email"}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={role === 'student' ? "your.email@university.edu" : "name@company.com"}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
          error={errors.password}
          required
        />

        <Input
          label="Phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(123) 456-7890"
          error={errors.phone}
          required
        />

        {role === 'student' ? (
          <>
            <Input
              label="School Name"
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="e.g., Stanford University"
              required
            />
            <Select
              label="Graduation Year"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              options={years.map((year) => ({ value: year, label: year }))}
              required
            />
          </>
        ) : (
          <>
            <Input
              label="Company / Individual Name"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Property Management Co."
              error={errors.companyName}
              required
            />
            <Input
              label="Properties Managed"
              type="number"
              name="propertiesCount"
              value={formData.propertiesCount}
              onChange={handleChange}
              placeholder="e.g. 5"
              error={errors.propertiesCount}
              required
            />
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              ℹ️ Quick Verification: Your account will be instantly verified for this demo.
            </div>
          </>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : (role === 'student' ? 'Sign Up' : 'Register as Landlord')}
        </Button>
      </form>
    </div>
  );
};

export default SignUp;

