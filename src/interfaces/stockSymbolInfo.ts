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
    TBD?: string;
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
    notifications?: [Notification] | undefined;
    AddressString?: string;
    Address?: Address | undefined;
    Phone?: string | undefined;
    Industry?: string | undefined;
    Sector?: string | undefined;
    Region?: string | undefined;
    CompanyUrl?: string | undefined;
    CompanyDescription?: string | undefined;
    KeyExecutives?: [KeyExecutive] | undefined;
}
