export const defaultTheme = {
    '--color-text': 'rgba(0, 0, 0, .8)',
    '--color-text-placeholder': 'rgba(0, 0, 0, .4)',
    '--color-text-disabled': 'rgba(0, 0, 0, .3)',
    '--color-text-label': 'rgba(0, 0, 0, .6)',

    '--color-primary': '#1676d3',
    '--color-text-on-primary': 'rgba(255, 255, 255, .8)',

    '--color-accent': '#008975',
    '--color-text-on-accent': 'rgba(255, 255, 255, .8)',

    '--color-info': '#41a1f0',
    '--color-text-on-info': 'rgba(255, 255, 255, .8)',

    '--color-success': '#41cf76',
    '--color-text-on-success': 'rgba(255, 255, 255, .8)',

    '--color-warning': '#ef8c00',
    '--color-text-on-warning': 'rgba(255, 255, 255, .8)',

    '--color-danger': '#f44336',
    '--color-text-on-danger': 'rgba(255, 255, 255, .8)',

    '--color-background': '#e0e0e0',
    '--color-background-alt': '#eee',

    '--color-foreground': '#fff',
    '--color-foreground-alt': '#f9f9f9',

    '--color-background-header': '#f0f5f5',
    '--color-background-header-alt': '#90caf9',

    '--color-background-hover': 'rgba(0, 0, 0, .03)',
    '--color-background-disabled': 'rgba(0, 0, 0, .05)',
    '--color-background-selected': 'rgba(0, 0, 0, .07)',

    '--color-background-row': '#f5f5f5',
    '--color-background-row-alt': '#eee',

    '--color-navbar': '#fff',
    '--color-text-on-navbar': 'rgba(0, 0, 0, .8)',
    '--color-text-active-tab': '#1676d3',

    '--color-separator': 'rgba(0, 0, 0, .1)',
    '--color-separator-alt': 'rgba(0, 0, 0, .2)',
    '--color-separator-hover': 'rgba(0, 0, 0, .3)',

    '--color-shadow-light': 'rgba(0, 0, 0, .3)',
    '--color-shadow-medium': 'rgba(0, 0, 0, .5)',
    '--color-shadow-dark': 'rgba(0, 0, 0, .8)',

    '--color-background-scrollbar': '#eee',
    '--color-foreground-scrollbar': '#bbb',

    '--color-background-overlay': 'rgba(255, 255, 255, .77)',
    '--color-background-overlay-opaque': 'rgba(255, 255, 255, 1)',

    '--color-background-modal': 'rgba(0, 0, 0, .77)',
};

export const classicDeepTheme = {
    '--color-text': 'rgba(0, 0, 0, .8)',
    '--color-text-placeholder': 'rgba(0, 0, 0, .4)',
    '--color-text-disabled': 'rgba(0, 0, 0, .3)',
    '--color-text-label': 'rgba(0, 0, 0, .6)',

    '--color-primary': '#008080',
    '--color-text-on-primary': 'rgba(255, 255, 255, .8)',

    '--color-accent': '#008975',
    '--color-text-on-accent': 'rgba(255, 255, 255, .8)',

    '--color-info': '#41a1f0',
    '--color-text-on-info': 'rgba(255, 255, 255, .8)',

    '--color-success': '#41cf76',
    '--color-text-on-success': 'rgba(255, 255, 255, .8)',

    '--color-warning': '#ef8c00',
    '--color-text-on-warning': 'rgba(255, 255, 255, .8)',

    '--color-danger': '#f44336',
    '--color-text-on-danger': 'rgba(255, 255, 255, .8)',

    '--color-background': '#e0e0e0',
    '--color-background-alt': '#eee',

    '--color-foreground': '#fff',
    '--color-foreground-alt': '#f9f9f9',

    '--color-background-header': '#f0f5f5',
    '--color-background-header-alt': '#90caf9',

    '--color-background-hover': 'rgba(0, 0, 0, .03)',
    '--color-background-disabled': 'rgba(0, 0, 0, .05)',
    '--color-background-selected': 'rgba(0, 0, 0, .07)',

    '--color-background-row': '#f5f5f5',
    '--color-background-row-alt': '#eee',

    '--color-navbar': '#008080',
    '--color-text-on-navbar': 'rgba(255, 255, 255, .8)',
    '--color-text-active-tab': '#008080',

    '--color-separator': 'rgba(0, 0, 0, .1)',
    '--color-separator-alt': 'rgba(0, 0, 0, .2)',
    '--color-separator-hover': 'rgba(0, 0, 0, .3)',

    '--color-shadow-light': 'rgba(0, 0, 0, .3)',
    '--color-shadow-medium': 'rgba(0, 0, 0, .5)',
    '--color-shadow-dark': 'rgba(0, 0, 0, .8)',

    '--color-background-scrollbar': '#eee',
    '--color-foreground-scrollbar': '#bbb',

    '--color-background-overlay': 'rgba(255, 255, 255, .77)',
    '--color-background-overlay-opaque': 'rgba(255, 255, 255, 1)',

    '--color-background-modal': 'rgba(0, 0, 0, .77)',
};

export const setTheme = (theme) => {
    const properties = Object.keys(theme);

    properties.forEach((property) => {
        document.documentElement.style.setProperty(property, theme[property]);
    });
};
