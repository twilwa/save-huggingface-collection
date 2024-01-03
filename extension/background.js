// background.js

const HUGGING_FACE_API_URL = 'https://api.huggingface.co';
let authToken = ''; // Store the authentication token

// Function to authenticate with Hugging Face
function authenticate() {
    // Implement OAuth or API token-based authentication
    // Store the token in authToken
}

// Function to handle API requests
function sendApiRequest(endpoint, method, data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, HUGGING_FACE_API_URL + endpoint, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr.responseText);
                }
            }
        };
        xhr.send(JSON.stringify(data));
    });
}

// Function to get a collection
function getCollection(collectionId) {
    return sendApiRequest(`/collections/${collectionId}`, 'GET', null);
}

// Function to create a collection
function createCollection(title, description, namespace, isPrivate) {
    const data = {
        title: title,
        description: description,
        namespace: namespace,
        private: isPrivate
    };
    return sendApiRequest('/collections', 'POST', data);
}

// Function to update collection metadata
function updateCollectionMetadata(collectionId, title, description, position, isPrivate, theme) {
    const data = {
        title: title,
        description: description,
        position: position,
        private: isPrivate,
        theme: theme
    };
    return sendApiRequest(`/collections/${collectionId}`, 'PATCH', data);
}

// Function to delete a collection
function deleteCollection(collectionId) {
    return sendApiRequest(`/collections/${collectionId}`, 'DELETE', null);
}

// Function to add an item to a collection
function addCollectionItem(collectionSlug, itemId, itemType, note) {
    const data = {
        item_id: itemId,
        item_type: itemType,
        note: note
    };
    return sendApiRequest(`/collections/${collectionSlug}/items`, 'POST', data);
}

// Function to update collection item
function updateCollectionItem(collectionSlug, itemId, note, position) {
    const data = {
        note: note,
        position: position
    };
    return sendApiRequest(`/collections/${collectionSlug}/items/${itemId}`, 'PATCH', data);
}

// Function to delete collection item
function deleteCollectionItem(collectionSlug, itemId) {
    return sendApiRequest(`/collections/${collectionSlug}/items/${itemId}`, 'DELETE', null);
}

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // Handle different requests here
        // Example: if (request.action === 'getCollection') { ... }
    }
);

// Function to save a collection locally
function saveCollectionLocally(collection) {
    chrome.storage.local.get(['savedCollections'], function(result) {
        let savedCollections = result.savedCollections || [];
        savedCollections.push(collection);
        chrome.storage.local.set({savedCollections: savedCollections}, function() {
            console.log('Collection saved locally.');
        });
    });
}

// Function to retrieve saved collections
function getSavedCollections() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['savedCollections'], function(result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.savedCollections || []);
            }
        });
    });
}

// Enhanced listener for messages from popup or content script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === 'getCollection') {
            getCollection(request.collectionId).then(collection => {
                sendResponse({status: 'success', data: collection});
            }).catch(error => {
                sendResponse({status: 'error', message: error});
            });
            return true;  // Keep the message channel open for asynchronous response
        } else if (request.action === 'saveCollection') {
            saveCollectionLocally(request.collection);
            sendResponse({status: 'success', message: 'Collection saved locally.'});
            return true;
        } else if (request.action === 'getSavedCollections') {
            getSavedCollections().then(collections => {
                sendResponse({status: 'success', data: collections});
            }).catch(error => {
                sendResponse({status: 'error', message: error});
            });
            return true;
        }
    }
);
