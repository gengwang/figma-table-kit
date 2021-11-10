/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const black = '#000000';
export const white = '#FFFFFF';
export const overlay = '#1F2733';

export const grayScale = {
    DEFAULT: '#B8B8B8',
    100: '#F4F5F5',
    200: '#EAEBEB',
    300: '#DADBDB',
    400: '#B8B8B8',
    500: '#929191',
    600: '#707070',
    700: '#575757',
    800: '#484848',
    900: '#333333',
    1000: '#1A1A1A',
};

export const redScale = {
    DEFAULT: '#DE5959',
    100: '#FFF2F2',
    200: '#FDCFCF',
    300: '#FC9696',
    400: '#DE5959',
    500: '#D13C3C',
    600: '#AC1818',
    700: '#8F000E',
    800: '#6B0000',
    900: '#540000',
    1000: '#330000',
};

export const orangeScale = {
    DEFAULT: '#EF9700',
    100: '#FFF4E2',
    200: '#FEE4B7',
    300: '#FCC464',
    400: '#EF9700',
    500: '#D17D00',
    600: '#945600',
    700: '#804800',
    800: '#663800',
    900: '#472700',
    1000: '#331C00',
};

export const yellowScale = {
    DEFAULT: '#F4BB01',
    100: '#FFF6D5',
    200: '#FFEA8F',
    300: '#FFD745',
    400: '#F4BB01',
    500: '#C59402',
    600: '#906A02',
    700: '#785902',
    800: '#614500',
    900: '#453100',
    1000: '#2E2000',
};

export const greenScale = {
    DEFAULT: '#1DB846',
    100: '#EEFBE5',
    200: '#CFF0C0',
    300: '#6BD66B',
    400: '#1DB846',
    500: '#119E39',
    600: '#02832A',
    700: '#007024',
    800: '#005E1E',
    900: '#004716',
    1000: '#002E0F',
};

export const blueScale = {
    DEFAULT: '#38A5FF',
    100: '#EFF8FF',
    200: '#CFE8FC',
    300: '#85C8FF',
    400: '#38A5FF',
    500: '#128DF2',
    600: '#006FCC',
    700: '#004C9D',
    800: '#003474',
    900: '#00265B',
    1000: '#001533',
};

export const blueSteelScale = {
    DEFAULT: '#9AA5B2',
    100: '#F0F4F7',
    200: '#DFE5EB',
    300: '#B8C1CC',
    400: '#9AA5B2',
    500: '#768494',
    600: '#5D6A7A',
    700: '#475566',
    800: '#354252',
    900: '#19222E',
    1000: '#0B1117',
};

export const visScaleA = {
    100: '#303866',
    200: '#4E296C',
    300: '#742D7D',
    400: '#903280',
    500: '#A22C75',
    600: '#CA386A',
    700: '#EB5757',
};

export const visScaleB = {
    100: '#661300',
    200: '#A62F0C',
    300: '#D95221',
    400: '#FF7B41',
    500: '#FF9A42',
    600: '#FFC74F',
    700: '#FFDE65',
};

export const visScaleC = {
    100: '#1D7918',
    200: '#088D10',
    300: '#3EAE15',
    400: '#81C42E',
    500: '#AFD620',
    600: '#D6E31B',
    700: '#FFDE65',
};

export const visScaleD = {
    100: '#357387',
    200: '#45959A',
    300: '#49A392',
    400: '#28C2A6',
    500: '#3ED6BA',
    600: '#7CE9CC',
    700: '#C5F5E9',
};

export const visScaleE = {
    100: '#282F78',
    200: '#26418D',
    300: '#1F75B2',
    400: '#2C95C7',
    500: '#5DB8E4',
    600: '#7AC8ED',
    700: '#BCE4FA',
};

export const error = {
    DEFAULT: redScale[500],
    light: redScale[300],
    lighter: redScale[200],
    lightest: redScale[100],
};

export const warning = {
    DEFAULT: orangeScale[400],
    light: yellowScale[300],
    lighter: yellowScale[200],
    lightest: yellowScale[100],
};

export const success = {
    DEFAULT: greenScale[400],
    light: greenScale[300],
    lighter: greenScale[200],
    lightest: greenScale[100],
};

export const primary = {
    DEFAULT: blueScale[400],
    light: blueScale[300],
    lighter: blueScale[200],
    lightest: blueScale[100],
};

export const severityColors = {
    low: yellowScale[300],
    medium: orangeScale[400],
    high: redScale[500],
    critical: redScale[700],
};

export const riskColors = {
    '1': blueScale[300],
    pass: blueScale[300],
    '2': greenScale[400],
    warning: yellowScale[300],
    '3': yellowScale[300],
    '4': orangeScale[400],
    fail: redScale[500],
    '5': redScale[500],
    critical: redScale[700],
};

export const baseColors = {
    transparent: 'transparent',
    current: 'currentColor',
    black,
    white,
    overlay,

    gray: grayScale,
    red: redScale,
    orange: orangeScale,
    yellow: yellowScale,
    green: greenScale,
    blue: blueScale,
    ['blue-steel']: blueSteelScale,

    error: error,
    warning: warning,
    success: success,
    primary: primary,

    risk: riskColors,
    severity: severityColors,

    ['vis-a']: visScaleA,
    ['vis-b']: visScaleB,
    ['vis-c']: visScaleC,
    ['vis-d']: visScaleD,
    ['vis-e']: visScaleE,
};

export const iconColor = {
    gray: grayScale[400],
    red: redScale[400],
    orange: orangeScale[400],
    yellow: yellowScale[400],
    green: greenScale[400],
    blue: blueScale[400],
    ['blue-steel']: blueSteelScale[400],
};

export const textColor = {
    default: grayScale[900],
    secondary: grayScale[600],
    disabled: grayScale[400],
    link: blueScale[600],

    ['dark-bg']: {
        DEFAULT: white,
        secondary: grayScale[400],
        red: redScale[300],
        orange: orangeScale[300],
        yellow: yellowScale[300],
        green: greenScale[300],
        blue: blueScale[300],
        ['blue-steel']: blueSteelScale[300],
    },
    ...baseColors,
    risk: riskColors,
    icon: iconColor,
};

export const brandColor = '#0BA4E8';
export const navBackground = blueSteelScale[900];
