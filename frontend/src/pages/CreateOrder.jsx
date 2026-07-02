import React, { useState } from 'react';
import { createOrder } from '../services/api';

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    productName: '',
    amount: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.customerName.trim()) {
      errors.customerName = 'Customer Name is required.';
    }
    
    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone Number is required.';
    } else if (cleanPhone.length < 10) {
      errors.phoneNumber = 'Phone number must be at least 10 digits.';
    }

    if (!formData.productName.trim()) {
      errors.productName = 'Product Name is required.';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount) {
      errors.amount = 'Amount is required.';
    } else if (isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Amount must be greater than 0.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessOrder(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const orderPayload = {
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        productName: formData.productName.trim(),
        amount: parseFloat(formData.amount),
      };

      const response = await createOrder(orderPayload);
      if (response.success) {
        setSuccessOrder(response.data);
        // Clear form
        setFormData({
          customerName: '',
          phoneNumber: '',
          productName: '',
          amount: '',
        });
      } else {
        setError(response.message || 'Failed to create order.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'An error occurred while creating the order. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex items-center justify-center p-4">
      {/* Background glow effects */}
     

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-5xl tracking-tight  text-slate-100/50">
            Create New Order
          </h2>
         
        </div>

        {/* Success State */}
        {successOrder ? (
          <div className="bg-neutral-950 border border-emerald-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 transform hover:scale-[1.01]">
            
            <div className="flex flex-col items-center text-center">
              {/* Success Checkmark Anim */}
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-4 animate-bounce">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-slate-100">Order Created Successfully</h3>
              <p className="text-sm text-slate-400 mt-1">Below are the generated details for this transaction.</p>

              {/* Order Info Cards */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
                <div className="bg-black p-4 rounded-xl border border-neutral-900">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Order ID</span>
                  <span className="text-sm font-semibold font-mono text-indigo-300 break-all">{successOrder.orderId}</span>
                </div>
                <div className="bg-black p-4 rounded-xl border border-neutral-900">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Customer</span>
                  <span className="text-sm font-semibold text-slate-200">{successOrder.customerName}</span>
                </div>
                <div className="bg-black p-4 rounded-xl border border-neutral-900">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Phone Number</span>
                  <span className="text-sm font-semibold text-slate-200">{successOrder.phoneNumber}</span>
                </div>
                <div className="bg-black p-4 rounded-xl border border-neutral-900">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Product</span>
                  <span className="text-sm font-semibold text-slate-200">{successOrder.productName}</span>
                </div>
                <div className="bg-black p-4 rounded-xl border border-neutral-900">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Amount</span>
                  <span className="text-base font-bold text-emerald-400">₹{successOrder.amount.toLocaleString()}</span>
                </div>
                <div className="bg-black p-4 rounded-xl border border-neutral-900 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {successOrder.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block">Payment</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {successOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSuccessOrder(null)}
                className="mt-8 px-6 py-2.5 w-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all duration-200 transform active:scale-95 shadow-lg"
              >
                Create Another Order
              </button>
            </div>
          </div>
        ) : (
          /* Pure Black Form Card */
          <form onSubmit={handleSubmit} className="bg-black border border-neutral-900 rounded-2xl p-8 shadow-2xl relative transition-all duration-300">
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start space-x-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Customer Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    className={`w-full pl-11 pr-4 py-3 bg-neutral-950 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                      validationErrors.customerName ? 'border-red-500/50' : 'border-neutral-800'
                    }`}
                  />
                </div>
                {validationErrors.customerName && (
                  <p className="mt-1.5 text-xs text-red-400">{validationErrors.customerName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className={`w-full pl-11 pr-4 py-3 bg-neutral-950 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                      validationErrors.phoneNumber ? 'border-red-500/50' : 'border-neutral-800'
                    }`}
                  />
                </div>
                {validationErrors.phoneNumber && (
                  <p className="mt-1.5 text-xs text-red-400">{validationErrors.phoneNumber}</p>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product or item name"
                    className={`w-full pl-11 pr-4 py-3 bg-neutral-950 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                      validationErrors.productName ? 'border-red-500/50' : 'border-neutral-800'
                    }`}
                  />
                </div>
                {validationErrors.productName && (
                  <p className="mt-1.5 text-xs text-red-400">{validationErrors.productName}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-semibold text-base">
                    ₹
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className={`w-full pl-11 pr-4 py-3 bg-neutral-950 border rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
                      validationErrors.amount ? 'border-red-500/50' : 'border-neutral-800'
                    }`}
                  />
                </div>
                {validationErrors.amount && (
                  <p className="mt-1.5 text-xs text-red-400">{validationErrors.amount}</p>
                )}
              </div>
            </div>

            {/* Black Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full py-3.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating Order...</span>
                </>
              ) : (
                <span>Submit Order</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateOrder;