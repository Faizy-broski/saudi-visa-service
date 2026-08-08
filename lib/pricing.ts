export type ServiceFee = {
  label: string;
  amount: number; // in pence (GBP)
  display: string;
};

export const SERVICE_FEES: Record<string, ServiceFee> = {
  'Umrah Visa':    { label: 'Umrah Visa Service',    amount: 19900, display: '£199.00' },
  'Tourist Visa':  { label: 'Tourist Visa Service',  amount: 14900, display: '£149.00' },
  // 'Hajj Visa':     { label: 'Hajj Visa Service',     amount: 24900, display: '£249.00' },
  'Business Visa': { label: 'Business Visa Service', amount: 19900, display: '£199.00' },
  'Family Visa':   { label: 'Family Visa Service',   amount: 17900, display: '£179.00' },
};

export const DEFAULT_FEE: ServiceFee = {
  label: 'Visa Service Fee',
  amount: 14900,
  display: '£149.00',
};
