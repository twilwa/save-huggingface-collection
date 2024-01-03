// popup.js

document.addEventListener('DOMContentLoaded', function() {
    const refreshButton = document.getElementById('refresh-collections');
    const collectionsList = document.getElementById('collections-list');

    refreshButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: 'getSavedCollections'}, function(response) {
            if (response.status === 'success') {
                displayCollections(response.data);
            } else {
                console.error('Error fetching saved collections:', response.message);
            }
        });
    });

    function displayCollections(collections) {
        collectionsList.innerHTML = '';
        collections.forEach(collection => {
            const collectionDiv = document.createElement('div');
            collectionDiv.textContent = collection.title;
            collectionsList.appendChild(collectionDiv);
        });
    }
});
