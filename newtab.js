document.addEventListener('DOMContentLoaded', async function() {
    // Elements
    const topSitesGrid = document.getElementById('topSitesGrid');
    const searchInput = document.getElementById('searchInput');
    const wallpaperContainer = document.getElementById('wallpaperContainer');
    const wallpaperBtn = document.getElementById('wallpaperBtn');
    const showMoreBtn = document.getElementById('showMoreBtn');
    const customizeBtn = document.getElementById('customizeBtn');
    const customizePanel = document.getElementById('customizePanel');
    const closePanelBtn = document.getElementById('closePanelBtn');
    const siteCountSelect = document.getElementById('siteCountSelect');
    const addCustomSiteBtn = document.getElementById('addCustomSiteBtn');
    const addFolderBtn = document.getElementById('addFolderBtn');
    const resetSitesBtn = document.getElementById('resetSitesBtn');
    const addSiteModal = document.getElementById('addSiteModal');
    const saveSiteBtn = document.getElementById('saveSiteBtn');
    const cancelSiteBtn = document.getElementById('cancelSiteBtn');
    const siteNameInput = document.getElementById('siteName');
    const siteUrlInput = document.getElementById('siteUrl');
    const siteFolderSelect = document.getElementById('siteFolderSelect');
    const editSiteModal = document.getElementById('editSiteModal');
    const updateSiteBtn = document.getElementById('updateSiteBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editSiteNameInput = document.getElementById('editSiteName');
    const editSiteUrlInput = document.getElementById('editSiteUrl');
    const editSiteFolderSelect = document.getElementById('editSiteFolderSelect');
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    const toggleViewText = document.getElementById('toggleViewText');
    const sitesHeaderTitle = document.getElementById('sitesHeaderTitle');
    const customCountGroup = document.getElementById('customCountGroup');
    const customSiteCountInput = document.getElementById('customSiteCount');
    const applyCustomCountBtn = document.getElementById('applyCustomCountBtn');
    const exportConfigBtn = document.getElementById('exportConfigBtn');
    const importConfigBtn = document.getElementById('importConfigBtn');
    const importConfigInput = document.getElementById('importConfigInput');
    const addFromTabBtn = document.getElementById('addFromTabBtn');
    const selectTabModal = document.getElementById('selectTabModal');
    const tabList = document.getElementById('tabList');
    const cancelTabSelectBtn = document.getElementById('cancelTabSelectBtn');
    const siteIconInput = document.getElementById('siteIcon');
    const editSiteIconInput = document.getElementById('editSiteIcon');
    const addFolderModal = document.getElementById('addFolderModal');
    const saveFolderBtn = document.getElementById('saveFolderBtn');
    const cancelFolderBtn = document.getElementById('cancelFolderBtn');
    const folderNameInput = document.getElementById('folderName');
    const folderImageInput = document.getElementById('folderImage');
    const editFolderModal = document.getElementById('editFolderModal');
    const updateFolderBtn = document.getElementById('updateFolderBtn');
    const cancelEditFolderBtn = document.getElementById('cancelEditFolderBtn');
    const editFolderNameInput = document.getElementById('editFolderName');
    const editFolderImageInput = document.getElementById('editFolderImage');
    const currentTimeEl = document.getElementById('currentTime');
    const currentDateEl = document.getElementById('currentDate');
    const weatherInfoEl = document.getElementById('weatherInfo');
    const weatherIconEl = document.getElementById('weatherIcon');
    const weatherLocationInput = document.getElementById('weatherLocationInput');
    const updateLocationBtn = document.getElementById('updateLocationBtn');
    const timeFormatSelect = document.getElementById('timeFormatSelect');
    const tempFormatSelect = document.getElementById('tempFormatSelect');
    
    // State - Load saved settings
    const settings = JSON.parse(localStorage.getItem('braveExtensionSettings') || '{}');
    let currentSiteCount = settings.siteCount || 12;
    let currentView = settings.currentView || 'topSites'; // 'topSites' or 'favorites'
    let weatherLocation = settings.weatherLocation || 'New York';
    let timeFormat = settings.timeFormat || '12h';
    let tempFormat = settings.tempFormat || 'fahrenheit';
    let clockPosition = settings.clockPosition || { top: 24, right: 24 };
    let weatherPosition = settings.weatherPosition || { top: 100, right: 24 };
    let searchPosition = settings.searchPosition || { bottom: 40, left: 50, transform: 'translateX(-50%)' };
    let statsPosition = settings.statsPosition || { top: 24, left: 24 };
    let showClockWidget = settings.showClockWidget !== false; // Default to true
    let showWeatherWidget = settings.showWeatherWidget !== false; // Default to true
    let showStatsWidget = settings.showStatsWidget !== false; // Default to true
    let showSearchWidget = settings.showSearchWidget !== false; // Default to true

    let allSites = [];
    let customSites = loadCustomSitesFromStorage();
    let currentWallpaperIndex = parseInt(localStorage.getItem('wallpaperIndex') || '0');
    let editingSiteId = null;
    let editingFolderId = null;
    let openFolderId = null;
    let latestWeatherRequestId = 0;
    let latestWeatherDisplay = {
        locationLabel: 'Weather',
        temp: '--',
        unit: '',
        high: '--',
        low: '--',
        desc: 'Loading...',
        icon: '⋯',
        isStale: false
    };
    
    // Wallpaper collection
    const wallpapers = [
        'wallpapers/wallpaper-1.jpg',
        'wallpapers/wallpaper-2.jpg',
        'wallpapers/wallpaper-3.jpg',
        'wallpapers/wallpaper-4.jpg',
        'wallpapers/wallpaper-5.jpg',
        'wallpapers/wallpaper-6.jpg',
        'wallpapers/wallpaper-7.jpg',
        'wallpapers/wallpaper-8.jpg',
        'wallpapers/wallpaper-9.jpg',
        'wallpapers/wallpaper-10.jpg',		
        'wallpapers/wallpaper-11.jpg',
        'wallpapers/wallpaper-12.jpg',
        'wallpapers/wallpaper-13.jpg',
        'wallpapers/wallpaper-14.jpg',
        'wallpapers/wallpaper-15.jpg',
        'wallpapers/wallpaper-16.jpg',
        'wallpapers/wallpaper-17.jpg',
        'wallpapers/wallpaper-18.jpg',	
        'wallpapers/wallpaper-19.jpg'		
    ];

    // Initialize
    initializeWallpaper();
    initializeView();
    updateFolderSelectOptions();
    initializeWeatherLocation();
    initializeWidgetVisibility();
    loadTopSites();
    setupEventListeners();
    updateStats();
    startClock();
    updateWeather();
    setInterval(updateWeather, 15 * 60 * 1000);
    
    // Initialize draggable positions after DOM is ready
    setTimeout(() => {
        initializePositions();
    }, 100);
    
    // Add window resize listener for grid snapping
    window.addEventListener('resize', () => {
        snapWidgetsToGrid();
    });
    
    // Add grid toggle functionality (hold Ctrl+G to show/hide grid)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            toggleGrid();
        }
    });
    
    // Debug: Test tabs API immediately on load
    setTimeout(() => {
        console.log('Testing tabs API on load...');
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({}, (tabs) => {
                console.log('Initial tab test result:', {
                    error: chrome.runtime.lastError,
                    tabsLength: tabs ? tabs.length : 'undefined',
                    firstTab: tabs && tabs[0] ? {
                        id: tabs[0].id,
                        title: tabs[0].title,
                        url: tabs[0].url,
                        favIconUrl: tabs[0].favIconUrl
                    } : 'no first tab'
                });
            });
        } else {
            console.log('Chrome tabs API not available');
        }
    }, 1000);
    
    function initializeWallpaper() {
        // Change to a new wallpaper every time the page loads
        currentWallpaperIndex = (currentWallpaperIndex + 1) % wallpapers.length;
        localStorage.setItem('wallpaperIndex', currentWallpaperIndex.toString());
        setWallpaper(currentWallpaperIndex);
        
        // Also change wallpaper every 30 minutes
        setInterval(() => {
            currentWallpaperIndex = (currentWallpaperIndex + 1) % wallpapers.length;
            localStorage.setItem('wallpaperIndex', currentWallpaperIndex.toString());
            setWallpaper(currentWallpaperIndex);
        }, 30 * 60 * 1000);
    }
    
    function setWallpaper(index) {
        wallpaperContainer.style.backgroundImage = `url("${wallpapers[index]}")`;
    }
    
    function initializeView() {
        // Set the initial view
        updateViewToggle();
        updateSiteCountDisplay();
    }
    
    function updateViewToggle() {
        if (currentView === 'topSites') {
            sitesHeaderTitle.textContent = 'Top Sites';
            toggleViewText.textContent = 'Favorites';
        } else {
            sitesHeaderTitle.textContent = 'Favorites';
            toggleViewText.textContent = 'Top Sites';
        }
    }
    
    function updateSiteCountDisplay() {
        // Update the dropdown to show current setting
        if ([6, 12, 24, 48].includes(currentSiteCount)) {
            siteCountSelect.value = currentSiteCount.toString();
            customCountGroup.style.display = 'none';
        } else {
            siteCountSelect.value = 'custom';
            customCountGroup.style.display = 'block';
            customSiteCountInput.value = currentSiteCount;
        }
    }
    
    function initializeWeatherLocation() {
        weatherLocation = weatherLocation.trim() || 'New York';
        weatherLocationInput.value = weatherLocation;
        timeFormatSelect.value = timeFormat;
        tempFormatSelect.value = tempFormat;
    }
    
    function initializeWidgetVisibility() {
        // Set initial checkbox states
        document.getElementById('showClockWidget').checked = showClockWidget;
        document.getElementById('showWeatherWidget').checked = showWeatherWidget;
        document.getElementById('showStatsWidget').checked = showStatsWidget;
        document.getElementById('showSearchWidget').checked = showSearchWidget;
        
        // Apply initial visibility
        updateWidgetVisibility();
    }
    
    function updateWidgetVisibility() {
        const clockWidget = document.querySelector('.clock-widget');
        const weatherWidget = document.querySelector('.weather-widget');
        const statsSection = document.querySelector('.stats-section');
        const searchSection = document.querySelector('.search-section');
        
        // Hide clock and weather widgets in favorites view since they're shown as tiles
        if (showClockWidget && currentView !== 'favorites') {
            clockWidget.classList.remove('hidden');
        } else {
            clockWidget.classList.add('hidden');
        }
        
        if (showWeatherWidget && currentView !== 'favorites') {
            weatherWidget.classList.remove('hidden');
        } else {
            weatherWidget.classList.add('hidden');
        }
        
        if (showStatsWidget) {
            statsSection.classList.remove('hidden');
        } else {
            statsSection.classList.add('hidden');
        }
        
        if (showSearchWidget) {
            searchSection.classList.remove('hidden');
        } else {
            searchSection.classList.add('hidden');
        }
    }
    
    function saveSettings() {
        const settings = {
            siteCount: currentSiteCount,
            currentView: currentView,
            weatherLocation: weatherLocation,
            timeFormat: timeFormat,
            tempFormat: tempFormat,
            clockPosition: clockPosition,
            weatherPosition: weatherPosition,
            searchPosition: searchPosition,
            statsPosition: statsPosition,
            showClockWidget: showClockWidget,
            showWeatherWidget: showWeatherWidget,
            showStatsWidget: showStatsWidget,
            showSearchWidget: showSearchWidget
        };
        localStorage.setItem('braveExtensionSettings', JSON.stringify(settings));
    }

    function createEntryId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    }

    function isFolderEntry(entry) {
        return entry && entry.type === 'folder';
    }

    function isSiteEntry(entry) {
        return entry && entry.type === 'site';
    }

    function getFolderEntries() {
        return customSites.filter(isFolderEntry);
    }

    function getFolderChildren(folderId) {
        return customSites.filter(entry => isSiteEntry(entry) && entry.folderId === folderId);
    }

    function getTopLevelFavoriteEntries() {
        return customSites.filter(entry => {
            if (isFolderEntry(entry)) {
                return true;
            }

            return isSiteEntry(entry) && entry.folderId === null;
        });
    }

    function findEntryById(entryId) {
        return customSites.find(entry => String(entry.id) === String(entryId)) || null;
    }

    function sanitizeCustomSites(sites) {
        if (!Array.isArray(sites)) {
            return [];
        }

        const sanitizedEntries = [];
        const validFolderIds = new Set();

        sites.forEach((entry, index) => {
            if (!entry || typeof entry !== 'object') {
                return;
            }

            const rawType = entry.type === 'folder' ? 'folder' : 'site';
            const title = typeof entry.title === 'string' ? entry.title.trim() : '';

            if (!title) {
                return;
            }

            if (rawType === 'folder') {
                const folderEntry = {
                    id: entry.id ?? createEntryId('folder'),
                    type: 'folder',
                    title,
                    image: typeof entry.image === 'string' ? entry.image.trim() : ''
                };
                sanitizedEntries.push(folderEntry);
                validFolderIds.add(String(folderEntry.id));
                return;
            }

            const url = typeof entry.url === 'string' ? entry.url.trim() : '';
            if (!url) {
                return;
            }

            sanitizedEntries.push({
                id: entry.id ?? createEntryId(`custom-${index}`),
                type: 'site',
                title,
                url,
                favicon: typeof entry.favicon === 'string' ? entry.favicon.trim() : '',
                folderId: entry.folderId ?? null,
                isCustom: true
            });
        });

        return sanitizedEntries.map(entry => {
            if (!isSiteEntry(entry)) {
                return entry;
            }

            const normalizedFolderId = entry.folderId === null || entry.folderId === ''
                ? null
                : String(entry.folderId);

            return {
                ...entry,
                folderId: normalizedFolderId && validFolderIds.has(normalizedFolderId) ? normalizedFolderId : null,
                isCustom: true
            };
        });
    }

    function loadCustomSitesFromStorage() {
        const rawValue = localStorage.getItem('customTopSites');
        if (!rawValue) {
            return [];
        }

        try {
            const parsedSites = JSON.parse(rawValue);
            const sanitizedSites = sanitizeCustomSites(parsedSites);

            if (Array.isArray(parsedSites) && sanitizedSites.length !== parsedSites.length) {
                localStorage.setItem('customTopSitesCorruptBackup', rawValue);
                localStorage.setItem('customTopSites', JSON.stringify(sanitizedSites));
                console.warn('Detected invalid favorites data and repaired it. Backup saved to customTopSitesCorruptBackup.');
            }

            return sanitizedSites;
        } catch (error) {
            localStorage.setItem('customTopSitesCorruptBackup', rawValue);
            console.error('Failed to parse customTopSites. Backed up corrupt value and reset favorites.', error);
            return [];
        }
    }

    function saveCustomSites(nextSites) {
        const sanitizedSites = sanitizeCustomSites(nextSites);
        const previousValue = localStorage.getItem('customTopSites');

        if (previousValue !== null) {
            localStorage.setItem('customTopSitesBackup', previousValue);
        }

        customSites = sanitizedSites;
        localStorage.setItem('customTopSites', JSON.stringify(customSites));
        updateFolderSelectOptions();
    }

    function updateFolderSelectOptions() {
        const folderOptions = getFolderEntries()
            .map(folder => `<option value="${folder.id}">${folder.title}</option>`)
            .join('');

        siteFolderSelect.innerHTML = `<option value="">No folder</option>${folderOptions}`;
        editSiteFolderSelect.innerHTML = `<option value="">No folder</option>${folderOptions}`;
    }

    function closeFolderDropdown() {
        openFolderId = null;
    }

    function resetAddSiteForm() {
        siteNameInput.value = '';
        siteUrlInput.value = '';
        siteIconInput.value = '';
        siteFolderSelect.value = '';
        addSiteModal.classList.add('hidden');
    }

    function resetEditSiteForm() {
        editSiteNameInput.value = '';
        editSiteUrlInput.value = '';
        editSiteIconInput.value = '';
        editSiteFolderSelect.value = '';
        editSiteModal.classList.add('hidden');
        editingSiteId = null;
    }

    function resetAddFolderForm() {
        folderNameInput.value = '';
        folderImageInput.value = '';
        addFolderModal.classList.add('hidden');
    }

    function resetEditFolderForm() {
        editFolderNameInput.value = '';
        editFolderImageInput.value = '';
        editFolderModal.classList.add('hidden');
        editingFolderId = null;
    }
    
    async function fetchFavicon(url) {
        try {
            const domain = new URL(url).hostname;
            
            // Multiple favicon services with different approaches
            const faviconSources = [
                `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                `https://icons.duckduckgo.com/ip3/${domain}.ico`,
                `https://favicon.yandex.net/favicon/v2/${domain}`,
                `https://www.gravatar.com/avatar/${btoa(domain)}?d=identicon&s=32`,
                `https://api.faviconkit.com/${domain}/32`,
                `${new URL(url).origin}/favicon.ico`,
                `${new URL(url).origin}/apple-touch-icon.png`
            ];
            
            // Test multiple sources for better icon coverage
            for (const source of faviconSources) {
                try {
                    // Create a test image to see if it loads
                    const testImg = new Image();
                    testImg.crossOrigin = 'anonymous';
                    
                    const imageLoaded = await new Promise((resolve) => {
                        testImg.onload = () => resolve(true);
                        testImg.onerror = () => resolve(false);
                        testImg.src = source;
                        // Timeout after 2 seconds
                        setTimeout(() => resolve(false), 2000);
                    });
                    
                    if (imageLoaded) {
                        return source;
                    }
                } catch {
                    continue;
                }
            }
            
            // Final fallback - return first source anyway
            return faviconSources[0];
        } catch {
            return generateFallbackIcon(url);
        }
    }
    
    function generateFallbackIcon(url) {
        try {
            const domain = new URL(url).hostname;
            const firstChar = domain.charAt(0).toUpperCase();
            
            // Generate a simple SVG icon with the first character
            return `data:image/svg+xml;base64,${btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="6" fill="#4F46E5"/>
                    <text x="16" y="20" font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
                          text-anchor="middle" fill="white">${firstChar}</text>
                </svg>
            `)}`;
        } catch {
            // Ultimate fallback
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iIzZCNzI4MCIvPgo8cGF0aCBkPSJNMTYgMTBjMy4zIDAgNiAyLjcgNiA2cy0yLjcgNi02IDYtNi0yLjctNi02IDIuNy02IDYtNnoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiLz4KPC9zdmc+';
        }
    }
    
    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch(this.value.trim());
            }
        });

        // Wallpaper controls
        wallpaperBtn.addEventListener('click', () => {
            currentWallpaperIndex = (currentWallpaperIndex + 1) % wallpapers.length;
            localStorage.setItem('wallpaperIndex', currentWallpaperIndex.toString());
            setWallpaper(currentWallpaperIndex);
        });

        // Toggle view button
        toggleViewBtn.addEventListener('click', () => {
            currentView = currentView === 'topSites' ? 'favorites' : 'topSites';
            closeFolderDropdown();
            updateViewToggle();
            updateWidgetVisibility();
            saveSettings();
            renderTopSites();
        });

        // Show more button
        showMoreBtn.addEventListener('click', () => {
            if (currentSiteCount === 12) {
                currentSiteCount = 24;
                showMoreBtn.textContent = 'Show All';
            } else if (currentSiteCount === 24) {
                currentSiteCount = 48;
                showMoreBtn.textContent = 'Show Less';
            } else {
                currentSiteCount = 12;
                showMoreBtn.textContent = 'Show More';
            }
            saveSettings();
            renderTopSites();
        });

        // Customize panel
        customizeBtn.addEventListener('click', () => {
            customizePanel.classList.toggle('hidden');
        });

        closePanelBtn.addEventListener('click', () => {
            customizePanel.classList.add('hidden');
        });

        siteCountSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customCountGroup.style.display = 'block';
                customSiteCountInput.focus();
            } else {
                currentSiteCount = parseInt(e.target.value);
                customCountGroup.style.display = 'none';
                saveSettings();
                renderTopSites();
            }
        });

        // Apply custom count
        applyCustomCountBtn.addEventListener('click', () => {
            const customCount = parseInt(customSiteCountInput.value);
            if (customCount && customCount >= 1 && customCount <= 100) {
                currentSiteCount = customCount;
                saveSettings();
                renderTopSites();
            }
        });

        // Allow Enter key in custom count input
        customSiteCountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyCustomCountBtn.click();
            }
        });

        // Add from open tabs
        addFromTabBtn.addEventListener('click', () => {
            console.log('Getting tabs...');
            
            // Direct simple approach with extensive logging
            if (!chrome || !chrome.tabs) {
                console.error('Chrome tabs API not available');
                alert('Chrome tabs API not available. Make sure this is running as an extension.');
                return;
            }
            
            console.log('Chrome tabs API is available');
            
            chrome.tabs.query({}, function(tabs) {
                console.log('Tab query callback executed');
                console.log('chrome.runtime.lastError:', chrome.runtime.lastError);
                console.log('tabs parameter:', tabs);
                console.log('tabs type:', typeof tabs);
                console.log('tabs is array:', Array.isArray(tabs));
                
                if (chrome.runtime.lastError) {
                    console.error('Chrome runtime error:', chrome.runtime.lastError);
                    alert(`Chrome API error: ${chrome.runtime.lastError.message}`);
                    return;
                }
                
                if (!tabs) {
                    console.error('Tabs is null or undefined');
                    alert('No tab data received from Chrome API');
                    return;
                }
                
                if (tabs.length === 0) {
                    console.log('Tabs array is empty');
                    alert('No open tabs found');
                    return;
                }
                
                console.log(`Found ${tabs.length} tabs`);
                
                // Log each tab individually
                tabs.forEach((tab, i) => {
                    console.log(`Tab ${i}:`, {
                        id: tab?.id,
                        title: tab?.title,
                        url: tab?.url,
                        favIconUrl: tab?.favIconUrl,
                        windowId: tab?.windowId,
                        active: tab?.active,
                        status: tab?.status
                    });
                });
                
                // Try to display tabs regardless of validation
                displayTabSelection(tabs);
            });
        });

        // Cancel tab selection
        cancelTabSelectBtn.addEventListener('click', () => {
            selectTabModal.classList.add('hidden');
        });

        // Add custom site
        addCustomSiteBtn.addEventListener('click', () => {
            updateFolderSelectOptions();
            addSiteModal.classList.remove('hidden');
            siteNameInput.focus();
        });

        addFolderBtn.addEventListener('click', () => {
            addFolderModal.classList.remove('hidden');
            folderNameInput.focus();
        });

        saveSiteBtn.addEventListener('click', async () => {
            const name = siteNameInput.value.trim();
            const url = siteUrlInput.value.trim();
            const iconUrl = siteIconInput.value.trim();
            const folderId = siteFolderSelect.value || null;
            
            if (name && url) {
                const fullUrl = url.startsWith('http') ? url : 'https://' + url;
                const favicon = iconUrl || await fetchFavicon(fullUrl);
                
                const customSite = {
                    id: createEntryId('site'),
                    type: 'site',
                    title: name,
                    url: fullUrl,
                    favicon: favicon,
                    folderId,
                    isCustom: true
                };
                
                customSites.push(customSite);
                saveCustomSites(customSites);

                resetAddSiteForm();
                loadTopSites();
            }
        });

        cancelSiteBtn.addEventListener('click', () => {
            resetAddSiteForm();
        });

        siteNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveSiteBtn.click();
            }
        });

        siteUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveSiteBtn.click();
            }
        });

        // Edit site functionality
        updateSiteBtn.addEventListener('click', async () => {
            const name = editSiteNameInput.value.trim();
            const url = editSiteUrlInput.value.trim();
            const iconUrl = editSiteIconInput.value.trim();
            const folderId = editSiteFolderSelect.value || null;
            
            if (name && url && editingSiteId) {
                const fullUrl = url.startsWith('http') ? url : 'https://' + url;
                const favicon = iconUrl || await fetchFavicon(fullUrl);
                
                // Find and update the site
                const siteIndex = customSites.findIndex(site => String(site.id) === String(editingSiteId));
                if (siteIndex !== -1) {
                    customSites[siteIndex] = {
                        ...customSites[siteIndex],
                        type: 'site',
                        title: name,
                        url: fullUrl,
                        favicon: favicon,
                        folderId
                    };
                    
                    saveCustomSites(customSites);

                    resetEditSiteForm();
                    loadTopSites();
                }
            }
        });

        cancelEditBtn.addEventListener('click', () => {
            resetEditSiteForm();
        });

        editSiteNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateSiteBtn.click();
            }
        });

        editSiteUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateSiteBtn.click();
            }
        });

        saveFolderBtn.addEventListener('click', () => {
            const folderName = folderNameInput.value.trim();
            const folderImage = folderImageInput.value.trim();
            if (!folderName) {
                return;
            }

            saveCustomSites([
                ...customSites,
                {
                    id: createEntryId('folder'),
                    type: 'folder',
                    title: folderName,
                    image: folderImage
                }
            ]);
            resetAddFolderForm();
            loadTopSites();
        });

        cancelFolderBtn.addEventListener('click', () => {
            resetAddFolderForm();
        });

        folderNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveFolderBtn.click();
            }
        });

        folderImageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveFolderBtn.click();
            }
        });

        updateFolderBtn.addEventListener('click', () => {
            const folderName = editFolderNameInput.value.trim();
            const folderImage = editFolderImageInput.value.trim();
            if (!folderName || !editingFolderId) {
                return;
            }

            saveCustomSites(customSites.map(entry => {
                if (String(entry.id) !== String(editingFolderId) || !isFolderEntry(entry)) {
                    return entry;
                }

                return {
                    ...entry,
                    title: folderName,
                    image: folderImage
                };
            }));

            if (String(openFolderId) === String(editingFolderId)) {
                openFolderId = String(editingFolderId);
            }

            resetEditFolderForm();
            loadTopSites();
        });

        cancelEditFolderBtn.addEventListener('click', () => {
            resetEditFolderForm();
        });

        editFolderNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateFolderBtn.click();
            }
        });

        editFolderImageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateFolderBtn.click();
            }
        });

        // Reset sites
        resetSitesBtn.addEventListener('click', () => {
            if (confirm('Reset all custom sites? This action cannot be undone.')) {
                saveCustomSites([]);
                closeFolderDropdown();
                loadTopSites();
            }
        });

        // Export configuration
        exportConfigBtn.addEventListener('click', () => {
            const config = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                settings: {
                    siteCount: currentSiteCount,
                    currentView: currentView,
                    showClockWidget: showClockWidget,
                    showWeatherWidget: showWeatherWidget,
                    showStatsWidget: showStatsWidget,
                    showSearchWidget: showSearchWidget
                },
                customSites: customSites,
                stats: JSON.parse(localStorage.getItem('braveStats') || '{"trackers": 157835, "bandwidth": 4.83, "time": 2.2}'),
                wallpaperIndex: currentWallpaperIndex
            };
            
            const dataStr = JSON.stringify(config, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `brave-extension-config-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Import configuration
        importConfigBtn.addEventListener('click', () => {
            importConfigInput.click();
        });

        importConfigInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const config = JSON.parse(event.target.result);
                        
                        if (confirm('Import configuration? This will replace all current settings and favorites.')) {
                            // Restore settings
                            if (config.settings) {
                                currentSiteCount = config.settings.siteCount || 12;
                                currentView = config.settings.currentView || 'topSites';
                                showClockWidget = config.settings.showClockWidget !== false;
                                showWeatherWidget = config.settings.showWeatherWidget !== false;
                                showStatsWidget = config.settings.showStatsWidget !== false;
                                showSearchWidget = config.settings.showSearchWidget !== false;
                            }
                            
                            // Restore custom sites
                            if (Array.isArray(config.customSites)) {
                                saveCustomSites(config.customSites);
                            }
                            
                            // Restore stats
                            if (config.stats) {
                                localStorage.setItem('braveStats', JSON.stringify(config.stats));
                            }
                            
                            // Restore wallpaper
                            if (config.wallpaperIndex !== undefined) {
                                currentWallpaperIndex = config.wallpaperIndex;
                                localStorage.setItem('wallpaperIndex', currentWallpaperIndex.toString());
                                setWallpaper(currentWallpaperIndex);
                            }
                            
                            // Save settings and reload
                            saveSettings();
                            initializeView();
                            initializeWidgetVisibility();
                            closeFolderDropdown();
                            loadTopSites();
                            updateStats();
                            
                            alert('Configuration imported successfully!');
                        }
                    } catch (error) {
                        alert('Error importing configuration: Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
            e.target.value = ''; // Reset input
        });

        // Weather location update
        updateLocationBtn.addEventListener('click', () => {
            const newLocation = weatherLocationInput.value.trim();
            if (newLocation) {
                weatherLocation = newLocation;
                saveSettings();
                updateWeather();
            }
        });

        weatherLocationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateLocationBtn.click();
            }
        });

        // Time format change
        timeFormatSelect.addEventListener('change', (e) => {
            timeFormat = e.target.value;
            saveSettings();
            updateClock();
        });

        // Temperature format change
        tempFormatSelect.addEventListener('change', (e) => {
            tempFormat = e.target.value;
            saveSettings();
            updateWeather();
        });
        
        // Widget visibility controls
        document.getElementById('showClockWidget').addEventListener('change', (e) => {
            showClockWidget = e.target.checked;
            saveSettings();
            updateWidgetVisibility();
        });
        
        document.getElementById('showWeatherWidget').addEventListener('change', (e) => {
            showWeatherWidget = e.target.checked;
            saveSettings();
            updateWidgetVisibility();
        });
        
        document.getElementById('showStatsWidget').addEventListener('change', (e) => {
            showStatsWidget = e.target.checked;
            saveSettings();
            updateWidgetVisibility();
        });
        
        document.getElementById('showSearchWidget').addEventListener('change', (e) => {
            showSearchWidget = e.target.checked;
            saveSettings();
            updateWidgetVisibility();
        });

        document.addEventListener('click', (e) => {
            if (
                openFolderId &&
                !e.target.closest('.folder-dropdown') &&
                !e.target.closest('.folder-tile')
            ) {
                closeFolderDropdown();
                renderTopSites();
            }
        });
    }

    function displayTabSelection(tabs) {
        const tabList = document.getElementById('tabList');
        const selectTabModal = document.getElementById('selectTabModal');
        
        // Clear existing tabs
        tabList.innerHTML = '';
        
        // Create tab items  
        console.log('Displaying tabs:', tabs.length);
        tabs.forEach((tab, index) => {
            console.log(`Tab ${index}:`, {
                title: tab.title,
                url: tab.url,
                favIconUrl: tab.favIconUrl,
                id: tab.id
            });
            const tabItem = document.createElement('div');
            tabItem.className = 'tab-item';
            tabItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 8px;
            `;
            
            // Add hover effect
            tabItem.addEventListener('mouseenter', () => {
                tabItem.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            tabItem.addEventListener('mouseleave', () => {
                tabItem.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            
            // Tab icon
            const tabIcon = document.createElement('div');
            tabIcon.style.cssText = `
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 4px;
                flex-shrink: 0;
            `;
            
            if (tab && tab.favIconUrl && tab.favIconUrl !== '') {
                const img = document.createElement('img');
                img.src = tab.favIconUrl;
                img.style.cssText = 'width: 16px; height: 16px; border-radius: 2px;';
                img.onerror = () => {
                    tabIcon.innerHTML = '🌐';
                    tabIcon.style.background = 'transparent';
                    tabIcon.style.fontSize = '16px';
                };
                tabIcon.appendChild(img);
            } else {
                tabIcon.innerHTML = '🌐';
                tabIcon.style.background = 'transparent';
                tabIcon.style.fontSize = '16px';
            }
            
            // Tab details
            const tabDetails = document.createElement('div');
            tabDetails.style.cssText = 'flex: 1; min-width: 0;';
            
            const tabTitle = document.createElement('div');
            const displayTitle = (tab && tab.title) ? tab.title : 
                              (tab && tab.url) ? tab.url : 
                              `Tab ${index + 1}`;
            tabTitle.textContent = displayTitle;
            tabTitle.style.cssText = `
                color: #fff;
                font-size: 14px;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 2px;
            `;
            
            const tabUrl = document.createElement('div');
            const displayUrl = (tab && tab.url) ? tab.url : 'No URL available';
            tabUrl.textContent = displayUrl;
            tabUrl.style.cssText = `
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            
            tabDetails.appendChild(tabTitle);
            tabDetails.appendChild(tabUrl);
            
            tabItem.appendChild(tabIcon);
            tabItem.appendChild(tabDetails);
            
            // Add click handler to select tab
            tabItem.addEventListener('click', async () => {
                if (!tab || !tab.url) {
                    alert('Invalid tab data - cannot add to favorites');
                    return;
                }
                
                let favicon;
                try {
                    favicon = (tab.favIconUrl && tab.favIconUrl !== '') ? 
                        tab.favIconUrl : 
                        await fetchFavicon(tab.url);
                } catch (error) {
                    console.error('Error fetching favicon:', error);
                    favicon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI2Y1ZjVmNSIvPgo8L3N2Zz4K';
                }
                
                const customSite = {
                    id: createEntryId('site'),
                    type: 'site',
                    title: (tab.title && tab.title !== '') ? tab.title : 
                           (tab.url ? new URL(tab.url).hostname : 'Untitled'),
                    url: tab.url,
                    favicon: favicon,
                    folderId: null,
                    isCustom: true
                };
                
                customSites.push(customSite);
                saveCustomSites(customSites);
                
                // Switch to favorites view if not already there
                if (currentView !== 'favorites') {
                    currentView = 'favorites';
                    updateViewToggle();
                    saveSettings();
                }
                
                loadTopSites();
                selectTabModal.classList.add('hidden');
                
                // Show success message
                const notification = document.createElement('div');
                notification.textContent = `Added "${customSite.title}" to favorites!`;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(76, 175, 80, 0.9);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    z-index: 1001;
                    backdrop-filter: blur(10px);
                    font-size: 14px;
                    transition: opacity 0.3s ease;
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 300);
                }, 3000);
            });
            
            tabList.appendChild(tabItem);
        });
        
        // Show the modal
        selectTabModal.classList.remove('hidden');
    }

    function handleSearch(query) {
        if (query) {
            // Check if it looks like a URL
            if (query.includes('.') && !query.includes(' ')) {
                const url = query.startsWith('http') ? query : 'https://' + query;
                window.location.href = url;
            } else {
                // Search on Google
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
        }
    }

    function loadTopSites() {
        try {
            chrome.topSites.get((sites) => {
                allSites = [];
                
                // Add browser's real top sites first
                sites.forEach(site => {
                    allSites.push({
                        url: site.url,
                        title: site.title,
                        isReal: true
                    });
                });
                
                // Add custom sites
                customSites.forEach(site => {
                    if (isSiteEntry(site)) {
                        allSites.push(site);
                    }
                });
                
                // Add popular sites to fill gaps
                const popularSites = getPopularSites();
                const existingUrls = new Set(allSites.map(site => {
                    try {
                        return new URL(site.url).hostname;
                    } catch {
                        return site.url;
                    }
                }));
                
                for (const site of popularSites) {
                    if (allSites.length >= 48) break;
                    
                    try {
                        const hostname = new URL(site.url).hostname;
                        if (!existingUrls.has(hostname)) {
                            allSites.push(site);
                            existingUrls.add(hostname);
                        }
                    } catch {
                        // Skip invalid URLs
                    }
                }
                
                renderTopSites();
            });
        } catch (error) {
            console.error('Error loading top sites:', error);
            // Fallback: use custom sites and popular sites
            allSites = [...customSites, ...getPopularSites()].slice(0, 48);
            renderTopSites();
        }
    }

    function getPopularSites() {
        return [
            { url: 'https://www.youtube.com', title: 'YouTube' },
            { url: 'https://www.google.com', title: 'Google' },
            { url: 'https://www.facebook.com', title: 'Facebook' },
            { url: 'https://www.twitter.com', title: 'Twitter' },
            { url: 'https://www.instagram.com', title: 'Instagram' },
            { url: 'https://www.reddit.com', title: 'Reddit' },
            { url: 'https://www.amazon.com', title: 'Amazon' },
            { url: 'https://www.netflix.com', title: 'Netflix' },
            { url: 'https://www.github.com', title: 'GitHub' },
            { url: 'https://www.stackoverflow.com', title: 'Stack Overflow' },
            { url: 'https://www.wikipedia.org', title: 'Wikipedia' },
            { url: 'https://www.linkedin.com', title: 'LinkedIn' },
            { url: 'https://www.gmail.com', title: 'Gmail' },
            { url: 'https://www.microsoft.com', title: 'Microsoft' },
            { url: 'https://www.apple.com', title: 'Apple' },
            { url: 'https://www.discord.com', title: 'Discord' },
            { url: 'https://www.twitch.tv', title: 'Twitch' },
            { url: 'https://www.spotify.com', title: 'Spotify' },
            { url: 'https://www.dropbox.com', title: 'Dropbox' },
            { url: 'https://www.zoom.us', title: 'Zoom' },
            { url: 'https://www.slack.com', title: 'Slack' },
            { url: 'https://www.notion.so', title: 'Notion' },
            { url: 'https://www.figma.com', title: 'Figma' },
            { url: 'https://www.canva.com', title: 'Canva' },
            { url: 'https://www.pinterest.com', title: 'Pinterest' },
            { url: 'https://www.paypal.com', title: 'PayPal' },
            { url: 'https://www.ebay.com', title: 'eBay' },
            { url: 'https://www.airbnb.com', title: 'Airbnb' },
            { url: 'https://www.uber.com', title: 'Uber' },
            { url: 'https://www.whatsapp.com', title: 'WhatsApp' },
            { url: 'https://www.telegram.org', title: 'Telegram' },
            { url: 'https://www.adobe.com', title: 'Adobe' },
            { url: 'https://www.trello.com', title: 'Trello' },
            { url: 'https://www.medium.com', title: 'Medium' },
            { url: 'https://www.quora.com', title: 'Quora' },
            { url: 'https://www.codepen.io', title: 'CodePen' }
        ];
    }

    function renderTopSites() {
        let sitesToShow = [];
        
        // Filter sites based on current view
        if (currentView === 'favorites') {
            const topLevelFavorites = getTopLevelFavoriteEntries();
            sitesToShow = topLevelFavorites.slice(0, currentSiteCount);
            
            // Add clock and weather widgets as tiles in favorites view
            if (showClockWidget) {
                sitesToShow.unshift({
                    id: 'clock-widget',
                    title: 'Clock',
                    url: '#',
                    favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTEyIDZ2Nmw0IDIiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K',
                    isWidget: true,
                    widgetType: 'clock'
                });
            }
            
            if (showWeatherWidget) {
                sitesToShow.unshift({
                    id: 'weather-widget',
                    title: 'Weather',
                    url: '#',
                    favicon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJhNiA2IDAgMCAxIDYgNmMwIDIuNS0yIDQuNS00LjUgNC41UzcuNSAxMC41IDcuNSA4YTYgNiAwIDAgMSAzLTZaIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik0xMiAxMnY0TTkgMTRoNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=',
                    isWidget: true,
                    widgetType: 'weather'
                });
            }
        } else {
            // Show top sites (real sites + popular sites, but not custom ones)
            const nonCustomSites = allSites.filter(site => !site.isCustom);
            sitesToShow = nonCustomSites.slice(0, currentSiteCount);
        }
        
        topSitesGrid.innerHTML = '';
        const topLevelEntries = getTopLevelFavoriteEntries();
        const topLevelIndexById = new Map();
        topLevelEntries.forEach((entry, index) => {
            topLevelIndexById.set(String(entry.id), index);
        });
        
        sitesToShow.forEach((site, index) => {
            const siteElement = document.createElement('div');
            siteElement.className = 'top-site';
            siteElement.dataset.siteId = site.id;
            siteElement.dataset.siteIndex = index;
            
            if (site.type === 'folder') {
                siteElement.classList.add('editable', 'folder-tile', 'draggable');
                siteElement.dataset.entryType = 'folder';
                siteElement.draggable = currentView === 'favorites';
                const folderChildren = getFolderChildren(String(site.id));
                const previewMarkup = folderChildren
                    .slice(0, 4)
                    .map(child => {
                        const folderFavicon = child.favicon || getFavicon(child.url);
                        return `<span class="folder-preview-icon"><img src="${folderFavicon}" alt="${child.title}"></span>`;
                    })
                    .join('');
                const folderIconMarkup = site.image
                    ? `
                        <div class="site-icon folder-icon folder-icon-image">
                            <img src="${site.image}" alt="${site.title}" onerror="this.closest('.folder-icon').classList.add('folder-icon-fallback'); this.remove();">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="folder-icon-svg">
                                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    `
                    : `
                        <div class="site-icon folder-icon folder-icon-fallback">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="folder-icon-svg">
                                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    `;

                siteElement.innerHTML = `
                    ${folderIconMarkup}
                    <div class="site-title">${site.title}</div>
                    <div class="folder-meta">
                        <span class="folder-count">${folderChildren.length} site${folderChildren.length === 1 ? '' : 's'}</span>
                        <div class="folder-preview">${previewMarkup}</div>
                    </div>
                    <div class="site-actions">
                        <button class="edit-folder-btn" title="Edit Folder">✏️</button>
                        <button class="delete-folder-btn" title="Delete Folder">×</button>
                    </div>
                `;

                if (String(openFolderId) === String(site.id)) {
                    const dropdown = document.createElement('div');
                    dropdown.className = 'folder-dropdown';

                    if (folderChildren.length === 0) {
                        dropdown.innerHTML = '<div class="folder-empty">No sites in this folder yet.</div>';
                    } else {
                        folderChildren.forEach(child => {
                            const item = document.createElement('div');
                            item.className = 'folder-site-item';
                            item.innerHTML = `
                                <div class="folder-site-main">
                                    <span class="folder-site-icon"><img src="${child.favicon || getFavicon(child.url)}" alt="${child.title}"></span>
                                    <div class="folder-site-text">
                                        <div class="folder-site-title">${child.title}</div>
                                        <div class="folder-site-url">${child.url}</div>
                                    </div>
                                </div>
                                <div class="folder-site-actions">
                                    <button class="folder-site-edit-btn" data-site-id="${child.id}" title="Edit">✏️</button>
                                    <button class="folder-site-delete-btn" data-site-id="${child.id}" title="Delete">×</button>
                                </div>
                            `;
                            item.addEventListener('click', (event) => {
                                if (
                                    event.target.closest('.folder-site-edit-btn') ||
                                    event.target.closest('.folder-site-delete-btn')
                                ) {
                                    return;
                                }

                                window.location.href = child.url;
                            });
                            dropdown.appendChild(item);
                        });
                    }

                    siteElement.appendChild(dropdown);
                }
            } else if (site.isCustom) {
                siteElement.classList.add('editable');
                // Only make custom sites draggable in favorites view
                if (currentView === 'favorites') {
                    siteElement.classList.add('draggable');
                    siteElement.draggable = true;
                    const topLevelIndex = topLevelIndexById.get(String(site.id));
                    if (Number.isInteger(topLevelIndex)) {
                        siteElement.dataset.topLevelIndex = topLevelIndex;
                    }
                }
            }
            
            if (site.isWidget) {
                siteElement.classList.add('widget-tile');
            }
            
            // Use stored favicon for custom sites, or generate for others
            const favicon = site.favicon || getFavicon(site.url);
            
            if (site.isWidget) {
                // Widget tiles show different content
                if (site.widgetType === 'clock') {
                    siteElement.innerHTML = `
                        <div class="widget-content">
                            <div class="widget-time" id="widget-time">--:--</div>
                            <div class="widget-date" id="widget-date">-- --- --</div>
                        </div>
                    `;
                } else if (site.widgetType === 'weather') {
                    siteElement.innerHTML = `
                        <div class="widget-content">
                            <div class="widget-weather-icon" id="widget-weather-icon">⋯</div>
                            <div class="widget-temp" id="widget-temp">--°</div>
                            <div class="widget-desc" id="widget-desc">Loading...</div>
                        </div>
                    `;
                }
            } else if (site.type !== 'folder') {
                siteElement.innerHTML = `
                    <div class="site-icon">
                        <img src="${favicon}" alt="${site.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI2Y1ZjVmNSIvPgo8L3N2Zz4K'">
                    </div>
                    <div class="site-title">${site.title}</div>
                    ${site.isCustom ? '<div class="site-actions"><button class="edit-site-btn" title="Edit">✏️</button><button class="delete-site-btn" title="Delete">×</button></div>' : ''}
                `;
            }
            
            // Only custom favorites participate in reorder operations
            if (
                currentView === 'favorites' &&
                (
                    site.type === 'folder' ||
                    (site.isCustom && site.folderId === null)
                )
            ) {
                setupDragAndDrop(siteElement);
            }
            
            // Add click handler for navigation
            siteElement.addEventListener('click', (e) => {
                if (e.target.classList.contains('edit-folder-btn')) {
                    editingFolderId = site.id;
                    editFolderNameInput.value = site.title;
                    editFolderImageInput.value = site.image || '';
                    editFolderModal.classList.remove('hidden');
                    e.stopPropagation();
                    return;
                }

                if (e.target.classList.contains('delete-folder-btn')) {
                    const folderChildren = getFolderChildren(String(site.id));
                    if (confirm(`Delete folder "${site.title}"? Sites inside it will be moved back to Favorites.`)) {
                        saveCustomSites(customSites
                            .filter(entry => String(entry.id) !== String(site.id))
                            .map(entry => {
                                if (isSiteEntry(entry) && String(entry.folderId) === String(site.id)) {
                                    return {
                                        ...entry,
                                        folderId: null
                                    };
                                }

                                return entry;
                            }));
                        closeFolderDropdown();
                        loadTopSites();
                    }
                    e.stopPropagation();
                    return;
                }

                // Check if clicked on action buttons
                if (e.target.classList.contains('edit-site-btn')) {
                    // Edit button clicked
                    editingSiteId = site.id;
                    editSiteNameInput.value = site.title;
                    editSiteUrlInput.value = site.url;
                    editSiteIconInput.value = site.favicon || '';
                    updateFolderSelectOptions();
                    editSiteFolderSelect.value = site.folderId || '';
                    editSiteModal.classList.remove('hidden');
                    e.stopPropagation();
                    return;
                }
                
                if (e.target.classList.contains('delete-site-btn')) {
                    // Delete button clicked
                    if (confirm(`Remove "${site.title}" from favorites?`)) {
                        saveCustomSites(customSites.filter(s => String(s.id) !== String(site.id)));
                        closeFolderDropdown();
                        loadTopSites();
                    }
                    e.stopPropagation();
                    return;
                }

                if (e.target.classList.contains('folder-site-edit-btn')) {
                    const childSite = findEntryById(e.target.dataset.siteId);
                    if (!childSite || !isSiteEntry(childSite)) {
                        return;
                    }

                    editingSiteId = childSite.id;
                    editSiteNameInput.value = childSite.title;
                    editSiteUrlInput.value = childSite.url;
                    editSiteIconInput.value = childSite.favicon || '';
                    updateFolderSelectOptions();
                    editSiteFolderSelect.value = childSite.folderId || '';
                    editSiteModal.classList.remove('hidden');
                    e.stopPropagation();
                    return;
                }

                if (e.target.classList.contains('folder-site-delete-btn')) {
                    const childSite = findEntryById(e.target.dataset.siteId);
                    if (childSite && confirm(`Remove "${childSite.title}" from favorites?`)) {
                        saveCustomSites(customSites.filter(entry => String(entry.id) !== String(childSite.id)));
                        loadTopSites();
                    }
                    e.stopPropagation();
                    return;
                }
                
                // Don't navigate if clicked on action buttons container
                if (
                    e.target.classList.contains('site-actions') ||
                    e.target.closest('.site-actions') ||
                    e.target.closest('.folder-dropdown') ||
                    e.target.closest('.folder-site-actions')
                ) {
                    e.stopPropagation();
                    return;
                }
                
                // Handle widget clicks
                if (site.isWidget) {
                    e.preventDefault();
                    e.stopPropagation();
                    return; // Widgets don't navigate anywhere
                }

                if (site.type === 'folder') {
                    openFolderId = String(openFolderId) === String(site.id) ? null : String(site.id);
                    renderTopSites();
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                
                // Navigate to site
                window.location.href = site.url;
            });
            
            topSitesGrid.appendChild(siteElement);
        });
        
        // Add quick-add button in favorites view
        if (currentView === 'favorites' && sitesToShow.length < currentSiteCount) {
            const addButton = document.createElement('div');
            addButton.className = 'top-site add-site-tile';
            addButton.innerHTML = `
                <div class="site-icon add-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="site-title">Add Site</div>
                <div class="quick-add-options">
                    <button class="quick-add-btn manual-add" title="Add Manually">✏️</button>
                    <button class="quick-add-btn from-tab" title="From Open Tab">📋</button>
                    <button class="quick-add-btn make-folder" title="Add Folder">📁</button>
                </div>
            `;
            
            // Manual add button
            addButton.querySelector('.manual-add').addEventListener('click', (e) => {
                e.stopPropagation();
                updateFolderSelectOptions();
                addSiteModal.classList.remove('hidden');
                siteNameInput.focus();
            });
            
            // From tab button
            addButton.querySelector('.from-tab').addEventListener('click', (e) => {
                e.stopPropagation();
                
                chrome.tabs.query({}, (tabs) => {
                    if (chrome.runtime.lastError) {
                        console.error('Chrome runtime error:', chrome.runtime.lastError);
                        alert(`Chrome API error: ${chrome.runtime.lastError.message}`);
                        return;
                    }
                    
                    if (tabs && tabs.length > 0) {
                        // More lenient filtering
                        const validTabs = tabs.filter(tab => {
                            const hasUrl = tab.url && typeof tab.url === 'string';
                            const isNotExtension = !tab.url || (
                                !tab.url.startsWith('chrome-extension://') && 
                                !tab.url.startsWith('chrome://') &&
                                !tab.url.startsWith('moz-extension://') &&
                                !tab.url.startsWith('about:blank')
                            );
                            return hasUrl && isNotExtension;
                        });
                        
                        if (validTabs.length > 0) {
                            displayTabSelection(validTabs);
                        } else if (tabs.length > 0) {
                            displayTabSelection(tabs);
                        } else {
                            alert('No valid tabs found.');
                        }
                    } else {
                        alert('No open tabs found.');
                    }
                });
            });

            addButton.querySelector('.make-folder').addEventListener('click', (e) => {
                e.stopPropagation();
                addFolderModal.classList.remove('hidden');
                folderNameInput.focus();
            });
            
            // Main tile click for manual add (fallback)
            addButton.addEventListener('click', (e) => {
                if (!e.target.classList.contains('quick-add-btn')) {
                    updateFolderSelectOptions();
                    addSiteModal.classList.remove('hidden');
                    siteNameInput.focus();
                }
            });
            
            topSitesGrid.appendChild(addButton);
        }
        
        updateGridDisplay();
        
        // Setup drop zones for drag and drop functionality
        setupDropZones();
        
        // Update widget tiles with current data after rendering
        updateWidgetTiles();
    }

    function updateGridDisplay() {
        topSitesGrid.className = 'top-sites-grid';
        
        if (currentSiteCount === 12) {
            topSitesGrid.classList.add('expanded-12');
            showMoreBtn.textContent = 'Show More';
        } else if (currentSiteCount === 24) {
            topSitesGrid.classList.add('expanded-24');
            showMoreBtn.textContent = 'Show All';
        } else if (currentSiteCount === 48) {
            topSitesGrid.classList.add('expanded-48');
            showMoreBtn.textContent = 'Show Less';
        }
        
        siteCountSelect.value = currentSiteCount.toString();
    }

    function getFavicon(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI2Y1ZjVmNSIvPgo8L3N2Zz4K';
        }
    }
    
    function updateClock() {
        const now = new Date();
        const is12Hour = timeFormat === '12h';
        const timeString = now.toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: is12Hour 
        });
        const dateString = now.toLocaleDateString([], { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        currentTimeEl.textContent = timeString;
        currentDateEl.textContent = dateString;
        
        // Update widget tiles if they exist
        const widgetTime = document.getElementById('widget-time');
        const widgetDate = document.getElementById('widget-date');
        if (widgetTime) widgetTime.textContent = timeString;
        if (widgetDate) widgetDate.textContent = dateString;
        
        // Also update any widget tiles in the grid
        updateWidgetTiles();
    }

    function mapWeatherCode(weatherCode, isDay) {
        const code = Number(weatherCode);

        if (code === 0) {
            return {
                label: 'Clear sky',
                icon: isDay ? '☀️' : '🌙'
            };
        }

        if ([1, 2].includes(code)) {
            return {
                label: 'Partly cloudy',
                icon: isDay ? '🌤️' : '☁️'
            };
        }

        if (code === 3) {
            return {
                label: 'Overcast',
                icon: '☁️'
            };
        }

        if ([45, 48].includes(code)) {
            return {
                label: 'Foggy',
                icon: '🌫️'
            };
        }

        if ([51, 53, 55, 56, 57].includes(code)) {
            return {
                label: 'Drizzle',
                icon: '🌦️'
            };
        }

        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
            return {
                label: 'Rain',
                icon: '🌧️'
            };
        }

        if ([71, 73, 75, 77, 85, 86].includes(code)) {
            return {
                label: 'Snow',
                icon: '❄️'
            };
        }

        if ([95, 96, 99].includes(code)) {
            return {
                label: 'Thunderstorm',
                icon: '⛈️'
            };
        }

        return {
            label: 'Weather unavailable',
            icon: '🌡️'
        };
    }

    function formatLocationLabel(locationName) {
        return locationName.split(',')[0].trim() || locationName;
    }

    function getEffectiveWeatherLocation() {
        return weatherLocation.trim() || 'New York';
    }

    function renderWeatherState({
        locationLabel,
        temp,
        unit,
        high,
        low,
        desc,
        icon,
        isStale = false
    }) {
        latestWeatherDisplay = {
            locationLabel,
            temp,
            unit,
            high,
            low,
            desc,
            icon,
            isStale
        };
        weatherIconEl.textContent = icon;
        weatherInfoEl.innerHTML = `
            <div class="weather-location-row">
                <div class="weather-location">${locationLabel}</div>
                ${isStale ? '<div class="weather-status">Offline</div>' : '<div class="weather-status weather-status-live">Live</div>'}
            </div>
            <div class="weather-temp-row">
                <div class="weather-temp">${temp}${unit}</div>
                <div class="weather-range">H ${high}${unit} / L ${low}${unit}</div>
            </div>
            <div class="weather-desc">${desc}</div>
        `;

        const widgetTemp = document.getElementById('widget-temp');
        const widgetDesc = document.getElementById('widget-desc');
        if (widgetTemp) {
            widgetTemp.textContent = `${temp}${unit}`;
        }
        if (widgetDesc) {
            widgetDesc.textContent = desc;
        }

        updateWidgetTiles();
    }

    function renderWeatherUnavailable(message) {
        latestWeatherDisplay = {
            locationLabel: formatLocationLabel(weatherLocation),
            temp: '--',
            unit: '',
            high: '--',
            low: '--',
            desc: message,
            icon: '🌡️',
            isStale: true
        };
        weatherIconEl.textContent = '🌡️';
        weatherInfoEl.innerHTML = `
            <div class="weather-location-row">
                <div class="weather-location">${formatLocationLabel(weatherLocation)}</div>
                <div class="weather-status">Offline</div>
            </div>
            <div class="weather-temp-row">
                <div class="weather-temp">--</div>
                <div class="weather-range">Check location</div>
            </div>
            <div class="weather-desc">${message}</div>
        `;

        const widgetTemp = document.getElementById('widget-temp');
        const widgetDesc = document.getElementById('widget-desc');
        if (widgetTemp) widgetTemp.textContent = '--';
        if (widgetDesc) widgetDesc.textContent = message;

        updateWidgetTiles();
    }

    async function fetchJsonWithTimeout(url, timeoutMs = 8000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            return await response.json();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function fetchWttrWeather(unit) {
        const effectiveLocation = getEffectiveWeatherLocation();
        const wttrData = await fetchJsonWithTimeout(
            `https://wttr.in/${encodeURIComponent(effectiveLocation)}?format=j1`,
            5000
        );

        if (
            !wttrData ||
            !Array.isArray(wttrData.current_condition) ||
            !wttrData.current_condition[0] ||
            !Array.isArray(wttrData.weather) ||
            !wttrData.weather[0]
        ) {
            throw new Error('Invalid wttr weather data');
        }

        const current = wttrData.current_condition[0];
        const today = wttrData.weather[0];
        const temp = tempFormat === 'celsius'
            ? Math.round(Number(current.temp_C))
            : Math.round(Number(current.temp_F));
        const high = tempFormat === 'celsius'
            ? Math.round(Number(today.maxtempC))
            : Math.round(Number(today.maxtempF));
        const low = tempFormat === 'celsius'
            ? Math.round(Number(today.mintempC))
            : Math.round(Number(today.mintempF));
        const desc = current.weatherDesc && current.weatherDesc[0] ? current.weatherDesc[0].value : 'Current conditions';
        const isDay = current.isday === 'yes';
        const weatherMeta = mapWeatherCode(Number(current.weatherCode), isDay);

        return {
            locationLabel: formatLocationLabel(effectiveLocation),
            temp,
            unit,
            high,
            low,
            desc,
            icon: weatherMeta.icon === '🌡️' ? (isDay ? '🌤️' : '🌙') : weatherMeta.icon,
            isStale: false
        };
    }

    async function geocodeLocation(locationQuery) {
        const geocodeData = await fetchJsonWithTimeout(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1&language=en&format=json`
        );

        const primaryMatch = Array.isArray(geocodeData.results) ? geocodeData.results[0] : null;
        if (primaryMatch) {
            return {
                name: primaryMatch.name,
                latitude: primaryMatch.latitude,
                longitude: primaryMatch.longitude
            };
        }

        const nominatimResults = await fetchJsonWithTimeout(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(locationQuery)}`,
            5000
        );
        const fallbackMatch = Array.isArray(nominatimResults) ? nominatimResults[0] : null;
        if (!fallbackMatch) {
            throw new Error('Location not found');
        }

        return {
            name: fallbackMatch.display_name || locationQuery,
            latitude: Number(fallbackMatch.lat),
            longitude: Number(fallbackMatch.lon)
        };
    }
    
    async function updateWeather() {
        const requestId = ++latestWeatherRequestId;
        const unit = tempFormat === 'celsius' ? '°C' : '°F';
        const temperatureUnit = tempFormat === 'celsius' ? 'celsius' : 'fahrenheit';
        const effectiveLocation = getEffectiveWeatherLocation();

        try {
            weatherIconEl.textContent = '⋯';
            weatherInfoEl.innerHTML = `
                <div class="weather-location-row">
                    <div class="weather-location">${formatLocationLabel(effectiveLocation)}</div>
                    <div class="weather-status">Loading</div>
                </div>
                <div class="weather-temp-row">
                    <div class="weather-temp">--</div>
                    <div class="weather-range">Fetching now</div>
                </div>
                <div class="weather-desc">Updating current conditions</div>
            `;

            let weatherState;

            try {
                const match = await geocodeLocation(effectiveLocation);

                const weatherData = await fetchJsonWithTimeout(
                    `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,apparent_temperature,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&temperature_unit=${temperatureUnit}&timezone=auto`
                );

                const current = weatherData.current;
                const daily = weatherData.daily;
                if (
                    !current ||
                    typeof current.temperature_2m !== 'number' ||
                    typeof current.weather_code !== 'number' ||
                    !daily ||
                    !Array.isArray(daily.temperature_2m_max) ||
                    !Array.isArray(daily.temperature_2m_min)
                ) {
                    throw new Error('Invalid weather data');
                }

                const weatherMeta = mapWeatherCode(current.weather_code, current.is_day === 1);
                weatherState = {
                    locationLabel: formatLocationLabel(match.name),
                    temp: Math.round(current.temperature_2m),
                    unit,
                    high: Math.round(daily.temperature_2m_max[0]),
                    low: Math.round(daily.temperature_2m_min[0]),
                    desc: weatherMeta.label,
                    icon: weatherMeta.icon,
                    isStale: false
                };
            } catch (primaryError) {
                console.warn('Primary weather provider failed, falling back to wttr.in:', primaryError);
                weatherState = await fetchWttrWeather(unit);
            }

            if (requestId !== latestWeatherRequestId) {
                return;
            }

            localStorage.setItem('weatherCache', JSON.stringify({
                weatherLocation: effectiveLocation,
                tempFormat,
                weatherState,
                savedAt: Date.now()
            }));

            renderWeatherState(weatherState);
        } catch (error) {
            if (requestId !== latestWeatherRequestId) {
                return;
            }

            console.error('Weather fetch error:', error);
            const cachedWeatherRaw = localStorage.getItem('weatherCache');

            if (cachedWeatherRaw) {
                try {
                    const cachedWeather = JSON.parse(cachedWeatherRaw);
                    const isMatchingCache =
                        cachedWeather &&
                        cachedWeather.weatherLocation === effectiveLocation &&
                        cachedWeather.tempFormat === tempFormat &&
                        cachedWeather.weatherState;

                    if (isMatchingCache) {
                        renderWeatherState({
                            ...cachedWeather.weatherState,
                            isStale: true
                        });
                        return;
                    }
                } catch (cacheError) {
                    console.warn('Failed to read cached weather:', cacheError);
                }
            }

            if (latestWeatherDisplay.temp !== '--') {
                renderWeatherState({
                    ...latestWeatherDisplay,
                    isStale: true
                });
                return;
            }

            renderWeatherUnavailable('Weather unavailable');
        }
    }
    
    function startClock() {
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    function makeDraggable(element, positionState, isStats = false, isSearch = false) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let startLeft = 0;
        let startTop = 0;
        
        // Don't make search bar draggable
        if (isSearch) {
            element.style.cursor = 'default';
            element.style.userSelect = 'auto';
            return; // Exit early for search bar
        }
        
        element.style.cursor = 'move';
        element.style.userSelect = 'none';
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            element.style.transition = 'none';
            
            // Show grid when dragging starts
            let gridOverlay = document.getElementById('gridOverlay');
            if (!gridOverlay) {
                createGridOverlay();
                gridOverlay = document.getElementById('gridOverlay');
            }
            gridOverlay.classList.remove('hidden');
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            
            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;
            
            // Constrain to viewport
            const maxLeft = window.innerWidth - element.offsetWidth;
            const maxTop = window.innerHeight - element.offsetHeight;
            
            const constrainedLeft = Math.max(0, Math.min(maxLeft, newLeft));
            const constrainedTop = Math.max(0, Math.min(maxTop, newTop));
            
            // Grid snapping (20px grid)
            const gridSize = 20;
            const snappedLeft = Math.round(constrainedLeft / gridSize) * gridSize;
            const snappedTop = Math.round(constrainedTop / gridSize) * gridSize;
            
            element.style.position = 'fixed';
            element.style.left = snappedLeft + 'px';
            element.style.top = snappedTop + 'px';
            
            if (isStats) {
                element.style.right = 'auto';
                element.style.justifyContent = 'flex-start';
                element.style.margin = '0';
            } else if (isSearch) {
                // Keep search bar at bottom center - don't allow dragging
                element.style.bottom = '40px';
                element.style.left = '50%';
                element.style.transform = 'translateX(-50%)';
                element.style.top = 'auto';
                element.style.right = 'auto';
            } else {
                // Clock and weather widgets use right positioning
                element.style.right = (window.innerWidth - snappedLeft - element.offsetWidth) + 'px';
                element.style.left = 'auto';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.transition = '';
                
                // Hide grid when dragging ends
                const gridOverlay = document.getElementById('gridOverlay');
                if (gridOverlay) {
                    gridOverlay.classList.add('hidden');
                }
                
                // Save position
                const rect = element.getBoundingClientRect();
                if (isStats) {
                    positionState.top = rect.top;
                    positionState.left = rect.left;
                    // Ensure final position is set correctly
                    element.style.top = rect.top + 'px';
                    element.style.left = rect.left + 'px';
                    element.style.right = 'auto';
                } else if (isSearch) {
                    // Keep search bar at bottom center
                    positionState.bottom = 40;
                    positionState.left = 50;
                    positionState.transform = 'translateX(-50%)';
                    // Ensure the final position is set correctly
                    element.style.bottom = '40px';
                    element.style.left = '50%';
                    element.style.transform = 'translateX(-50%)';
                    element.style.top = 'auto';
                    element.style.right = 'auto';
                } else {
                    // Clock and weather widgets
                    positionState.top = rect.top;
                    positionState.right = window.innerWidth - rect.right;
                    // Ensure final position is set correctly
                    element.style.top = rect.top + 'px';
                    element.style.right = (window.innerWidth - rect.right) + 'px';
                    element.style.left = 'auto';
                }
                
                saveSettings();
            }
        });
    }
    
    function initializePositions() {
        const clockWidget = document.querySelector('.clock-widget');
        const weatherWidget = document.querySelector('.weather-widget');
        const searchWidget = document.querySelector('.search-section');
        const statsWidget = document.querySelector('.stats-section');
        
        // Set clock position - always set position
        clockWidget.style.top = clockPosition.top + 'px';
        clockWidget.style.right = clockPosition.right + 'px';
        clockWidget.style.left = 'auto';
        
        // Set weather position - always set position
        weatherWidget.style.top = weatherPosition.top + 'px';
        weatherWidget.style.right = weatherPosition.right + 'px';
        weatherWidget.style.left = 'auto';
        
        // Set search position - always set position
        searchWidget.style.bottom = searchPosition.bottom + 'px';
        searchWidget.style.left = searchPosition.left + '%';
        searchWidget.style.transform = searchPosition.transform;
        searchWidget.style.top = 'auto';
        searchWidget.style.right = 'auto';
        
        // Set stats position - always set position
        statsWidget.style.top = statsPosition.top + 'px';
        statsWidget.style.left = statsPosition.left + 'px';
        statsWidget.style.right = 'auto';
        
        // Make all widgets draggable
        makeDraggable(clockWidget, clockPosition, false);
        makeDraggable(weatherWidget, weatherPosition, false);
        makeDraggable(searchWidget, searchPosition, false, true); // isSearch = true
        makeDraggable(statsWidget, statsPosition, true); // isStats = true
    }
    
    function snapWidgetsToGrid() {
        const gridSize = 20;
        const clockWidget = document.querySelector('.clock-widget');
        const weatherWidget = document.querySelector('.weather-widget');
        const searchWidget = document.querySelector('.search-section');
        const statsWidget = document.querySelector('.stats-section');
        
        // Snap clock widget - always update position on resize
        if (clockWidget) {
            const rect = clockWidget.getBoundingClientRect();
            const snappedTop = Math.round(rect.top / gridSize) * gridSize;
            const snappedRight = Math.round((window.innerWidth - rect.right) / gridSize) * gridSize;
            clockWidget.style.top = snappedTop + 'px';
            clockWidget.style.right = snappedRight + 'px';
            clockWidget.style.left = 'auto';
            clockPosition.top = snappedTop;
            clockPosition.right = snappedRight;
        }
        
        // Snap weather widget - always update position on resize
        if (weatherWidget) {
            const rect = weatherWidget.getBoundingClientRect();
            const snappedTop = Math.round(rect.top / gridSize) * gridSize;
            const snappedRight = Math.round((window.innerWidth - rect.right) / gridSize) * gridSize;
            weatherWidget.style.top = snappedTop + 'px';
            weatherWidget.style.right = snappedRight + 'px';
            weatherWidget.style.left = 'auto';
            weatherPosition.top = snappedTop;
            weatherPosition.right = snappedRight;
        }
        
        // Snap search widget - always update position on resize
        if (searchWidget) {
            // Keep search bar at bottom center
            searchWidget.style.bottom = '40px';
            searchWidget.style.left = '50%';
            searchWidget.style.transform = 'translateX(-50%)';
            searchWidget.style.top = 'auto';
            searchWidget.style.right = 'auto';
            
            searchPosition.bottom = 40;
            searchPosition.left = 50;
            searchPosition.transform = 'translateX(-50%)';
        }
        
        // Snap stats widget - always update position on resize
        if (statsWidget) {
            const rect = statsWidget.getBoundingClientRect();
            const snappedTop = Math.round(rect.top / gridSize) * gridSize;
            const snappedLeft = Math.round(rect.left / gridSize) * gridSize;
            statsWidget.style.top = snappedTop + 'px';
            statsWidget.style.left = snappedLeft + 'px';
            statsWidget.style.right = 'auto';
            statsPosition.top = snappedTop;
            statsPosition.left = snappedLeft;
        }
        
        saveSettings();
    }
    
    function toggleGrid() {
        let gridOverlay = document.getElementById('gridOverlay');
        if (!gridOverlay) {
            createGridOverlay();
            gridOverlay = document.getElementById('gridOverlay');
        }
        gridOverlay.classList.toggle('hidden');
    }
    
    function createGridOverlay() {
        const gridOverlay = document.createElement('div');
        gridOverlay.id = 'gridOverlay';
        gridOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.3;
        `;
        document.body.appendChild(gridOverlay);
    }
    
    function setupDragAndDrop(element) {
        element.addEventListener('dragstart', (e) => {
            const siteId = element.dataset.siteId;
            if (!siteId) {
                e.preventDefault();
                return;
            }

            element.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', siteId);
        });
        
        element.addEventListener('dragend', (e) => {
            element.classList.remove('dragging');
            // Clean up any remaining visual effects
            document.querySelectorAll('.top-site').forEach(site => {
                site.classList.remove('drag-over');
            });
            document.querySelectorAll('.drop-indicator').forEach(indicator => {
                indicator.remove();
            });
        });
    }
    
    function setupDropZones() {
        console.log('Setting up drop zones for view:', currentView);
        
        // Remove existing drop zones
        document.querySelectorAll('.top-site').forEach(site => {
            site.removeEventListener('dragover', handleDragOver);
            site.removeEventListener('dragenter', handleDragEnter);
            site.removeEventListener('dragleave', handleDragLeave);
            site.removeEventListener('drop', handleDrop);
        });
        
        // Add drop zones to all custom sites in favorites view
        if (currentView === 'favorites') {
            const draggableSites = document.querySelectorAll('.top-site.draggable[data-site-id]');
            console.log('Found', draggableSites.length, 'draggable sites');
            
            draggableSites.forEach((site, index) => {
                site.addEventListener('dragover', handleDragOver);
                site.addEventListener('dragenter', handleDragEnter);
                site.addEventListener('dragleave', handleDragLeave);
                site.addEventListener('drop', handleDrop);
                console.log('Added drop listeners to site', index, ':', site.dataset.siteId);
            });
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        // Only remove drag-over if we're leaving the element entirely
        if (!this.contains(e.relatedTarget)) {
            this.classList.remove('drag-over');
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.classList.remove('drag-over');
        
        const draggedElement = document.querySelector('.dragging');
        if (!draggedElement) {
            console.log('No dragging element found');
            return;
        }
        
        const draggedSiteId = draggedElement.dataset.siteId;
        const dropTargetSiteId = this.dataset.siteId;
        
        console.log('Drop event:', {
            draggedSiteId: draggedSiteId,
            dropTargetSiteId: dropTargetSiteId,
            draggedElement: draggedElement,
            dropTarget: this
        });
        
        if (draggedSiteId && dropTargetSiteId && draggedSiteId !== dropTargetSiteId) {
            console.log('Reordering favorites from', draggedSiteId, 'to', dropTargetSiteId);
            reorderFavorites(draggedSiteId, dropTargetSiteId);
        } else {
            console.log('Invalid drop indices or same position');
        }
    }
    
    function reorderFavorites(fromId, toId) {
        const topLevelEntries = getTopLevelFavoriteEntries();
        const fromIndex = topLevelEntries.findIndex(entry => String(entry.id) === String(fromId));
        const toIndex = topLevelEntries.findIndex(entry => String(entry.id) === String(toId));

        if (fromIndex === -1 || toIndex === -1) {
            console.warn('Rejected invalid favorites reorder request:', { fromId, toId });
            showNotification('Unable to reorder favorites. Please try again.');
            return;
        }

        const reorderedTopLevelEntries = [...topLevelEntries];
        const draggedSite = reorderedTopLevelEntries.splice(fromIndex, 1)[0];

        if (!draggedSite) {
            console.warn('No favorite found at drag start id:', fromId);
            showNotification('Unable to reorder favorites. Please try again.');
            return;
        }
        
        reorderedTopLevelEntries.splice(toIndex, 0, draggedSite);

        const nestedEntries = customSites.filter(entry => isSiteEntry(entry) && entry.folderId !== null);
        saveCustomSites([...reorderedTopLevelEntries, ...nestedEntries]);
        
        // Re-render the sites to reflect the new order
        renderTopSites();
        
        // Show success feedback
        showNotification('Favorites reordered successfully!');
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1001;
            backdrop-filter: blur(10px);
            font-size: 14px;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    function updateStats() {
        // Simulate incrementing stats (in real Brave, these would come from actual data)
        const trackersBlocked = document.getElementById('trackersBlocked');
        const bandwidthSaved = document.getElementById('bandwidthSaved');
        const timeSaved = document.getElementById('timeSaved');
        
        // Get stored stats or use defaults
        let stats = JSON.parse(localStorage.getItem('braveStats') || '{"trackers": 157835, "bandwidth": 4.83, "time": 2.2}');
        
        // Gradually increment stats over time
        setInterval(() => {
            stats.trackers += Math.floor(Math.random() * 3) + 1;
            stats.bandwidth += Math.random() * 0.01;
            stats.time += Math.random() * 0.001;
            
            trackersBlocked.textContent = stats.trackers.toLocaleString();
            bandwidthSaved.textContent = `${stats.bandwidth.toFixed(2)}GB`;
            timeSaved.textContent = `${stats.time.toFixed(1)}hours`;
            
            localStorage.setItem('braveStats', JSON.stringify(stats));
        }, 60000); // Update every minute
    }

    function updateWidgetTiles() {
        // Update clock widget tiles
        const clockTiles = document.querySelectorAll('.widget-tile');
        clockTiles.forEach(widget => {
            const timeElement = widget.querySelector('.widget-time');
            const dateElement = widget.querySelector('.widget-date');
            const tempElement = widget.querySelector('.widget-temp');
            const descElement = widget.querySelector('.widget-desc');
            const weatherIconElement = widget.querySelector('.widget-weather-icon');
            
            if (timeElement && dateElement) {
                // This is a clock widget
                timeElement.textContent = currentTimeEl.textContent;
                dateElement.textContent = currentDateEl.textContent;
            }
            
            if (tempElement && descElement) {
                tempElement.textContent = `${latestWeatherDisplay.temp}${latestWeatherDisplay.unit}`;
                descElement.textContent = latestWeatherDisplay.desc;
            }

            if (weatherIconElement) {
                weatherIconElement.textContent = latestWeatherDisplay.icon;
            }
        });
    }
});
