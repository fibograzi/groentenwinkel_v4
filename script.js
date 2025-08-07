// Theme Management
const initTheme = () => {
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    } catch (error) {
        console.error('Theme initialization error:', error);
        // Fallback to light theme
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

// Simulated Reddit Data Generator
const generateMockData = () => {
    const subreddits = [
        { name: 'r/AskReddit', minPosts: 3, maxPosts: 8 },
        { name: 'r/funny', minPosts: 2, maxPosts: 5 },
        { name: 'r/todayilearned', minPosts: 1, maxPosts: 4 },
        { name: 'r/worldnews', minPosts: 1, maxPosts: 3 },
        { name: 'r/videos', minPosts: 2, maxPosts: 6 },
        { name: 'r/gaming', minPosts: 1, maxPosts: 5 },
        { name: 'r/movies', minPosts: 1, maxPosts: 3 },
        { name: 'r/science', minPosts: 1, maxPosts: 2 }
    ];

    const postTitles = [
        'What\'s a fact that sounds fake but is actually true?',
        'This comment perfectly summarizes the situation',
        'Someone just pointed out something I never noticed',
        'The most accurate description I\'ve ever read',
        'This comment thread is pure gold',
        'TIL about this interesting perspective',
        'This explanation finally made it click for me',
        'Best comment I\'ve seen all week',
        'This needs to be higher up',
        'Comment of the year material right here'
    ];

    // Randomly select 2-5 subreddits
    const selectedCount = Math.floor(Math.random() * 4) + 2;
    const shuffled = [...subreddits].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, selectedCount);

    return selected.map(subreddit => {
        const postCount = Math.floor(Math.random() * (subreddit.maxPosts - subreddit.minPosts + 1)) + subreddit.minPosts;
        const posts = [];

        for (let i = 0; i < postCount; i++) {
            const title = postTitles[Math.floor(Math.random() * postTitles.length)];
            const upvotes = Math.floor(Math.random() * 50000) + 1000;
            const comments = Math.floor(Math.random() * 5000) + 100;
            const hoursAgo = Math.floor(Math.random() * 168) + 1; // 1-168 hours

            posts.push({
                title,
                upvotes: formatNumber(upvotes),
                comments: formatNumber(comments),
                timeAgo: formatTimeAgo(hoursAgo)
            });
        }

        return {
            subreddit: subreddit.name,
            posts: posts.sort(() => Math.random() - 0.5)
        };
    });
};

// Utility Functions
const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

const formatTimeAgo = (hours) => {
    if (hours < 1) {
        return 'just now';
    } else if (hours === 1) {
        return '1 hour ago';
    } else if (hours < 24) {
        return `${hours} hours ago`;
    } else if (hours < 48) {
        return '1 day ago';
    } else {
        return `${Math.floor(hours / 24)} days ago`;
    }
};

const validateRedditUrl = (url) => {
    const pattern = /^https?:\/\/(www\.)?(old\.)?reddit\.com\/r\/\w+\/comments\/\w+/i;
    return pattern.test(url);
};

// UI State Management
const showError = (message) => {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.add('show');
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
};

const showLoading = () => {
    document.getElementById('loadingSpinner').classList.add('show');
    document.getElementById('emptyState').classList.add('hide');
    document.getElementById('resultsContainer').classList.remove('show');
};

const hideLoading = () => {
    document.getElementById('loadingSpinner').classList.remove('show');
};

const showResults = (data) => {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    const totalUsage = data.reduce((sum, item) => sum + item.posts.length, 0);
    
    // Add summary card
    const summaryCard = document.createElement('div');
    summaryCard.className = 'result-card';
    summaryCard.style.background = 'linear-gradient(135deg, var(--accent-color), #ff6838)';
    summaryCard.style.color = 'white';
    summaryCard.style.border = 'none';
    summaryCard.innerHTML = `
        <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Comment Usage Summary</h2>
        <p style="opacity: 0.95;">This comment has been referenced in <strong>${totalUsage}</strong> posts across <strong>${data.length}</strong> subreddits</p>
    `;
    container.appendChild(summaryCard);
    
    // Add subreddit cards
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const postsHtml = item.posts.map(post => `
            <div class="post-item">
                <div class="post-title">${post.title}</div>
                <div class="post-stats">
                    <span class="stat">⬆ ${post.upvotes}</span>
                    <span class="stat">💬 ${post.comments}</span>
                    <span class="stat">🕒 ${post.timeAgo}</span>
                </div>
            </div>
        `).join('');
        
        card.innerHTML = `
            <div class="subreddit-header">
                <h3 class="subreddit-name">${item.subreddit}</h3>
                <span class="post-count">${item.posts.length} ${item.posts.length === 1 ? 'post' : 'posts'}</span>
            </div>
            <div class="post-list">
                ${postsHtml}
            </div>
        `;
        
        container.appendChild(card);
    });
    
    container.classList.add('show');
    document.getElementById('emptyState').classList.add('hide');
};

// Form Handler
const handleSearch = async (e) => {
    e.preventDefault();
    
    const urlInput = document.getElementById('commentUrl');
    const url = urlInput.value.trim();
    
    // Validate URL format
    if (!validateRedditUrl(url)) {
        showError('Please enter a valid Reddit comment URL (e.g., https://reddit.com/r/subreddit/comments/...)');
        return;
    }
    
    // Show loading state
    showLoading();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate and show results
    const mockData = generateMockData();
    hideLoading();
    showResults(mockData);
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Theme toggle handler
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Form submission handler
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    
    // Clear error on input
    document.getElementById('commentUrl').addEventListener('input', () => {
        document.getElementById('errorMessage').classList.remove('show');
    });
    
    // Handle Enter key in input
    document.getElementById('commentUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        }
    });
});

// Add smooth scrolling for results
window.addEventListener('load', () => {
    const resultsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    // Observe result cards as they're added
    const observeResults = () => {
        document.querySelectorAll('.result-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            resultsObserver.observe(card);
        });
    };
    
    // Set up mutation observer to watch for new results
    const containerObserver = new MutationObserver(observeResults);
    containerObserver.observe(document.getElementById('resultsContainer'), {
        childList: true
    });
});