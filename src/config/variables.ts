export const SCREEN_SIZE = {
    UNAVAILABLE: '260px', // not supported
    SM: '576px', // phones
    MD: '768px', // tablets
    LG: '1040px', // laptops/desktops
    XL: '1200px', // extra Large laptops/desktops
} as const;

export const FONT_SIZE = {
    TINY: '12px',
    SMALL: '14px',
    NORMAL: '16px',
    H1: '24px',
    H2: '20px',
    H3: '18px',
} as const;

export const FONT_WEIGHT = {
    LIGHT: 300,
    REGULAR: 400,
    MEDIUM: 500,
    DEMI_BOLD: 600,
    BOLD: 700,
} as const;

export const FONT_FAMILY = {
    TTHOVES: 'TT Hoves',
    OPEN_SANS: 'Open Sans',
    ROBOTO: 'Roboto',
} as const;
