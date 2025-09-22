// Mock data that matches the design
const sampleEmails = [
  'jonesadam@gmail.com',
  'Gler@app.com', 
  'Albershazron@gmail.com',
  'mike.wilson@outlook.com',
  'sarah.brown@yahoo.com',
  'david.jones@company.co.uk',
  'emma.watson@gmail.com',
  'james.smith@hotmail.com',
  'lucy.green@business.com',
  'robert.taylor@enterprise.uk'
];

const samplePostcodes = ['SW1A 1AA', 'M1 1AE', 'OX1 2JD', 'E1 6AN', 'W1T 3NW', 'B1 1HQ', 'S1 2HE', 'L1 8JQ', 'NG1 5DT', 'LS1 4DY'];
const vendorTypes = ['Independent', 'Company'];
const serviceOfferings = ['Housekeeping', 'Window Cleaning', 'Car Valet'];
const statuses = ['Onboarded', 'Rejected', '-'];

// Generate comprehensive mock data for at least 5 pages (50+ entries)
export const mockServiceProviders = Array.from({ length: 53 }, (_, i) => ({
  id: (i + 1).toString(),
  email: i < sampleEmails.length ? sampleEmails[i] : `user${i}@${['gmail.com', 'outlook.com', 'yahoo.com', 'company.co.uk'][i % 4]}`,
  phoneNumber: `+44 20 7946 ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
  postcode: samplePostcodes[i % samplePostcodes.length],
  vendorType: vendorTypes[i % vendorTypes.length],
  serviceOffering: serviceOfferings[i % serviceOfferings.length],
  signupDate: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/202${Math.floor(Math.random() * 5)}`,
  status: statuses[i % statuses.length]
}));

// Generate additional mock data for testing
export const generateMockData = (count = 100) => {
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    email: `user${i}@${['gmail.com', 'outlook.com', 'yahoo.com', 'company.co.uk'][i % 4]}`,
    phoneNumber: `+44 20 7946 ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    postcode: samplePostcodes[i % samplePostcodes.length],
    vendorType: vendorTypes[i % vendorTypes.length],
    serviceOffering: serviceOfferings[i % serviceOfferings.length],
    signupDate: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/202${Math.floor(Math.random() * 5)}`,
    status: statuses[i % statuses.length]
  }));
};