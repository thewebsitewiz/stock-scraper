export interface Notification {
  headline?: string;
  message?: string;
  eventName?: string;
  url?: string;
}

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface KeyExecutive {
  name: string;
  title: string;
}

export interface Dividend {
  exOrEffDate?: string;
  type?: string;
  amount?: string;
  declarationDate?: string;
  recordDate?: string;
  paymentDate?: string;
  currency?: string;
}

export interface Company {
  symbol: string;
  companyName?: string | null;
  stockType?: string | null;
  exchange?: string | null;
  isNasdaqListed?: boolean | null;
  isNasdaq100?: boolean | null;
  assetClass?: string | null;
  keyStats?: string | null;
  addressString?: string | null;
  phone?: string | null;
  industry?: string | null;
  sector?: string | null;
  region?: string | null;
  companyUrl?: string | null;
  companyDescription?: string | null;
}

export interface StockSymbolInfo {
  symbol: string;
  companyName: string;
  stockType: string;
  exchange: string;
  exchangeNickname: string;
  isNasdaqListed?: boolean | undefined;
  isNasdaq100?: boolean | undefined;
  isHeld?: boolean | undefined;
  assetClass?: string;
  keyStats?: string;
  addressString?: string;
  address?: string | undefined;
  phone?: string | undefined;
  industry?: string | undefined;
  sector?: string | undefined;
  region?: string | undefined;
  companyUrl?: string | undefined;
  companyDescription?: string | undefined;
}

export interface SymbolListInfo {
  symbol: string;
  exchangeNickname: string;
}

export interface SymbolList extends Array<SymbolListInfo> {}

export interface ExistingSymbols {
  [key: string]: {
    [key: string]: boolean;
  };
}
