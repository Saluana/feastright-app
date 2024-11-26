// Configuration
const CONFIG = {
    // Main settings
    storageKey: 'currentState',
    
    // Visual settings
    styles: {
        section: {
            highlight: 'bg-primary/20', // Highlight on hover
            activeOpacity: '1',
            inactiveOpacity: '0.5'
        },
        menu: {
            position: { top: '10px', right: '10px' },
            wrapper: `
                absolute z-50 p-2 rounded-lg shadow-lg
                bg-background border border-border
                dark:bg-slate-800 dark:border-slate-700
                flex gap-2
            `,
            buttons: {
                base: `
                    inline-flex items-center justify-center
                    whitespace-nowrap rounded-md text-sm font-medium
                    ring-offset-background transition-colors
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-ring focus-visible:ring-offset-2
                    disabled:pointer-events-none disabled:opacity-50
                    h-9 px-4
                `,
                html: `
                    bg-primary text-primary-foreground
                    hover:bg-primary/90
                `,
                save: `
                    border border-input bg-background
                    hover:bg-accent hover:text-accent-foreground
                `
            }
        }
    },
    formatting: {
        indentSize: 2,
        maxLineLength: 1000,
        preserveClassFormatting: true,
        removeComments: false,
        removeEmptyLines: false
    }
};

export { CONFIG };
