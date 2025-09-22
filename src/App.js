import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import DataTable from './components/DataTable/DataTable';
import SearchBar from './components/SearchBar/SearchBar';
import Modal from './components/ui/Modal';
import Toast from './components/ui/Toast';
import { mockServiceProviders } from './data/mockData';
import { Bell, MessageSquare, User, Menu } from 'lucide-react';

function App() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [chatDropdown, setChatDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setNotificationDropdown(false);
        setChatDropdown(false);
        setProfileDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNotificationDropdown(false);
        setChatDropdown(false);
        setProfileDropdown(false);
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Filter states
  const [filters, setFilters] = useState({
    postcode: '',
    registrationStatus: {
      onboarded: false,
      rejected: false
    },
    dateRange: {
      start: '',
      end: ''
    },
    vendorType: {
      independent: false,
      company: false
    },
    serviceOffering: {
      housekeeping: false,
      windowCleaning: false,
      carValet: false
    }
  });

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = mockServiceProviders;

    // Apply postcode filter
    if (filters.postcode) {
      filtered = filtered.filter(item => 
        item.postcode.toLowerCase().includes(filters.postcode.toLowerCase())
      );
    }

    // Apply registration status filter
    const statusFilters = [];
    if (filters.registrationStatus.onboarded) statusFilters.push('Onboarded');
    if (filters.registrationStatus.rejected) statusFilters.push('Rejected');
    if (statusFilters.length > 0) {
      filtered = filtered.filter(item => statusFilters.includes(item.status));
    }

    // Apply vendor type filter
    const vendorFilters = [];
    if (filters.vendorType.independent) vendorFilters.push('Independent');
    if (filters.vendorType.company) vendorFilters.push('Company');
    if (vendorFilters.length > 0) {
      filtered = filtered.filter(item => vendorFilters.includes(item.vendorType));
    }

    // Apply service offering filter
    const serviceFilters = [];
    if (filters.serviceOffering.housekeeping) serviceFilters.push('Housekeeping');
    if (filters.serviceOffering.windowCleaning) serviceFilters.push('Window Cleaning');
    if (filters.serviceOffering.carValet) serviceFilters.push('Car Valet');
    if (serviceFilters.length > 0) {
      filtered = filtered.filter(item => serviceFilters.includes(item.serviceOffering));
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.signupDate);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    return filtered;
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType.includes('.')) {
        const [parent, child] = filterType.split('.');
        newFilters[parent] = { ...newFilters[parent], [child]: value };
      } else {
        newFilters[filterType] = value;
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      postcode: '',
      registrationStatus: {
        onboarded: false,
        rejected: false
      },
      dateRange: {
        start: '',
        end: ''
      },
      vendorType: {
        independent: false,
        company: false
      },
      serviceOffering: {
        housekeeping: false,
        windowCleaning: false,
        carValet: false
      }
    });
    setGlobalFilter('');
    showToast('Filters cleared successfully!', 'success');
  };

  const handleEdit = (userData) => {
    setSelectedUser(userData);
    setIsModalOpen(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toast Notifications */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      {/* Edit Modal */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Service Provider"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                defaultValue={selectedUser.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                defaultValue={selectedUser.phoneNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input 
                type="text" 
                defaultValue={selectedUser.postcode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  showToast('User updated successfully!', 'success');
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors btn-hover"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4 md:space-x-8">
            {/* Mobile menu button */}
            <button 
              onClick={toggleSidebar}
              className="xl:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">gler</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">Admin Panel</span>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden xl:flex space-x-6 navigation-tabs">
              <button className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Service Dashboard
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Finance Forecast
              </button>
              <button className="text-sm text-blue-600 font-medium py-2 border-b-2 border-blue-600">
                Human Resources
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Users
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Compliances & Verification
              </button>
            </nav>
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications Dropdown */}
            <div className="relative dropdown-container">
              <button 
                onClick={() => {
                  setNotificationDropdown(!notificationDropdown);
                  setChatDropdown(false);
                  setProfileDropdown(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {notificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="p-4 text-center text-gray-500">
                    <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notifications</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Dropdown */}
            <div className="relative dropdown-container">
              <button 
                onClick={() => {
                  setChatDropdown(!chatDropdown);
                  setNotificationDropdown(false);
                  setProfileDropdown(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MessageSquare size={20} />
              </button>
              {chatDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
                  </div>
                  <div className="p-4 text-center text-gray-500">
                    <MessageSquare size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No messages</p>
                    <p className="text-xs text-gray-400 mt-1">Start a conversation to see messages here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative hidden sm:flex items-center space-x-3 dropdown-container">
              <div 
                onClick={() => {
                  setProfileDropdown(!profileDropdown);
                  setNotificationDropdown(false);
                  setChatDropdown(false);
                }}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="text-sm hidden md:block">
                  <div className="font-medium text-gray-900">Lisa Smith</div>
                  <div className="text-gray-500">London, UK</div>
                </div>
              </div>
              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 top-full">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-not-allowed opacity-60">
                      Profile
                    </div>
                    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-not-allowed opacity-60">
                      Settings
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`w-80 bg-white shadow-sm min-h-screen fixed xl:relative z-50 xl:z-auto transition-transform duration-300 xl:transform-none overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}>
          <div className="p-4 md:p-6 h-full flex flex-col">
            {/* Mobile close button */}
            <div className="flex justify-between items-center mb-4 xl:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Menu size={20} />
              </button>
            </div>

            {/* User Management Header */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4 hidden xl:block">User Management</h2>
            
            {/* Scrollable filter content */}
            <div className="flex-1 overflow-y-auto">
              {/* Postcode Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  placeholder="ZIP"
                  value={filters.postcode}
                  onChange={(e) => handleFilterChange('postcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Registration Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.registrationStatus.onboarded}
                      onChange={(e) => handleFilterChange('registrationStatus.onboarded', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Onboarded</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.registrationStatus.rejected}
                      onChange={(e) => handleFilterChange('registrationStatus.rejected', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Rejected</span>
                  </label>
                </div>
              </div>

              {/* Date Registered */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Registered
                </label>
                <div className="space-y-2">
                  <div className="date-input-container">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleFilterChange('dateRange.start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <span className="date-placeholder">Start</span>
                  </div>
                  <div className="date-input-container">
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleFilterChange('dateRange.end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <span className="date-placeholder">End</span>
                  </div>
                </div>
              </div>

              {/* Vendor Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.vendorType.independent}
                      onChange={(e) => handleFilterChange('vendorType.independent', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Independent</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.vendorType.company}
                      onChange={(e) => handleFilterChange('vendorType.company', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Company</span>
                  </label>
                </div>
              </div>

              {/* Service Offering */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Offering
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.serviceOffering.housekeeping}
                      onChange={(e) => handleFilterChange('serviceOffering.housekeeping', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Housekeeping</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.serviceOffering.windowCleaning}
                      onChange={(e) => handleFilterChange('serviceOffering.windowCleaning', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Window Cleaning</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={filters.serviceOffering.carValet}
                      onChange={(e) => handleFilterChange('serviceOffering.carValet', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Car Valet</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Fixed Filter Buttons at bottom */}
            <div className="space-y-2 pt-4 border-t border-gray-200 bg-white">
              <button 
                onClick={() => showToast('Filters applied successfully!', 'success')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium btn-hover"
              >
                Filter
              </button>
              <button 
                onClick={clearFilters}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-white">
          <div className="p-6 max-w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Waitlist</h1>
                <div className="flex space-x-4 mt-2">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md transition-colors">
                    Service Providers
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    Customers
                  </button>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="w-full md:w-80">
                <SearchBar 
                  globalFilter={globalFilter} 
                  setGlobalFilter={setGlobalFilter} 
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden">
              <DataTable 
                data={filteredData} 
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;