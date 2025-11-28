import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../shared/Input';
import Select from '../shared/Select';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { isValidEduEmail } from '../../utils/schoolEmailValidator';

const SignUp = ({ onSuccess, onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    school: '',
    graduationYear: new Date().getFullYear() + 4,
    userType: 'student',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!isValidEduEmail(formData.email)) {
      newErrors.email = 'Must be a valid .edu email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await signup(formData);
      onSuccess();
    } catch (err) {
      setErrors({ submit: err.message || 'Error creating account' });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div>
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
          label="University Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@university.edu"
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

        <Input
          label="School Name"
          type="text"
          name="school"
          value={formData.school}
          onChange={handleChange}
          placeholder="e.g., Stanford University"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Graduation Year"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            options={years.map((year) => ({ value: year, label: year }))}
            required
          />

          <Select
            label="I am a..."
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            options={[
              { value: 'student', label: 'Student' },
              { value: 'landlord', label: 'Landlord' },
              { value: 'both', label: 'Both' },
            ]}
            required
          />
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

