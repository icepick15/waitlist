import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import DataTable from './components/DataTable/DataTable';
import SearchBar from './components/SearchBar/SearchBar';
import Modal from './components/ui/Modal';
import Toast from './components/ui/Toast';
import { mockServiceProviders } from './data/mockData';
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  NotebookPen,
  Phone,
  SlidersHorizontal,
  User,
  UserCheck,
  UserX,
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

const getStatusClassName = (status) => {
  if (status === 'Onboarded') {
    return 'status-pill status-pill--success';
  }

  if (status === 'Rejected') {
    return 'status-pill status-pill--danger';
  }

  return 'status-pill status-pill--neutral';
};

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

  const audienceCounts = useMemo(() => {
    return audienceTabs.reduce((counts, tab) => {
      counts[tab.id] = records.filter((record) => record.audienceType === tab.id).length;
      return counts;
    }, {});
  }, [records]);

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

  const insightCards = useMemo(() => {
    const pendingCount = filteredData.filter((item) => item.status === '-').length;
    const onboardedCount = filteredData.filter((item) => item.status === 'Onboarded').length;
    const rejectedCount = filteredData.filter((item) => item.status === 'Rejected').length;

    return [
      {
        label: 'Visible records',
        value: filteredData.length,
        caption: `${activeAudienceRecords.length} total in ${activeAudience.toLowerCase()} queue`,
        icon: LayoutGrid,
        tone: 'blue',
      },
      {
        label: 'Awaiting review',
        value: pendingCount,
        caption: 'Invited or incomplete accounts',
        icon: Clock3,
        tone: 'amber',
      },
      {
        label: 'Onboarded',
        value: onboardedCount,
        caption: 'Ready for activation',
        icon: UserCheck,
        tone: 'green',
      },
      {
        label: 'Rejected',
        value: rejectedCount,
        caption: 'Flagged or declined entries',
        icon: UserX,
        tone: 'rose',
      },
    ];
  }, [activeAudience, activeAudienceRecords.length, filteredData]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.postcode) count += 1;
    if (filters.dateRange.start) count += 1;
    if (filters.dateRange.end) count += 1;
    if (globalFilter) count += 1;

    count += Object.values(filters.registrationStatus).filter(Boolean).length;
    count += Object.values(filters.vendorType).filter(Boolean).length;
    count += Object.values(filters.serviceOffering).filter(Boolean).length;

    return count;
  }, [filters, globalFilter]);

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

  const clearFilters = () => {
    setFilters(createDefaultFilters());
    setGlobalFilter('');
    showToast('Filters cleared. Showing the full queue again.');
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
    if (!selectedUser) {
      return;
    }

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === selectedUser.id ? { ...record, ...updates } : record
      )
    );

    setSelectedUser((currentUser) => (currentUser ? { ...currentUser, ...updates } : currentUser));

    if (message) {
      showToast(message, type);
    }
  };

  const saveNote = () => {
    updateSelectedRecord({ internalNotes: draftNote }, 'Internal note saved to this mock profile.');
  };

  const updateStatus = (nextStatus) => {
    if (!selectedUser) {
      return;
    }

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

      <Modal
        isOpen={isModalOpen}
        onClose={closeUserModal}
        title={
          <span className="modal-title-inline">
            <BadgeCheck size={18} />
            User Details
          </span>
        }
        panelClassName="app-modal__panel--wide"
      >
        {selectedUser && (
          <div className="user-modal">
            <section className="user-modal__hero">
              <div className="user-modal__avatar">{selectedUser.initials}</div>
              <div className="user-modal__headline">
                <div className="user-modal__eyebrow">{selectedUser.contactName}</div>
                <h2>{selectedUser.companyName}</h2>
                <p>{selectedUser.email}</p>
              </div>
              <div className="user-modal__chips">
                <span className="badge-chip badge-chip--slate">{selectedUser.audienceType}</span>
                <span className={getStatusClassName(selectedUser.status)}>
                  {selectedUser.invitationState}
                </span>
              </div>
            </section>

            <section className="user-modal__stats">
              <article className="mini-stat">
                <Mail size={16} />
                <div>
                  <span>Email</span>
                  <strong>{selectedUser.email}</strong>
                </div>
              </article>
              <article className="mini-stat">
                <Phone size={16} />
                <div>
                  <span>Phone</span>
                  <strong>{selectedUser.phoneNumber}</strong>
                </div>
              </article>
              <article className="mini-stat">
                <MapPin size={16} />
                <div>
                  <span>Location</span>
                  <strong>{selectedUser.location}</strong>
                </div>
              </article>
              <article className="mini-stat">
                <CalendarDays size={16} />
                <div>
                  <span>Signed up</span>
                  <strong>{selectedUser.signupDate}</strong>
                </div>
              </article>
            </section>

            <div className="user-modal__grid">
              <section className="user-modal__section">
                <header>
                  <h3>Account Snapshot</h3>
                  <p>Summary data from the current mock waitlist record.</p>
                </header>
                <div className="detail-grid">
                  <div>
                    <span>Customer Type</span>
                    <strong>{selectedUser.customerType}</strong>
                  </div>
                  <div>
                    <span>Vendor Type</span>
                    <strong>{selectedUser.vendorType}</strong>
                  </div>
                  <div>
                    <span>Postcode</span>
                    <strong>{selectedUser.postcode}</strong>
                  </div>
                  <div>
                    <span>Primary Service</span>
                    <strong>{selectedUser.serviceOffering}</strong>
                  </div>
                </div>
              </section>

              <section className="user-modal__section">
                <header>
                  <h3>Service Coverage</h3>
                  <p>Offerings currently attached to this record.</p>
                </header>
                <div className="service-chip-list">
                  {selectedUser.serviceOfferings.map((service) => (
                    <span key={service} className="badge-chip badge-chip--blue">
                      <BriefcaseBusiness size={14} />
                      {service}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="user-modal__section">
              <header className="user-modal__section-header">
                <div>
                  <h3>Internal Notes</h3>
                  <p>Mock only for now. Notes stay in local state until refresh.</p>
                </div>
                <button className="text-link-button" onClick={saveNote}>
                  <NotebookPen size={16} />
                  Save note
                </button>
              </header>
              <textarea
                value={draftNote}
                onChange={(event) => setDraftNote(event.target.value)}
                placeholder="Add context for onboarding, rejection reasons, or follow-up actions."
                className="user-modal__textarea"
              />
            </section>

            <footer className="user-modal__footer">
              <button
                className="action-button action-button--ghost"
                onClick={() => updateStatus('-')}
              >
                Mark invited
              </button>
              <button
                className="action-button action-button--danger"
                onClick={() => updateStatus('Rejected')}
              >
                Reject
              </button>
              <button
                className="action-button action-button--primary"
                onClick={() => updateStatus('Onboarded')}
              >
                Onboard
              </button>
            </footer>
          </div>
        )}
      </Modal>

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
            <div className="brand-mark">gl</div>
            <div>
              <span className="brand-title">gler Admin Panel</span>
              <span className="brand-subtitle">Operations workspace</span>
            </div>
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
                <p>No new notifications. Your onboarding queue is in sync.</p>
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
                <p>No active conversations. Start from a record to begin outreach.</p>
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
                <User size={16} />
              </div>
              <div className="profile-button__meta">
                <strong>Max Smith</strong>
                <span>London, UK</span>
              </div>
            </button>
            {profileDropdown && (
              <div className="dropdown-panel dropdown-panel--compact">
                <h3>Profile</h3>
                <p>Settings and team management are mocked in this build.</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="app-body">
        <div
          className={`app-overlay ${isSidebarOpen ? 'app-overlay--visible' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside className={`app-sidebar ${isSidebarOpen ? 'app-sidebar--open' : ''}`}>
          <div className="app-sidebar__header">
            <div>
              <span className="panel-eyebrow">Filters</span>
              <h2>User Management</h2>
            </div>
            <button
              className="icon-button app-sidebar__close"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>

          <div className="filter-groups">
            <section className="filter-card">
              <label className="filter-label" htmlFor="postcode-filter">
                Postcode
              </label>
              <input
                id="postcode-filter"
                type="text"
                placeholder="ZIP or postcode"
                value={filters.postcode}
                onChange={(event) => handleFilterChange('postcode', event.target.value)}
                className="filter-input"
              />
            </section>

            <section className="filter-card">
              <header className="filter-card__header">
                <h3>Registration Status</h3>
                <span>{Object.values(filters.registrationStatus).filter(Boolean).length} selected</span>
              </header>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.registrationStatus.onboarded}
                  onChange={(event) =>
                    handleFilterChange('registrationStatus.onboarded', event.target.checked)
                  }
                  className="checkbox-custom"
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
                  className="checkbox-custom"
                />
                <span>Rejected</span>
              </label>
            </section>

            <section className="filter-card">
              <header className="filter-card__header">
                <h3>Date Registered</h3>
                <span>Flexible range</span>
              </header>
              <div className="date-grid">
                <label className="filter-label">
                  Start
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(event) => handleFilterChange('dateRange.start', event.target.value)}
                    className="filter-input"
                  />
                </label>
                <label className="filter-label">
                  End
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(event) => handleFilterChange('dateRange.end', event.target.value)}
                    className="filter-input"
                  />
                </label>
              </div>
            </section>

            <section className="filter-card">
              <header className="filter-card__header">
                <h3>Vendor Type</h3>
                <span>{Object.values(filters.vendorType).filter(Boolean).length} selected</span>
              </header>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.vendorType.independent}
                  onChange={(event) =>
                    handleFilterChange('vendorType.independent', event.target.checked)
                  }
                  className="checkbox-custom"
                />
                <span>Independent</span>
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.vendorType.company}
                  onChange={(event) => handleFilterChange('vendorType.company', event.target.checked)}
                  className="checkbox-custom"
                />
                <span>Company</span>
              </label>
            </section>

            <section className="filter-card">
              <header className="filter-card__header">
                <h3>Service Offering</h3>
                <span>{Object.values(filters.serviceOffering).filter(Boolean).length} selected</span>
              </header>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.serviceOffering.housekeeping}
                  onChange={(event) =>
                    handleFilterChange('serviceOffering.housekeeping', event.target.checked)
                  }
                  className="checkbox-custom"
                />
                <span>Housekeeping</span>
              </label>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.serviceOffering.windowCleaning}
                  onChange={(event) =>
                    handleFilterChange('serviceOffering.windowCleaning', event.target.checked)
                  }
                  className="checkbox-custom"
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
                  className="checkbox-custom"
                />
                <span>Car Valet</span>
              </label>
            </section>
          </div>

          <div className="sidebar-actions">
            <button className="action-button action-button--primary" onClick={applyFilters}>
              Apply filters
            </button>
            <button className="action-button action-button--ghost" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        </aside>

        <main className="app-main">
          <section className="hero-panel">
            <div className="hero-panel__content">
              <span className="panel-eyebrow">Human Resources</span>
              <h1>Waitlist</h1>
              <p>
                Review incoming accounts, tighten qualification decisions, and move approved
                profiles into onboarding without leaving this queue.
              </p>
              <div className="segment-tabs" role="tablist" aria-label="Audience segments">
                {audienceTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`segment-tab ${activeAudience === tab.id ? 'segment-tab--active' : ''}`}
                    onClick={() => setActiveAudience(tab.id)}
                  >
                    {tab.label}
                    <span>{audienceCounts[tab.id] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-panel__actions">
              <SearchBar globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
              <button className="mobile-filter-button" onClick={() => setIsSidebarOpen(true)}>
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>
          </section>

          <section className="insight-grid">
            {insightCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.label} className={`insight-card insight-card--${card.tone}`}>
                  <div className="insight-card__icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <p>{card.caption}</p>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="table-stage">
            <div className="table-stage__header">
              <div>
                <span className="panel-eyebrow">Queue</span>
                <h2>{activeAudience} waitlist</h2>
                <p>
                  Showing {filteredData.length} of {activeAudienceRecords.length} records
                  {activeFilterCount > 0 ? ` with ${activeFilterCount} active filters.` : '.'}
                </p>
              </div>

              <div className="table-stage__actions">
                <button className="action-button action-button--ghost" onClick={clearFilters}>
                  Reset filters
                </button>
                <button
                  className="action-button action-button--secondary desktop-only"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  Refine view
                </button>
              </div>
            </div>

            <DataTable data={filteredData} globalFilter={globalFilter} onEdit={openUserModal} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

