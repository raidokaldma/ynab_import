// Generated types from response JSON

export interface SignIn {
  tokenId: string;
}

export interface Token {
  accessToken: string;
  tokenExpiryDate: number;
  user: User;
}

interface User {
  id: string;
  state: string;
}

export interface RevolutTransaction {
  id: string;
  legId: string;
  type: string;
  state: string;
  startedDate: number;
  updatedDate: number;
  completedDate?: number;
  createdDate: number;
  currency: string;
  amount: number;
  fee: number;
  balance?: number;
  description: string;
  tag: string;
  category: string;
  account: Account;
  suggestions: Suggestion[];
  countryCode?: string;
  rate?: number;
  merchant?: Merchant;
  posTime?: number;
  counterpart?: Counterpart;
  card?: Card;
  ratings?: Ratings;
  eCommerce?: boolean;
  localisedDescription: LocalisedDescription;
  comment?: string;
  recipient?: Recipient;
  standingOrder?: StandingOrder;
  transferLinkId?: string;
  beneficiary?: Beneficiary;
  sender?: Sender;
  reason?: string;
  logo?: string;
}

interface Sender {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  code: string;
  username: string;
}

interface Beneficiary {
  name: string;
  email: string;
}

interface StandingOrder {
  id: string;
  period: string;
  startDate: string;
  type: string;
}

interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  code: string;
  phone?: string;
  username: string;
  account: Account;
}

interface LocalisedDescription {
  key: string;
  params: unknown;
}

interface Ratings {
  userRating: number;
}

interface Card {
  id: string;
  lastFour: string;
  label: string;
}

interface Counterpart {
  amount: number;
  currency: string;
}

interface Merchant {
  id: string;
  merchantId: string;
  scheme: string;
  name: string;
  mcc: string;
  category: string;
  city: string;
  country: string;
  address: string;
  state: string;
  postcode?: string;
  logo?: string;
  bgColor?: string;
}

interface Suggestion {
  type: string;
  payload: unknown;
}

interface Account {
  id: string;
  type: string;
}

export interface Wallet {
  id: string;
  ref: string;
  state: string;
  baseCurrency: string;
  totalTopup: number;
  topupResetDate: number;
  pockets: Pocket[];
}

interface Pocket {
  id: string;
  type: string;
  state: string;
  currency: string;
  balance: number;
  closed: boolean;
  blockedAmount: number;
  creditLimit: number;
  name?: string;
}
