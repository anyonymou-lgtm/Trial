// Immediately invoked to prevent theme flashing on load
(function() {
    const savedTheme = localStorage.getItem('ieee-rgit-theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Fallback to system preference on first visit
        document.documentElement.classList.add('dark');
    }

    // Event listener attached after DOM loads
    window.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                
                if (document.documentElement.classList.contains('dark')) {
                    localStorage.setItem('ieee-rgit-theme', 'dark');
                } else {
                    localStorage.setItem('ieee-rgit-theme', 'light');
                }
            });
        }
    });
})();
