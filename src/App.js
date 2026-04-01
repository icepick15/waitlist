import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import DataTable from './components/DataTable/DataTable';
import SearchBar from './components/SearchBar/SearchBar';
import Modal from './components/ui/Modal';
import Toast from './components/ui/Toast';
import { mockServiceProviders } from './data/mockData';
import {
  Bell,
  CalendarDays,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  NotebookPen,
  Phone,
  User,
  X,
} from 'lucide-react';

const navigationItems = [
  'Service Dashboard',
  'Finance Forecast',
  'Human Resources',
  'Users',
  'Compliances & Verification',
];

const audienceTabs = [
  { id: 'Service Provider', label: 'Service Providers' },
  { id: 'Customer', label: 'Customers' },
];

const createDefaultFilters = () => ({
  postcode: '',
  registrationStatus: {
    onboarded: false,
    rejected: false,
  },
  dateRange: {
    start: '',
    end: '',
  },
  vendorType: {
    independent: false,
    company: false,
  },
  serviceOffering: {
    housekeeping: false,
    windowCleaning: false,
    carValet: false,
  },
});

function App() {
  const [records, setRecords] = useState(mockServiceProviders);
  const [globalFilter, setGlobalFilter] = useState('');
  const [filters, setFilters] = useState(createDefaultFilters);
  const [activeAudience, setActiveAudience] = useState('Service Provider');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [draftNote, setDraftNote] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [chatDropdown, setChatDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

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

  const activeAudienceRecords = useMemo(() => {
    return records.filter((record) => record.audienceType === activeAudience);
  }, [records, activeAudience]);

  const filteredData = useMemo(() => {
    let filtered = activeAudienceRecords;

    if (filters.postcode) {
      filtered = filtered.filter((item) =>
        item.postcode.toLowerCase().includes(filters.postcode.toLowerCase())
      );
    }

    const statusFilters = [];
    if (filters.registrationStatus.onboarded) statusFilters.push('Onboarded');
    if (filters.registrationStatus.rejected) statusFilters.push('Rejected');
    if (statusFilters.length > 0) {
      filtered = filtered.filter((item) => statusFilters.includes(item.status));
    }

    const vendorFilters = [];
    if (filters.vendorType.independent) vendorFilters.push('Independent');
    if (filters.vendorType.company) vendorFilters.push('Company');
    if (vendorFilters.length > 0) {
      filtered = filtered.filter((item) => vendorFilters.includes(item.vendorType));
    }

    const serviceFilters = [];
    if (filters.serviceOffering.housekeeping) serviceFilters.push('Housekeeping');
    if (filters.serviceOffering.windowCleaning) serviceFilters.push('Window Cleaning');
    if (filters.serviceOffering.carValet) serviceFilters.push('Car Valet');
    if (serviceFilters.length > 0) {
      filtered = filtered.filter((item) =>
        item.serviceOfferings.some((service) => serviceFilters.includes(service))
      );
    }

    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.signupDateISO);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      });
    }

    return filtered;
  }, [activeAudienceRecords, filters]);

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const closeToast = () => {
    setToast((currentToast) => ({ ...currentToast, isVisible: false }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((previousFilters) => {
      const nextFilters = { ...previousFilters };

      if (filterType.includes('.')) {
        const [parent, child] = filterType.split('.');
        nextFilters[parent] = { ...nextFilters[parent], [child]: value };
      } else {
        nextFilters[filterType] = value;
      }

      return nextFilters;
    });
  };

  const applyFilters = () => {
    setIsSidebarOpen(false);
    showToast('Filters applied to the current waitlist view.');
  };

  const openUserModal = (userData) => {
    setSelectedUser(userData);
    setDraftNote(userData.internalNotes || '');
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setDraftNote('');
  };

  const updateSelectedRecord = (updates, message, type = 'success') => {
    if (!selectedUser) return;

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === selectedUser.id ? { ...record, ...updates } : record
      )
    );

    setSelectedUser((currentUser) => (currentUser ? { ...currentUser, ...updates } : currentUser));

    if (message) showToast(message, type);
  };

  const saveNote = () => {
    updateSelectedRecord({ internalNotes: draftNote }, 'Internal note saved.');
  };

  const updateStatus = (nextStatus) => {
    if (!selectedUser) return;

    const invitationState = nextStatus === '-' ? 'Invited' : nextStatus;
    updateSelectedRecord(
      { status: nextStatus, invitationState },
      `${selectedUser.companyName} marked as ${invitationState.toLowerCase()}.`
    );
  };

  return (
    <div className="waitlist-app">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeUserModal}
        title={
          <span className="modal-title-inline">
            <User size={16} />
            User Details
          </span>
        }
      >
        {selectedUser && (
          <div className="user-modal">
            {/* Company header */}
            <div className="user-modal__company-row">
              <div>
                <div className="user-modal__company-name">{selectedUser.companyName}</div>
                <div className="user-modal__company-email">
                  <Mail size={13} />
                  {selectedUser.email}
                </div>
              </div>
              <div className="user-modal__tags">
                <span className="tag-pill">{selectedUser.audienceType}</span>
                <span className="tag-pill">{selectedUser.invitationState.toLowerCase()}</span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="user-modal__section">
              <div className="user-modal__section-title">Contact Information</div>
              <div className="contact-grid">
                <div className="contact-item">
                  <Mail size={14} />
                  {selectedUser.email}
                </div>
                <div className="contact-item">
                  <Phone size={14} />
                  {selectedUser.phoneNumber}
                </div>
                <div className="contact-item">
                  <MapPin size={14} />
                  {selectedUser.location}
                </div>
                <div className="contact-item">
                  <CalendarDays size={14} />
                  Signed up {selectedUser.signupDate}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="user-modal__section">
              <div className="user-modal__section-title">Customer Details</div>
              <div className="customer-type-row">
                <User size={14} />
                {selectedUser.customerType.toLowerCase()}
              </div>
            </div>

            {/* User Details (services) */}
            <div className="user-modal__section">
              <div className="user-modal__section-title">User Details</div>
              <div className="service-tag-list">
                {selectedUser.serviceOfferings.map((service) => (
                  <span key={service} className="tag-pill">
                    {service.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="user-modal__section">
              <div className="section-header-row">
                <div className="user-modal__section-title" style={{ marginBottom: 0 }}>
                  Internal Notes
                </div>
                <button className="edit-link-btn" onClick={saveNote}>
                  <NotebookPen size={13} />
                  Edit
                </button>
              </div>
              <textarea
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="No Note Added yet"
                className="notes-textarea"
              />
            </div>

            {/* Action Buttons */}
            <div className="user-modal__footer">
              <button
                className="modal-btn modal-btn--primary"
                onClick={() => updateStatus('Onboarded')}
              >
                Onboard
              </button>
              <button
                className="modal-btn modal-btn--danger"
                onClick={() => updateStatus('Rejected')}
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Top Navigation Bar */}
      <header className="app-topbar">
        <div className="app-topbar__left">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="icon-button app-topbar__menu"
            aria-label="Open filters"
          >
            <Menu size={18} />
          </button>

          <div className="brand-lockup">
            <div className="brand-mark">
              gl<span>+</span>
            </div>
            <span className="brand-title">Admin Panel</span>
          </div>

          <nav className="app-topbar__nav" aria-label="Primary navigation">
            {navigationItems.map((item) => (
              <button
                key={item}
                className={`nav-tab ${item === 'Human Resources' ? 'nav-tab--active' : ''}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="app-topbar__right">
          <div className="dropdown-container app-dropdown">
            <button
              className="icon-button"
              onClick={() => {
                setNotificationDropdown((open) => !open);
                setChatDropdown(false);
                setProfileDropdown(false);
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="icon-button__dot" />
            </button>
            {notificationDropdown && (
              <div className="dropdown-panel">
                <h3>Notifications</h3>
                <p>No new notifications.</p>
              </div>
            )}
          </div>

          <div className="dropdown-container app-dropdown">
            <button
              className="icon-button"
              onClick={() => {
                setChatDropdown((open) => !open);
                setNotificationDropdown(false);
                setProfileDropdown(false);
              }}
              aria-label="Messages"
            >
              <MessageSquare size={18} />
            </button>
            {chatDropdown && (
              <div className="dropdown-panel">
                <h3>Messages</h3>
                <p>No active conversations.</p>
              </div>
            )}
          </div>

          <div className="dropdown-container profile-trigger">
            <button
              className="profile-button"
              onClick={() => {
                setProfileDropdown((open) => !open);
                setNotificationDropdown(false);
                setChatDropdown(false);
              }}
            >
              <div className="profile-button__avatar">
                <User size={15} />
              </div>
              <div className="profile-button__meta">
                <strong>Max Smith</strong>
                <span>London, UK</span>
              </div>
            </button>
            {profileDropdown && (
              <div className="dropdown-panel">
                <h3>Profile</h3>
                <p>Settings are mocked in this build.</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="app-body">
        {/* Mobile overlay */}
        <div
          className={`app-overlay ${isSidebarOpen ? 'app-overlay--visible' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`app-sidebar ${isSidebarOpen ? 'app-sidebar--open' : ''}`}>
          <button
            className="icon-button app-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
            style={{ alignSelf: 'flex-end', marginBottom: '0.75rem' }}
          >
            <X size={16} />
          </button>

          <span className="sidebar__management-label">User Management</span>

          <div className="filter-groups">
            {/* Postcode */}
            <section className="filter-card">
              <label className="filter-label" htmlFor="postcode-filter">
                Postcode
              </label>
              <input
                id="postcode-filter"
                type="text"
                placeholder="ZIP"
                value={filters.postcode}
                onChange={(event) => handleFilterChange('postcode', event.target.value)}
                className="filter-input"
              />
            </section>

            {/* Registration Status */}
            <section className="filter-card">
              <span className="filter-label">Registration Status</span>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.registrationStatus.onboarded}
                  onChange={(event) =>
                    handleFilterChange('registrationStatus.onboarded', event.target.checked)
                  }
                />
                <span>Onboarded</span>
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.registrationStatus.rejected}
                  onChange={(event) =>
                    handleFilterChange('registrationStatus.rejected', event.target.checked)
                  }
                />
                <span>Rejected</span>
              </label>
            </section>

            {/* Date Registered */}
            <section className="filter-card">
              <span className="filter-label">Date Registered</span>
              <div className="date-grid">
                <div className="date-field-wrap">
                  <div className="date-field-label-row">
                    <span className="date-field-label-text">Date</span>
                    <span className="date-field-label-badge">Date</span>
                  </div>
                  <div className="date-input-wrap">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(event) =>
                        handleFilterChange('dateRange.start', event.target.value)
                      }
                      placeholder="Start"
                    />
                  </div>
                  <span className="date-placeholder">MM/DD/YYYY</span>
                </div>
                <div className="date-field-wrap">
                  <div className="date-field-label-row">
                    <span className="date-field-label-text">Date</span>
                    <span className="date-field-label-badge">Date</span>
                  </div>
                  <div className="date-input-wrap">
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(event) =>
                        handleFilterChange('dateRange.end', event.target.value)
                      }
                      placeholder="End"
                    />
                  </div>
                  <span className="date-placeholder">MM/DD/YYYY</span>
                </div>
              </div>
            </section>

            {/* Vendor Type */}
            <section className="filter-card">
              <span className="filter-label">Vendor Type</span>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.vendorType.independent}
                  onChange={(event) =>
                    handleFilterChange('vendorType.independent', event.target.checked)
                  }
                />
                <span>Independent</span>
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.vendorType.company}
                  onChange={(event) =>
                    handleFilterChange('vendorType.company', event.target.checked)
                  }
                />
                <span>Company</span>
              </label>
            </section>

            {/* Service Offering */}
            <section className="filter-card">
              <span className="filter-label">Service Offering</span>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.serviceOffering.housekeeping}
                  onChange={(event) =>
                    handleFilterChange('serviceOffering.housekeeping', event.target.checked)
                  }
                />
                <span>Hausekeeping</span>
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.serviceOffering.windowCleaning}
                  onChange={(event) =>
                    handleFilterChange('serviceOffering.windowCleaning', event.target.checked)
                  }
                />
                <span>Window Cleaning</span>
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.serviceOffering.carValet}
                  onChange={(event) =>
                    handleFilterChange('serviceOffering.carValet', event.target.checked)
                  }
                />
                <span>Car Valet</span>
              </label>
            </section>
          </div>

          <div className="sidebar-actions">
            <button className="filter-btn" onClick={applyFilters}>
              Filter
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="app-main">
          <h1 className="page-title">Waitlist</h1>

          <div className="table-stage">
            {/* Tabs + Search */}
            <div className="table-top-bar">
              <div className="segment-tabs" role="tablist">
                {audienceTabs.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    className={`segment-tab ${activeAudience === tab.id ? 'segment-tab--active' : ''}`}
                    onClick={() => setActiveAudience(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <SearchBar globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div>

            {/* Table */}
            <DataTable data={filteredData} globalFilter={globalFilter} onEdit={openUserModal} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
