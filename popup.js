document.addEventListener('DOMContentLoaded', () => {
    const subredditInput = document.getElementById('subredditInput');
    const blockButton = document.getElementById('blockButton');
    const blockedList = document.getElementById('blockedList');

    // Load and display the initial blocked list
    loadBlockedList();

    // Block button event listener
    blockButton.addEventListener('click', addSubredditToBlocklist);
    
    // Allow pressing Enter to block
    subredditInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addSubredditToBlocklist();
        }
    });

    // Function to add a subreddit to the blocklist
    function addSubredditToBlocklist() {
        const subreddit = subredditInput.value.trim().toLowerCase();
        if (!subreddit) return; // Don't add empty strings

        chrome.storage.sync.get({ blockedSubreddits: [] }, (data) => {
            const blockedSubreddits = data.blockedSubreddits;
            if (!blockedSubreddits.includes(subreddit)) {
                blockedSubreddits.push(subreddit);
                chrome.storage.sync.set({ blockedSubreddits }, () => {
                    subredditInput.value = '';
                    loadBlockedList();
                });
            } else {
                // Optional: give feedback that it's already blocked
                subredditInput.value = '';
            }
        });
    }

    // Function to remove a subreddit from the blocklist
    function removeSubredditFromBlocklist(subredditToRemove) {
        chrome.storage.sync.get({ blockedSubreddits: [] }, (data) => {
            const blockedSubreddits = data.blockedSubreddits.filter(
                sub => sub !== subredditToRemove
            );
            chrome.storage.sync.set({ blockedSubreddits }, () => {
                loadBlockedList();
            });
        });
    }

    // Function to load and render the blocked list
    function loadBlockedList() {
        chrome.storage.sync.get({ blockedSubreddits: [] }, (data) => {
            blockedList.innerHTML = ''; // Clear the current list
            const blockedSubreddits = data.blockedSubreddits;

            if (blockedSubreddits.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.className = 'text-gray-500 dark:text-gray-400 italic px-2';
                emptyItem.textContent = 'No subreddits blocked yet.';
                blockedList.appendChild(emptyItem);
                return;
            }

            blockedSubreddits.forEach(subreddit => {
                const listItem = document.createElement('li');
                listItem.className = 'flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md';
                
                const subredditName = document.createElement('span');
                subredditName.textContent = subreddit;
                subredditName.className = 'font-medium';

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.className = 'text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-150';
                removeButton.addEventListener('click', () => removeSubredditFromBlocklist(subreddit));

                listItem.appendChild(subredditName);
                listItem.appendChild(removeButton);
                blockedList.appendChild(listItem);
            });
        });
    }
});
