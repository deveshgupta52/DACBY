import React, { useState, useEffect, useRef } from 'react';
import { getOrders, runScheduler } from '../services/api';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Empty string means "All"
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState(null); // { success: boolean, message: string, data?: any }

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'PLACED', label: 'PLACED' },
    { value: 'PROCESSING', label: 'PROCESSING' },
    { value: 'READY_TO_SHIP', label: 'READY_TO_SHIP' },
  ];

  const currentLabel = statuses.find(s => s.value === statusFilter)?.label || 'All Statuses';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrders(statusFilter);
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to backend server. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScheduler = async () => {
    setSchedulerLoading(true);
    setSchedulerStatus(null);
    try {
      const response = await runScheduler();
      if (response.success) {
        setSchedulerStatus({
          success: true,
          message: response.message || 'Scheduler job run completed.',
          data: response.data
        });
        fetchOrders();
      } else {
        setSchedulerStatus({
          success: false,
          message: response.message || 'Scheduler job run failed.'
        });
      }
    } catch (err) {
      console.error(err);
      setSchedulerStatus({
        success: false,
        message: err.response?.data?.message || err.message || 'Error executing scheduler job.'
      });
    } finally {
      setSchedulerLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders();
  }, [statusFilter]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-8 min-h-screen bg-black text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header and Filter Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Order Dashboard</h1>
          </div>

          {/* Custom Status Dropdown Filter */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-slate-400">
              Filter Status:
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="bg-neutral-900 border border-slate-700 hover:bg-slate-800 text-slate-100 rounded-lg px-4 py-2 text-sm focus:outline-none   cursor-pointer flex items-center justify-between min-w-[160px]"
              >
                <span>{currentLabel}</span>
                <svg className={`w-3.5 h-3.5 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                  <div className="py-1">
                    {statuses.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(option.value);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 transition-colors ${
                          statusFilter === option.value ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRunScheduler}
              disabled={schedulerLoading}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800/80 disabled:opacity-50 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
              title="Run Scheduler manually to process orders"
            >
              {schedulerLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Run Scheduler</span>
                </>
              )}
            </button>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50 text-neutral-300 p-2.5 rounded-lg transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scheduler Status/Result Toast/Banner */}
        {schedulerStatus && (
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
            schedulerStatus.success 
              ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200' 
              : 'bg-red-950/20 border-red-900/50 text-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {schedulerStatus.success ? (
                <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <h3 className="font-semibold text-sm">
                  {schedulerStatus.message}
                </h3>
                {schedulerStatus.success && schedulerStatus.data && (
                  <p className="text-xs text-emerald-400/80 mt-1">
                    Processed: <span className="font-bold text-emerald-300">{schedulerStatus.data.ordersProcessed}</span> orders{' '}
                    (Placed &rarr; Processing: {schedulerStatus.data.placedToProcessing || 0}, Processing &rarr; Ready to Ship: {schedulerStatus.data.processingToReadyToShip || 0}){' '}
                    in {schedulerStatus.data.executionTime}ms.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSchedulerStatus(null)}
              className="text-xs font-semibold px-2 py-1 rounded hover:bg-white/10 transition-colors self-start md:self-auto cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="text-center py-12 text-neutral-400 text-lg">
            Loading...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-neutral-950 border border-neutral-900 rounded-xl">
            <p className="text-neutral-500">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto bg-black border border-neutral-900 rounded-xl shadow-2xl">
              <table className="min-w-full divide-y divide-neutral-900 text-left text-sm text-neutral-300">
                <thead className="bg-neutral-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-neutral-900">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4">Order Status</th>
                    <th className="px-6 py-4">Created Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 bg-black">
                  {currentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-neutral-900/30 transition-colors">
                      {/* Order ID */}
                      <td className="px-6 py-4 font-mono text-xs text-neutral-400 font-medium">
                        {order.orderId}
                      </td>
                      {/* Customer Name */}
                      <td className="px-6 py-4 font-medium text-white">
                        {order.customerName}
                      </td>
                      {/* Phone Number */}
                      <td className="px-6 py-4 text-neutral-300">
                        {order.phoneNumber}
                      </td>
                      {/* Product Name */}
                      <td className="px-6 py-4 text-neutral-200">
                        {order.productName}
                      </td>
                      {/* Amount */}
                      <td className="px-6 py-4 font-semibold text-white">
                        ₹{order.amount.toLocaleString()}
                      </td>
                      {/* Payment Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : order.paymentStatus === 'FAILED'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      {/* Order Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            order.status === 'READY_TO_SHIP'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : order.status === 'PROCESSING'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      {/* Created Time */}
                      <td className="px-6 py-4 text-neutral-400 text-xs">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-neutral-950 border border-neutral-900 rounded-xl p-4">
                <span className="text-xs text-neutral-400">
                  Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-semibold text-white">
                    {Math.min(indexOfLastItem, orders.length)}
                  </span>{' '}
                  of <span className="font-semibold text-white">{orders.length}</span> orders
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-medium text-slate-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-neutral-400">
                    Page <span className="text-white font-medium">{currentPage}</span> of{' '}
                    <span className="text-white font-medium">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-medium text-slate-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;