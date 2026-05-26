import type { SurveyConfig } from '../core/types';

export const b2bcabVendorSurvey: SurveyConfig = {
  slug: 'b2bcab-vendor',
  formId: 'b2bcab_vendor',
  title: 'B2BCab Vendor Survey',
  intro:
    'Help us build B2BCab.in into the platform you actually want. Takes about 3–4 minutes — your answers go straight to our team.',
  layout: 'wizard',
  thanksMessage:
    'Thank you! Your responses help us make B2BCab.in better for vendors like you.',
  sections: [
    {
      id: 'contact',
      title: 'Contact',
      description: 'So we can follow up with you.',
      questions: [
        { id: 'name', label: 'Your name', type: 'short-text', required: true, placeholder: 'Full name' },
        { id: 'business', label: 'Business name', type: 'short-text', required: true, placeholder: 'e.g. Sharma Travels' },
        { id: 'city', label: 'City', type: 'short-text', required: true, placeholder: 'e.g. Jaipur' },
        {
          id: 'phone',
          label: 'Phone number',
          type: 'phone',
          required: true,
          placeholder: '10-digit mobile',
          help: 'We may call to understand your needs.',
        },
      ],
    },
    {
      id: 'business',
      title: 'Your business',
      questions: [
        {
          id: 'business_type',
          label: 'What best describes your business?',
          type: 'single-choice',
          allowOther: true,
          options: [
            { value: 'travel_agent', label: 'Travel agent' },
            { value: 'tour_operator', label: 'Tour operator' },
            { value: 'local_cab_vendor', label: 'Local cab vendor' },
            { value: 'hotel_desk', label: 'Hotel desk' },
          ],
        },
        {
          id: 'monthly_bookings',
          label: 'Approx. cab bookings per month',
          type: 'number',
          min: 0,
          placeholder: 'e.g. 120',
          help: 'A rough number is fine.',
        },
        {
          id: 'trip_types',
          label: 'Most common trip types',
          type: 'multi-choice',
          options: [
            { value: 'one_way', label: 'One Way' },
            { value: 'round_trip', label: 'Round Trip' },
            { value: 'airport_transfer', label: 'Airport Transfer' },
            { value: 'local', label: 'Local' },
            { value: 'outstation', label: 'Outstation' },
          ],
        },
        {
          id: 'top_routes',
          label: 'Most-booked cities / routes',
          type: 'long-text',
          placeholder: 'e.g. Jaipur–Delhi, Jaipur airport, local Jaipur',
        },
      ],
    },
    {
      id: 'presence',
      title: 'Online presence & customers',
      questions: [
        {
          id: 'online_channels',
          label: 'Where do you list or promote online?',
          type: 'multi-choice',
          options: [
            { value: 'gmb', label: 'Google My Business' },
            { value: 'justdial', label: 'JustDial' },
            { value: 'indiamart', label: 'IndiaMART' },
            { value: 'facebook', label: 'Facebook' },
            { value: 'whatsapp_only', label: 'WhatsApp only' },
            { value: 'own_website', label: 'Own website' },
            { value: 'none', label: 'None' },
          ],
        },
        {
          id: 'customer_source',
          label: 'How do customers usually find you?',
          type: 'multi-choice',
          options: [
            { value: 'walk_ins', label: 'Walk-ins' },
            { value: 'referrals', label: 'Referrals' },
            { value: 'google_search', label: 'Google search' },
            { value: 'justdial', label: 'JustDial' },
            { value: 'social_media', label: 'Social media' },
            { value: 'repeat_customers', label: 'Repeat customers' },
          ],
        },
      ],
    },
    {
      id: 'sourcing',
      title: 'Sourcing & platforms',
      questions: [
        {
          id: 'sourcing_platforms',
          label: 'How do you source / fulfil cabs?',
          type: 'multi-choice',
          options: [
            { value: 'direct_driver_network', label: 'Direct driver network' },
            { value: 'other_b2b', label: 'Other B2B platforms' },
            { value: 'aggregators', label: 'Aggregators (Savaari, MMT, etc.)' },
            { value: 'local_fleet_owners', label: 'Local fleet owners' },
          ],
        },
        {
          id: 'other_platforms_likes',
          label: 'Using other B2B cab platforms? Which, and what do you like about them?',
          type: 'long-text',
          placeholder: 'Tell us what works for you elsewhere',
        },
      ],
    },
    {
      id: 'fit',
      title: 'Problems & where B2BCab helps',
      questions: [
        {
          id: 'problems',
          label: 'Biggest problems you face today',
          type: 'multi-choice',
          options: [
            { value: 'vehicle_availability', label: 'Vehicle availability' },
            { value: 'pricing', label: 'Pricing' },
            { value: 'driver_reliability', label: 'Driver reliability' },
            { value: 'payment_delays', label: 'Payment delays' },
            { value: 'cancellations', label: 'Cancellations' },
            { value: 'support', label: 'Support' },
          ],
        },
        {
          id: 'help_most',
          label: 'Where could B2BCab help you most?',
          type: 'multi-choice',
          options: [
            { value: 'wider_availability', label: 'Wider availability' },
            { value: 'better_rates', label: 'Better rates' },
            { value: 'faster_booking', label: 'Faster booking' },
            { value: 'reliable_drivers', label: 'Reliable drivers' },
            { value: 'wider_city_coverage', label: 'Wider city coverage' },
          ],
        },
        {
          id: 'payment_terms',
          label: 'Best payment terms for you',
          type: 'single-choice',
          options: [
            { value: 'pay_per_booking', label: 'Pay per booking' },
            { value: 'prepaid_wallet', label: 'Prepaid wallet' },
            { value: 'credit', label: 'Credit' },
            { value: 'weekly_settlement', label: 'Weekly settlement' },
          ],
        },
      ],
    },
    {
      id: 'commercials',
      title: 'Commercials',
      description: 'Rough numbers are fine — this helps us price fairly.',
      questions: [
        {
          id: 'current_earning',
          label: 'Current monthly earning from cab bookings (₹)',
          type: 'number',
          min: 0,
          placeholder: 'e.g. 150000',
        },
        {
          id: 'target_income',
          label: 'Target monthly income via B2BCab (₹)',
          type: 'number',
          min: 0,
          placeholder: 'e.g. 300000',
        },
        {
          id: 'fair_commission',
          label: 'Fair commission / margin per booking',
          type: 'short-text',
          placeholder: 'e.g. 8% or ₹150',
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Feedback',
      questions: [
        {
          id: 'site_feedback',
          label: 'Honest feedback on the current B2BCab.in site',
          type: 'long-text',
          help: 'Ease of use, booking flow, clarity — anything confusing or missing?',
        },
        {
          id: 'suggestions',
          label: 'What would make B2BCab your go-to platform?',
          type: 'long-text',
          placeholder: 'Your suggestions',
        },
      ],
    },
  ],
};
