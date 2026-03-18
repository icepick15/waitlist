import { format } from 'date-fns';

const baseProfiles = [
  {
    companyName: 'CleanPro Solutions',
    contactName: 'Lisa Anderson',
    email: 'contact@cleanpro.com',
    phoneNumber: '+44 20 7946 0958',
    postcode: 'SW1A 1AA',
    vendorType: 'Company',
    serviceOfferings: ['Housekeeping', 'Car Valet'],
    location: 'London, United Kingdom',
    audienceType: 'Service Provider',
    internalNotes: 'Strong application. Requested fast-track onboarding for central London coverage.',
  },
  {
    companyName: 'Gler Home Care',
    contactName: 'James Brown',
    email: 'ops@glerhomecare.co.uk',
    phoneNumber: '+44 161 794 1163',
    postcode: 'M1 1AE',
    vendorType: 'Company',
    serviceOfferings: ['Window Cleaning', 'Housekeeping'],
    location: 'Manchester, United Kingdom',
    audienceType: 'Customer',
    internalNotes: '',
  },
  {
    companyName: 'Watson Independent',
    contactName: 'Albert Watson',
    email: 'albert.watson@gmail.com',
    phoneNumber: '+44 1865 552 014',
    postcode: 'OX1 2JD',
    vendorType: 'Independent',
    serviceOfferings: ['Housekeeping'],
    location: 'Oxford, United Kingdom',
    audienceType: 'Service Provider',
    internalNotes: 'Needs final compliance review before approval.',
  },
  {
    companyName: 'North Star Services',
    contactName: 'Mia Collins',
    email: 'support@northstarservices.co.uk',
    phoneNumber: '+44 20 7821 6440',
    postcode: 'E1 6AN',
    vendorType: 'Company',
    serviceOfferings: ['Window Cleaning'],
    location: 'London, United Kingdom',
    audienceType: 'Service Provider',
    internalNotes: '',
  },
  {
    companyName: 'Harbor Lane Support',
    contactName: 'Noah Reeves',
    email: 'hello@harborlane.co.uk',
    phoneNumber: '+44 121 314 8872',
    postcode: 'B1 1HQ',
    vendorType: 'Independent',
    serviceOfferings: ['Car Valet', 'Housekeeping'],
    location: 'Birmingham, United Kingdom',
    audienceType: 'Customer',
    internalNotes: 'Customer requested callback after pricing review.',
  },
  {
    companyName: 'Blue Vale Group',
    contactName: 'Emma Watson',
    email: 'emma@bluevalegroup.com',
    phoneNumber: '+44 114 496 2004',
    postcode: 'S1 2HE',
    vendorType: 'Company',
    serviceOfferings: ['Window Cleaning', 'Car Valet'],
    location: 'Sheffield, United Kingdom',
    audienceType: 'Service Provider',
    internalNotes: '',
  },
  {
    companyName: 'Urban Nest Partners',
    contactName: 'Lucy Green',
    email: 'team@urbannestpartners.com',
    phoneNumber: '+44 151 305 7711',
    postcode: 'L1 8JQ',
    vendorType: 'Company',
    serviceOfferings: ['Housekeeping'],
    location: 'Liverpool, United Kingdom',
    audienceType: 'Customer',
    internalNotes: 'Interested in bundled onboarding and window cleaning add-on.',
  },
  {
    companyName: 'Taylor Field Ops',
    contactName: 'Robert Taylor',
    email: 'robert@taylorfieldops.uk',
    phoneNumber: '+44 115 870 3120',
    postcode: 'NG1 5DT',
    vendorType: 'Independent',
    serviceOfferings: ['Car Valet'],
    location: 'Nottingham, United Kingdom',
    audienceType: 'Service Provider',
    internalNotes: '',
  },
  {
    companyName: 'Moorline Facilities',
    contactName: 'Sarah Brown',
    email: 'care@moorlinefacilities.com',
    phoneNumber: '+44 113 244 6590',
    postcode: 'LS1 4DY',
    vendorType: 'Company',
    serviceOfferings: ['Window Cleaning', 'Housekeeping'],
    location: 'Leeds, United Kingdom',
    audienceType: 'Customer',
    internalNotes: 'Waiting on final budget sign-off from operations manager.',
  },
  {
    companyName: 'Brightway Domestic',
    contactName: 'David Jones',
    email: 'contact@brightwaydomestic.co.uk',
    phoneNumber: '+44 20 3030 8801',
    postcode: 'W1T 3NW',
    vendorType: 'Independent',
    serviceOfferings: ['Housekeeping', 'Window Cleaning'],
    location: 'London, United Kingdom',
    audienceType: 'Service Provider',
    internalNotes: '',
  },
];

const statusCycle = ['-', 'Onboarded', 'Rejected', 'Onboarded'];

const buildSignupDate = (index) => {
  const month = index % 12;
  const day = ((index * 3) % 27) + 1;
  const year = 2023 + (index % 3);
  return new Date(year, month, day);
};

const buildRecord = (profile, index) => {
  const signupDate = buildSignupDate(index);
  const status = statusCycle[index % statusCycle.length];
  const primaryService = profile.serviceOfferings[index % profile.serviceOfferings.length];
  const initials = profile.contactName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id: `waitlist-${index + 1}`,
    companyName: profile.companyName,
    contactName: profile.contactName,
    initials,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    postcode: profile.postcode,
    vendorType: profile.vendorType,
    serviceOffering: primaryService,
    serviceOfferings: profile.serviceOfferings,
    signupDate: format(signupDate, 'dd/MM/yyyy'),
    signupDateISO: format(signupDate, 'yyyy-MM-dd'),
    status,
    audienceType: profile.audienceType,
    location: profile.location,
    customerType: profile.vendorType === 'Company' ? 'Business' : 'Individual',
    invitationState: status === '-' ? 'Invited' : status,
    internalNotes: profile.internalNotes,
  };
};

export const mockServiceProviders = Array.from({ length: 54 }, (_, index) => {
  const profile = baseProfiles[index % baseProfiles.length];
  return buildRecord(profile, index);
});

export const generateMockData = (count = 100) =>
  Array.from({ length: count }, (_, index) => {
    const profile = baseProfiles[index % baseProfiles.length];
    return buildRecord(profile, index);
  });
