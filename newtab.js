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
    const resetSitesBtn = document.getElementById('resetSitesBtn');
    const addSiteModal = document.getElementById('addSiteModal');
    const saveSiteBtn = document.getElementById('saveSiteBtn');
    const cancelSiteBtn = document.getElementById('cancelSiteBtn');
    const siteNameInput = document.getElementById('siteName');
    const siteUrlInput = document.getElementById('siteUrl');
    const editSiteModal = document.getElementById('editSiteModal');
    const updateSiteBtn = document.getElementById('updateSiteBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editSiteNameInput = document.getElementById('editSiteName');
    const editSiteUrlInput = document.getElementById('editSiteUrl');
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
    const currentTimeEl = document.getElementById('currentTime');
    const currentDateEl = document.getElementById('currentDate');
    const weatherInfoEl = document.getElementById('weatherInfo');
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
    let showClockWidget = settings.showClockWidget !== false; // Default to true
    let showStatsWidget = settings.showStatsWidget !== false; // Default to true
    let showSearchWidget = settings.showSearchWidget !== false; // Default to true

    let allSites = [];
    let customSites = JSON.parse(localStorage.getItem('customTopSites') || '[]');
    let currentWallpaperIndex = parseInt(localStorage.getItem('wallpaperIndex') || '0');
    let editingSiteId = null;
    
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
    initializeWeatherLocation();
    initializeWidgetVisibility();
    loadTopSites();
    setupEventListeners();
    updateStats();
    startClock();
    updateWeather();
    
    // Initialize draggable positions after DOM is ready
    setTimeout(() => {
        initializePositions();
    }, 100);
    
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
        weatherLocationInput.value = weatherLocation;
        timeFormatSelect.value = timeFormat;
        tempFormatSelect.value = tempFormat;
    }
    
    function initializeWidgetVisibility() {
        // Set initial checkbox states
        document.getElementById('showClockWidget').checked = showClockWidget;
        document.getElementById('showStatsWidget').checked = showStatsWidget;
        document.getElementById('showSearchWidget').checked = showSearchWidget;
        
        // Apply initial visibility
        updateWidgetVisibility();
    }
    
    function updateWidgetVisibility() {
        const clockWidget = document.querySelector('.clock-weather-widget');
        const statsSection = document.querySelector('.stats-section');
        const searchSection = document.querySelector('.search-section');
        
        if (showClockWidget) {
            clockWidget.classList.remove('hidden');
        } else {
            clockWidget.classList.add('hidden');
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
            showClockWidget: showClockWidget,
            showStatsWidget: showStatsWidget,
            showSearchWidget: showSearchWidget
        };
        localStorage.setItem('braveExtensionSettings', JSON.stringify(settings));
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
            updateViewToggle();
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
            updateGridDisplay();
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
                updateGridDisplay();
            }
        });

        // Apply custom count
        applyCustomCountBtn.addEventListener('click', () => {
            const customCount = parseInt(customSiteCountInput.value);
            if (customCount && customCount >= 1 && customCount <= 100) {
                currentSiteCount = customCount;
                saveSettings();
                updateGridDisplay();
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
            addSiteModal.classList.remove('hidden');
            siteNameInput.focus();
        });

        saveSiteBtn.addEventListener('click', async () => {
            const name = siteNameInput.value.trim();
            const url = siteUrlInput.value.trim();
            const iconUrl = siteIconInput.value.trim();
            
            if (name && url) {
                const fullUrl = url.startsWith('http') ? url : 'https://' + url;
                const favicon = iconUrl || await fetchFavicon(fullUrl);
                
                const customSite = {
                    title: name,
                    url: fullUrl,
                    favicon: favicon,
                    isCustom: true,
                    id: Date.now()
                };
                
                customSites.push(customSite);
                localStorage.setItem('customTopSites', JSON.stringify(customSites));
                
                siteNameInput.value = '';
                siteUrlInput.value = '';
                siteIconInput.value = '';
                addSiteModal.classList.add('hidden');
                
                loadTopSites();
            }
        });

        cancelSiteBtn.addEventListener('click', () => {
            siteNameInput.value = '';
            siteUrlInput.value = '';
            siteIconInput.value = '';
            addSiteModal.classList.add('hidden');
        });

        // Edit site functionality
        updateSiteBtn.addEventListener('click', async () => {
            const name = editSiteNameInput.value.trim();
            const url = editSiteUrlInput.value.trim();
            const iconUrl = editSiteIconInput.value.trim();
            
            if (name && url && editingSiteId) {
                const fullUrl = url.startsWith('http') ? url : 'https://' + url;
                const favicon = iconUrl || await fetchFavicon(fullUrl);
                
                // Find and update the site
                const siteIndex = customSites.findIndex(site => site.id === editingSiteId);
                if (siteIndex !== -1) {
                    customSites[siteIndex] = {
                        ...customSites[siteIndex],
                        title: name,
                        url: fullUrl,
                        favicon: favicon
                    };
                    
                    localStorage.setItem('customTopSites', JSON.stringify(customSites));
                    
                    editSiteNameInput.value = '';
                    editSiteUrlInput.value = '';
                    editSiteIconInput.value = '';
                    editSiteModal.classList.add('hidden');
                    editingSiteId = null;
                    
                    loadTopSites();
                }
            }
        });

        cancelEditBtn.addEventListener('click', () => {
            editSiteNameInput.value = '';
            editSiteUrlInput.value = '';
            editSiteIconInput.value = '';
            editSiteModal.classList.add('hidden');
            editingSiteId = null;
        });

        // Reset sites
        resetSitesBtn.addEventListener('click', () => {
            if (confirm('Reset all custom sites? This action cannot be undone.')) {
                customSites = [];
                localStorage.removeItem('customTopSites');
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
                                showStatsWidget = config.settings.showStatsWidget !== false;
                                showSearchWidget = config.settings.showSearchWidget !== false;
                            }
                            
                            // Restore custom sites
                            if (config.customSites) {
                                customSites = config.customSites;
                                localStorage.setItem('customTopSites', JSON.stringify(customSites));
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
                    title: (tab.title && tab.title !== '') ? tab.title : 
                           (tab.url ? new URL(tab.url).hostname : 'Untitled'),
                    url: tab.url,
                    favicon: favicon,
                    isCustom: true,
                    id: Date.now()
                };
                
                customSites.push(customSite);
                localStorage.setItem('customTopSites', JSON.stringify(customSites));
                
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
                    allSites.push(site);
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
            sitesToShow = customSites.slice(0, currentSiteCount);
        } else {
            // Show top sites (real sites + popular sites, but not custom ones)
            const nonCustomSites = allSites.filter(site => !site.isCustom);
            sitesToShow = nonCustomSites.slice(0, currentSiteCount);
        }
        
        topSitesGrid.innerHTML = '';
        
        sitesToShow.forEach((site, index) => {
            const siteElement = document.createElement('div');
            siteElement.className = 'top-site';
            siteElement.dataset.siteId = site.id;
            siteElement.dataset.siteIndex = index;
            
            if (site.isCustom) {
                siteElement.classList.add('editable');
                // Only make custom sites draggable in favorites view
                if (currentView === 'favorites') {
                    siteElement.classList.add('draggable');
                    siteElement.draggable = true;
                }
            }
            
            // Use stored favicon for custom sites, or generate for others
            const favicon = site.favicon || getFavicon(site.url);
            
            siteElement.innerHTML = `
                <div class="site-icon">
                    <img src="${favicon}" alt="${site.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI2Y1ZjVmNSIvPgo8L3N2Zz4K'">
                </div>
                <div class="site-title">${site.title}</div>
                ${site.isCustom ? '<div class="site-actions"><button class="edit-site-btn" title="Edit">✏️</button><button class="delete-site-btn" title="Delete">×</button></div>' : ''}
            `;
            
            // Add drag and drop event listeners for custom sites in favorites view
            if (site.isCustom && currentView === 'favorites') {
                setupDragAndDrop(siteElement);
            }
            
            // Add click handler for navigation
            siteElement.addEventListener('click', (e) => {
                // Check if clicked on action buttons
                if (e.target.classList.contains('edit-site-btn')) {
                    // Edit button clicked
                    editingSiteId = site.id;
                    editSiteNameInput.value = site.title;
                    editSiteUrlInput.value = site.url;
                    editSiteIconInput.value = site.favicon || '';
                    editSiteModal.classList.remove('hidden');
                    e.stopPropagation();
                    return;
                }
                
                if (e.target.classList.contains('delete-site-btn')) {
                    // Delete button clicked
                    if (confirm(`Remove "${site.title}" from favorites?`)) {
                        customSites = customSites.filter(s => s.id !== site.id);
                        localStorage.setItem('customTopSites', JSON.stringify(customSites));
                        loadTopSites();
                    }
                    e.stopPropagation();
                    return;
                }
                
                // Don't navigate if clicked on action buttons container
                if (e.target.classList.contains('site-actions')) {
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
                </div>
            `;
            
            // Manual add button
            addButton.querySelector('.manual-add').addEventListener('click', (e) => {
                e.stopPropagation();
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
            
            // Main tile click for manual add (fallback)
            addButton.addEventListener('click', (e) => {
                if (!e.target.classList.contains('quick-add-btn')) {
                    addSiteModal.classList.remove('hidden');
                    siteNameInput.focus();
                }
            });
            
            topSitesGrid.appendChild(addButton);
        }
        
        updateGridDisplay();
        
        // Setup drop zones for drag and drop functionality
        setupDropZones();
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
    }
    
    async function updateWeather() {
        try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(weatherLocation)}?format=j1`);
            const data = await response.json();
            
            if (data && data.current_condition && data.current_condition[0]) {
                const weather = data.current_condition[0];
                const temp = tempFormat === 'celsius' ? 
                    Math.round(weather.temp_C) : 
                    Math.round(weather.temp_F);
                const unit = tempFormat === 'celsius' ? '°C' : '°F';
                const desc = weather.weatherDesc[0].value;
                
                weatherInfoEl.innerHTML = `
                    <div class="weather-temp">${temp}${unit}</div>
                    <div class="weather-desc">${desc}</div>
                `;
            } else {
                throw new Error('Invalid weather data');
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            const unit = tempFormat === 'celsius' ? '°C' : '°F';
            weatherInfoEl.innerHTML = `
                <div class="weather-temp">--${unit}</div>
                <div class="weather-desc">Weather unavailable</div>
            `;
        }
    }
    
    function startClock() {
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    function makeDraggable(element, positionState, isStats = false) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let startLeft = 0;
        let startTop = 0;
        
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
            
            element.style.position = 'fixed';
            element.style.left = constrainedLeft + 'px';
            element.style.top = constrainedTop + 'px';
            
            if (isStats) {
                element.style.right = 'auto';
                element.style.justifyContent = 'flex-start';
                element.style.margin = '0';
            } else {
                element.style.right = 'auto';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.transition = '';
                
                // Save position
                const rect = element.getBoundingClientRect();
                if (isStats) {
                    positionState.top = rect.top;
                    positionState.left = rect.left;
                } else {
                    positionState.top = rect.top;
                    positionState.right = window.innerWidth - rect.right;
                }
                
                saveSettings();
            }
        });
    }
    
    function initializePositions() {
        const clockWidget = document.querySelector('.clock-weather-widget');
        
        // Set clock position
        if (clockPosition.top !== 24 || clockPosition.right !== 24) {
            clockWidget.style.top = clockPosition.top + 'px';
            clockWidget.style.right = clockPosition.right + 'px';
        }
        
        // Make clock draggable
        makeDraggable(clockWidget, clockPosition, false);
    }
    
    function setupDragAndDrop(element) {
        let dragStartIndex = null;
        
        element.addEventListener('dragstart', (e) => {
            dragStartIndex = parseInt(element.dataset.siteIndex);
            element.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', element.outerHTML);
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
            const draggableSites = document.querySelectorAll('.top-site.draggable');
            console.log('Found', draggableSites.length, 'draggable sites');
            
            draggableSites.forEach((site, index) => {
                site.addEventListener('dragover', handleDragOver);
                site.addEventListener('dragenter', handleDragEnter);
                site.addEventListener('dragleave', handleDragLeave);
                site.addEventListener('drop', handleDrop);
                console.log('Added drop listeners to site', index, ':', site.dataset.siteIndex);
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
        
        const dragStartIndex = parseInt(draggedElement.dataset.siteIndex);
        const dragEndIndex = parseInt(this.dataset.siteIndex);
        
        console.log('Drop event:', {
            dragStartIndex: dragStartIndex,
            dragEndIndex: dragEndIndex,
            draggedElement: draggedElement,
            dropTarget: this
        });
        
        if (dragStartIndex !== null && dragEndIndex !== null && dragStartIndex !== dragEndIndex) {
            console.log('Reordering favorites from', dragStartIndex, 'to', dragEndIndex);
            reorderFavorites(dragStartIndex, dragEndIndex);
        } else {
            console.log('Invalid drop indices or same position');
        }
    }
    
    function reorderFavorites(fromIndex, toIndex) {
        // Create a copy of the custom sites array
        const newCustomSites = [...customSites];
        
        // Remove the dragged item from its original position
        const draggedSite = newCustomSites.splice(fromIndex, 1)[0];
        
        // Insert it at the new position
        newCustomSites.splice(toIndex, 0, draggedSite);
        
        // Update the global array and save to storage
        customSites = newCustomSites;
        localStorage.setItem('customTopSites', JSON.stringify(customSites));
        
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
});