// This script runs on reddit.com pages

let blockedSubreddits = [];

// Function to hide posts from blocked subreddits
function filterPosts() {
    // If the blocklist is empty, do nothing.
    if (blockedSubreddits.length === 0) return;

    // Find all links on the page that start with "/r/"
    // This is a more reliable way to find subreddit links within posts.
    const subredditLinks = document.querySelectorAll('a[href^="/r/"]');

    subredditLinks.forEach(link => {
        const href = link.getAttribute('href');
        const parts = href.split('/');

        // A valid subreddit link will look like /r/subredditname/...
        // So it needs at least 3 parts: "", "r", "subredditname"
        if (parts.length >= 3 && parts[1] === 'r') {
            const subredditName = parts[2].toLowerCase();

            // Check if the found subreddit is in our block list
            if (blockedSubreddits.includes(subredditName)) {
                
                // If it is, find the closest parent element that is a "post".
                // Reddit uses <shreddit-post>, div.Post, or div[data-testid="post-container"]
                // The .closest() method is great for this.
                const postContainer = link.closest('shreddit-post, div.Post, div[data-testid="post-container"]');

                // If we found a post container and it's not already hidden, hide it.
                if (postContainer && postContainer.style.display !== 'none') {
                    console.log(`Reddit Filter: Hiding post from r/${subredditName}`);
                    postContainer.style.display = 'none';
                }
            }
        }
    });
}

// Function to get the blocked list from storage and start filtering
function startFiltering() {
    chrome.storage.sync.get({ blockedSubreddits: [] }, (data) => {
        blockedSubreddits = data.blockedSubreddits.map(s => s.toLowerCase());
        filterPosts(); // Run once on page load
    });
}

// Use a MutationObserver to detect when new posts are loaded (infinite scroll)
const observer = new MutationObserver((mutations) => {
    // When the page changes, re-run the filter.
    filterPosts();
});

// Start observing the entire body of the page for new elements being added.
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Listen for changes in storage (e.g., when the user blocks a new subreddit)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.blockedSubreddits) {
        blockedSubreddits = changes.blockedSubreddits.newValue.map(s => s.toLowerCase());
        // Re-run the filter with the updated list
        filterPosts();
    }
});

// Initial run when the script is first injected into the page
startFiltering();
