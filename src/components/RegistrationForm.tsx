import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import type { RegistrationData } from '../api';
import { JerseyPreview } from './JerseyPreview';
import { PaymentSection } from './PaymentSection';
import { config } from '../config';
import type { PackageType } from '../App';

interface RegistrationFormProps {
  selectedPackage: PackageType | null;
  onSubmit: (data: RegistrationData) => Promise<void>;
  isSubmitting: boolean;
}

export function RegistrationForm({ selectedPackage, onSubmit, isSubmitting }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    phone: '',
    package: selectedPackage || 'iftar-only',
    jerseySize: undefined,
    jerseyName: '',
    jerseyNumber: '',
    paymentMethod: '',
    transactionId: '',
    lastTwoDigit: '', // Changed from lastTwoDigits to lastTwoDigit
    amount: config.packagePrices[selectedPackage || 'iftar-only'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        package: selectedPackage,
        amount: config.packagePrices[selectedPackage]
      }));
    }
  }, [selectedPackage]);

  const needsJerseySize = ['iftar-jersey', 'iftar-jersey-seheri', 'jersey-only'].includes(formData.package);

  const validatePhone = (phone: string): boolean => {
    return /^01[0-9]{9}$/.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone must be 11 digits starting with 01';
    }

    if (needsJerseySize && !formData.jerseySize) {
      newErrors.jerseySize = 'Please select jersey size';
    }

    if (needsJerseySize && !formData.jerseyName?.trim()) {
      newErrors.jerseyName = 'Jersey name is required';
    } else if (needsJerseySize && formData.jerseyName && formData.jerseyName.length > 15) {
      newErrors.jerseyName = 'Jersey name must be 15 characters or less';
    }

    if (needsJerseySize && !formData.jerseyNumber?.trim()) {
      newErrors.jerseyNumber = 'Jersey number is required';
    } else if (needsJerseySize && formData.jerseyNumber) {
      const num = parseInt(formData.jerseyNumber);
      if (isNaN(num) || num < 0 || num > 99) {
        newErrors.jerseyNumber = 'Jersey number must be between 0 and 99';
      }
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select payment method';
    }

    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    }

    if (!formData.lastTwoDigit?.trim()) {
      newErrors.lastTwoDigit = 'Last 2 digits are required';
    } else if (!/^\d{2}$/.test(formData.lastTwoDigit)) {
      newErrors.lastTwoDigit = 'Must be exactly 2 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Package prices from centralized config
  const packagePrices = config.packagePrices;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ensure amount is correct based on current package
    const currentAmount = packagePrices[formData.package];
    const dataToSubmit = {
      ...formData,
      amount: currentAmount // <-- IMPORTANT: Send numeric amount
    };

    // Update local state to match
    setFormData(prev => ({ ...prev, amount: currentAmount }));

    await onSubmit(dataToSubmit);

    // Reset form
    setFormData({
      name: '',
      phone: '',
      package: 'iftar-only',
      jerseySize: undefined,
      jerseyName: '',
      jerseyNumber: '',
      paymentMethod: '',
      transactionId: '',
      lastTwoDigit: '',
      amount: config.packagePrices['iftar-only'],
    });
    setErrors({});
  };

  const handleChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <section id="registration" className="py-20 bg-gradient-to-br from-emerald-50 to-amber-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Register Now</h2>
          <p className="text-xl text-gray-600">Fill in your details to complete registration</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Jersey Preview */}
          <div className="lg:col-span-1">
            <JerseyPreview />
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-200'
                    }`}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Package Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Package *
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(packagePrices).map(([key, price]) => (
                    <label
                      key={key}
                      className={`relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.package === key
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="package"
                        value={key}
                        checked={formData.package === key}
                        onChange={(e) => handleChange('package', e.target.value as PackageType)}
                        className="w-5 h-5 text-emerald-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 capitalize">
                          {key.replace(/-/g, ' ')}
                        </div>
                        <div className="text-emerald-600 font-bold">৳{price}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Jersey Size (Conditional) */}
              {needsJerseySize && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 border-t-2 border-gray-200 pt-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">👕</span>
                    Jersey Information
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Jersey Size *
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleChange('jerseySize', size)}
                          className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all ${formData.jerseySize === size
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-emerald-300'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {errors.jerseySize && <p className="text-red-500 text-sm mt-1">{errors.jerseySize}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Jersey Name */}
                    <div>
                      <label htmlFor="jerseyName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Jersey Name *
                      </label>
                      <input
                        type="text"
                        id="jerseyName"
                        value={formData.jerseyName}
                        onChange={(e) => handleChange('jerseyName', e.target.value.toUpperCase())}
                        maxLength={15}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors uppercase ${errors.jerseyName ? 'border-red-500' : 'border-gray-200'
                          }`}
                        placeholder="Kalu"
                      />
                      <div className="flex items-center justify-between mt-1">
                        {errors.jerseyName ? (
                          <p className="text-red-500 text-sm">{errors.jerseyName}</p>
                        ) : (
                          <p className="text-gray-500 text-xs">Max 15 characters</p>
                        )}
                        <span className={`text-xs font-semibold ${(formData.jerseyName?.length || 0) > 15 ? 'text-red-500' : 'text-gray-500'
                          }`}>
                          {formData.jerseyName?.length || 0}/15
                        </span>
                      </div>
                    </div>

                    {/* Jersey Number */}
                    <div>
                      <label htmlFor="jerseyNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                        Jersey Number *
                      </label>
                      <input
                        type="number"
                        id="jerseyNumber"
                        value={formData.jerseyNumber}
                        onChange={(e) => handleChange('jerseyNumber', e.target.value)}
                        min="0"
                        max="99"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.jerseyNumber ? 'border-red-500' : 'border-gray-200'
                          }`}
                        placeholder="10"
                      />
                      {errors.jerseyNumber ? (
                        <p className="text-red-500 text-sm mt-1">{errors.jerseyNumber}</p>
                      ) : (
                        <p className="text-gray-500 text-xs mt-1">0-99 only</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Section */}
              <PaymentSection
                formData={formData}
                errors={errors}
                onChange={handleChange}
              />

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-emerald-100 to-amber-100 rounded-lg p-6 border-2 border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-3xl font-bold text-emerald-700">
                    ৳{packagePrices[formData.package]}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Processing...
                  </>
                ) : (
                  <>
                    🎉 Complete Registration
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
}
