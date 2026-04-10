// Function to switch between the different Agent views
function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('.agent-view').forEach(view => {
        view.classList.add('hidden-view');
    });
    // Reset all button styles
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = "nav-btn hover:bg-gray-100 p-3 rounded-lg text-left font-medium";
    });

    // Show selected view
    document.getElementById(`view-${tabId}`).classList.remove('hidden-view');
    // Highlight selected button
    document.getElementById(`nav-${tabId}`).className = "nav-btn bg-indigo-50 text-indigo-700 p-3 rounded-lg text-left font-medium";
}

// Function to call your Backend Meta API
async function stealAds() {
    const brandName = document.getElementById('competitor-input').value;
    const resultDiv = document.getElementById('ad-results');
    
    if(!brandName) return alert("Please enter a brand name");
    resultDiv.innerHTML = "Fetching competitor data...";

    try {
        const response = await fetch('/api/meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ competitorName: brandName })
        });
        const data = await response.json();
        resultDiv.innerHTML = `Success! Check backend logs for Meta data on: ${brandName}`;
    } catch (error) {
        resultDiv.innerHTML = "Error fetching ads.";
    }
}

// Function to call your Backend Gemini API
async function draftReply() {
    const keyword = document.getElementById('lead-input').value;
    const resultDiv = document.getElementById('lead-results');
    
    if(!keyword) return alert("Please enter a keyword");
    resultDiv.innerHTML = "AI is drafting a reply...";

    // We tell the AI what to do here
    const aiPrompt = `Someone on social media is asking about "${keyword}". Draft a helpful, non-spammy reply 
                      that subtlely recommends our store. Keep it under 280 characters.`;

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiPrompt })
        });
        const data = await response.json();
        
        // Display the AI's text on the screen
        resultDiv.innerHTML = `<strong>AI Suggestion:</strong> <br/> ${data.text}`;
    } catch (error) {
        resultDiv.innerHTML = "Error generating reply.";
    }
}
