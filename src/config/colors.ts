export const THEME = {
    light: {
        // Layout background
        BACKGROUND_LIGHT: '#fafafc',
        BACKGROUND: '#f6f6f9',
        BACKGROUND_DARK: '#ebebf0',
        BACKGROUND_BLUE: '#f0f5ff',
        BACKGROUND_PURPLE: '#f7f4ff',
        BG_WHITE: '#fff',
        BG_TOOLTIP: '#f6f6f9',

        // Buttons
        // Primary
        BUTTON_PRIMARY_BG: '#0264f7',
        BUTTON_PRIMARY_BG_HOVER: '#075cda',
        BUTTON_PRIMARY_BG_DISABLED: '#e7e9ed',
        BUTTON_PRIMARY_FONT_DISABLED: '#ffffff',

        //Secondary
        BUTTON_SECONDARY_BG: '#deeefd',
        BUTTON_SECONDARY_FONT: '#0084ff',
        BUTTON_SECONDARY_BG_HOVER: '#0084ff',
        BUTTON_SECONDARY_FONT_HOVER: '#ffffff',
        BUTTON_SECONDARY_BG_DISABLED: '#eaedf1',
        BUTTON_SECONDARY_FONT_DISABLED: '#92a0ad',

        // Tertiary
        BUTTON_TERTIARY_BG: '#ebebf0',
        BUTTON_TERTIARY_BG_HOVER: '#e1e3e7',

        PASTEL_GREEN_LIGHT: '#c3f8e5',
        PASTEL_GREEN_MEDIUM: '#64e4b6',
        PASTEL_GREEN_DARK: '#14de95',

        // Portis
        BUTTON_PORTIS_BG: '#def3ff',
        BUTTON_PORTIS_BG_HOVER: '#caecff',

        PASTEL_BLUE_LIGHT: '#deeefd',
        PASTEL_BLUE_MEDIUM: '#4ba8ff',
        PASTEL_BLUE_DARK: '#0084ff',

        PASTEL_PURPLE_LIGHT: '#e7e2fa',
        PASTEL_PURPLE_MEDIUM: '#bbaeef',
        PASTEL_PURPLE_DARK: '#a28df1',

        PASTEL_YELLOW: '#fff9aa',

        STROKE_GREY: '#d6dbe4',
        STROKE_GREY_LIGHT: '#e5eaf3',
        STROKE_BLUE: '#a9c6ff',
        STROKE_PURPLE: '#baa6f9',

        FONT_LIGHT: '#94a2bb',
        FONT_MEDIUM: '#637189',
        FONT_DARK: '#002237',

        RED: '#ed1b24',
        RED_LIGHT: '#ff7179',
        GREEN: '#40bf4a',
        BLUE: '#0264f7',
        PURPLE: '#673df1',

        BLACK0: '#000000',
        WHITE: '#ffffff',

        // Graph
        GRAPH_1_LIGHT: '#cfe0ff',
        GRAPH_1_DARK: '#6fa3ff',
        GRAPH_1_STROKE_LIGHT: '#9cbeff',
        GRAPH_1_STROKE_DARK: '#87c2ff',

        GRAPH_2_LIGHT: '#7697de',
        GRAPH_2_DARK: '#7697de',

        BOX_SHADOW_ICON: 'rgb(215, 216, 222) 2px 2px 4px 0px',

        NAV_ACTIVE_BG: '#ebebf0',
        NAV_ACTIVE_FONT: '#002237',

        // Scrollbar
        SCROLLBAR_BACKGROUND: '#e0e1e8',
        SCROLLBAR_THUMB: '#cbd1dc',
        SCROLLBAR_THUMB_HOVER: '#bfc7d6',
        SCROLLBAR_THUMB_HOVER_BORDER: '#bec8da',

        // Fiat amount badge
        FIAT_BADGE_BG_NEUTRAl: '#002237',
    },
    dark: {
        BACKGROUND_LIGHT: '#141515',
        BACKGROUND: '#1c1f20',
        BACKGROUND_DARK: '#222526',
        BACKGROUND_BLUE: '#1c1f20',
        BACKGROUND_PURPLE: '#1d1c1e',
        BG_WHITE: '#151718',
        BG_TOOLTIP: '#1c1f20',

        BUTTON_PRIMARY_BG: '#034ab7',
        BUTTON_PRIMARY_BG_HOVER: '#05419e',
        BUTTON_PRIMARY_BG_DISABLED: '#292b2d',
        BUTTON_PRIMARY_FONT_DISABLED: '#565b61',

        BUTTON_SECONDARY_BG: '#222526',
        BUTTON_SECONDARY_FONT: '#33a5ff',
        BUTTON_SECONDARY_BG_HOVER: '#33a5ff',
        BUTTON_SECONDARY_FONT_HOVER: '#ffffff',
        BUTTON_SECONDARY_BG_DISABLED: '#292b2d',
        BUTTON_SECONDARY_FONT_DISABLED: '#565b61',

        BUTTON_TERTIARY_BG: '#292d2e',
        BUTTON_TERTIARY_BG_HOVER: '#262a2b',

        BUTTON_PORTIS_BG: '#2a2f31',
        BUTTON_PORTIS_BG_HOVER: '#3a3f41',

        PASTEL_GREEN_LIGHT: '#c3f8e5',
        PASTEL_GREEN_MEDIUM: '#64e4b6',
        PASTEL_GREEN_DARK: '#14de95',

        PASTEL_BLUE_LIGHT: '#deeefd',
        PASTEL_BLUE_MEDIUM: '#4ba8ff',
        PASTEL_BLUE_DARK: '#0084ff',

        PASTEL_PURPLE_LIGHT: '#e7e2fa',
        PASTEL_PURPLE_MEDIUM: '#bbaeef',
        PASTEL_PURPLE_DARK: '#a28df1',

        PASTEL_YELLOW: '#fff9aa',

        STROKE_GREY: '#323437',
        STROKE_GREY_LIGHT: '#292e2f',
        STROKE_BLUE: '#002b80',
        STROKE_PURPLE: '#6241c7',

        FONT_LIGHT: '#81848c',
        FONT_MEDIUM: '#8f8f99',
        FONT_DARK: '#cac9d0',

        RED: '#ca060f',
        RED_LIGHT: '#ff7179',
        GREEN: '#379b3f',
        BLUE: '#389efd',
        PURPLE: '#a260ff',

        BLACK0: '#121314',
        WHITE: '#ffffff',

        // Graph
        GRAPH_1_LIGHT: '#26292a',
        GRAPH_1_DARK: '#003289',
        GRAPH_1_STROKE_LIGHT: '#87c2ff',
        GRAPH_1_STROKE_DARK: '#418fe0',

        GRAPH_2_LIGHT: '#7697de',
        GRAPH_2_DARK: '#7697de',

        BOX_SHADOW_ICON: 'rgb(45, 48, 50) 2px 2px 4px 0px',

        NAV_ACTIVE_BG: '#222629',
        NAV_ACTIVE_FONT: '#389efd',

        // Scrollbar
        SCROLLBAR_BACKGROUND: '#121314',
        SCROLLBAR_THUMB: '#323437',
        SCROLLBAR_THUMB_HOVER: '#24292a',
        SCROLLBAR_THUMB_HOVER_BORDER: '#24292a',

        // Fiat amount badge
        FIAT_BADGE_BG_NEUTRAl: '#494d51',
    },
} as const;

const colors = { ...THEME.light } as const;

export default colors;
