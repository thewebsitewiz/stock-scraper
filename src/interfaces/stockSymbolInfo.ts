export interface Notification {
    notification?: string;
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

export interface Headers {

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

export interface StockSymbolInfo {
    symbol: string;
    companyName: string;
    stockType: string;
    exchange: string;
    isNasdaqListed?: boolean | undefined;
    isNasdaq100?: boolean | undefined;
    isHeld?: boolean | undefined;
    assetClass?: string;
    keyStats: string;
    addressString?: string;
    address?: string | undefined;
    phone?: string | undefined;
    industry?: string | undefined;
    sector?: string | undefined;
    region?: string | undefined;
    companyUrl?: string | undefined;
    companyDescription?: string | undefined;
    keyExecutives?: [KeyExecutive] | undefined;
    notifications?: [Notification] | undefined;
    dividends?: [Dividend] | undefined;
}
