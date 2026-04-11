// Function to switch between the different Agent views
function switchTab(tabId) {
    // Hide all views
    document.querySelectorAll('.agent-view').forEach(view => {
        view.classList.add('hidden-view');
    });
    // Reset all button styles
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active-btn', 'hover:bg-gray-100');
        btn.classList.add('hover:bg-gray-100');
    });

    // Show selected view
    document.getElementById(`view-${tabId}`).classList.remove('hidden-view');
    // Highlight selected button
    document.getElementById(`nav-${tabId}`).classList.add('active-btn');
    document.getElementById(`nav-${tabId}`).classList.remove('hover:bg-gray-100');
}

// ------------------------------------------
// AGENT 1: Product Photos (Now Functional)
// ------------------------------------------
async function generatePhoto() {
    const fileInput = document.getElementById('photo-input');
    const vibe = document.getElementById('photo-vibe').value;
    const resultDiv = document.getElementById('photo-results');
    const btn = document.getElementById('gen-photo-btn');

    if (fileInput.files.length === 0 || !vibe) {
        return alert("Please upload an image and enter a vibe.");
    }

    resultDiv.innerHTML = "<p class='text-gray-500'>Synthesizing new professional product shots... (Takes ~10 seconds)</p>";
    btn.innerHTML = "Generating...";
    btn.disabled = true;

    // Use FormData for file upload
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('vibe', vibe);

    try {
        const response = await fetch('/api/photo', {
            method: 'POST',
            body: formData // No Content-Type header needed for FormData
        });
        const data = await response.json();
        
        btn.innerHTML = "Generate Pro Photo";
        btn.disabled = false;

        if (data.imageUrl) {
            resultDiv.innerHTML = `
                <div class="mt-4 p-4 result-card">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Final Pro Result:</p>
                    <img src="${data.imageUrl}" class="rounded-xl shadow-md max-w-full h-auto mx-auto" alt="AI Generated Product">
                    <p class="text-xs text-gray-500 mt-2">Example result for a 'Moshi.suit' case.</p>
                </div>`;
        } else {
            resultDiv.innerHTML = "<p class='text-red-500'>Error generating image.</p>";
        }
    } catch (error) {
        btn.innerHTML = "Generate Pro Photo";
        btn.disabled = false;
        resultDiv.innerHTML = "<p class='text-red-500'>Server connection failed.</p>";
    }
}

// ------------------------------------------
// AGENT 2: Meta Ads (Now Displays Real Data)
// ------------------------------------------
async function stealAds() {
    const brandName = document.getElementById('competitor-input').value;
    const resultDiv = document.getElementById('ad-results');
    
    if(!brandName) return alert("Please enter a competitor brand name.");
    resultDiv.innerHTML = "<p class='col-span-1 md:col-span-2 text-gray-500'>Analyzing competitor ads and recreating with AI...</p>";

    try {
        const response = await fetch('/api/meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ competitorName: brandName })
        });
        const data = await response.json();
        
        resultDiv.innerHTML = ""; // Clear loading message

        if (data.ads && data.ads.length > 0) {
            data.ads.forEach(ad => {
                resultDiv.innerHTML += `
                    <div class="result-card p-4">
                        <p class="text-xs text-gray-500 uppercase font-bold mb-1">Competitor Ad copy (Page: ${ad.page_id}):</p>
                        <p class="text-gray-800 font-medium mb-3">${ad.primary_text}</p>
                        <p class="text-xs text-gray-500 uppercase font-bold mb-1">AI Recreated for MY STORE:</p>
                        <p class="text-gray-800 bg-gray-100 p-2 rounded whitespace-pre-wrap">${ad.rewritten_copy}</p>
                    </div>
                `;
            });
        } else {
            resultDiv.innerHTML = "<p class='col-span-1 md:col-span-2 text-gray-500'>No recent ads found for that competitor.</p>";
        }
    } catch (error) {
        resultDiv.innerHTML = "<p class='col-span-1 md:col-span-2 text-red-500'>Error fetching and processing ads.</p>";
    }
}

// ------------------------------------------
// AGENT 4: Social Leads (Fixed undefined suggestion)
// ------------------------------------------
async function draftReply() {
    const keyword = document.getElementById('lead-input').value;
    const resultDiv = document.getElementById('lead-results');
    
    if(!keyword) return alert("Please enter a keyword");
    resultDiv.innerHTML = "AI is drafting a reply for a recent Twitter post...";

    const aiPrompt = ` Someone on Twitter just posted about "${keyword}". Draft a helpful, friendly, non-spammy reply that subtlely recommends checking out our e-commerce store. Keep it under 280 characters. Do not include placeholders like '[OUR STORE]'. Respond only with the drafted text.`;

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiPrompt })
        });
        const data = await response.json();
        
        // BUG FIX: Ensure data.text is defined before assigning it.
        resultDiv.innerHTML = `<strong>AI Suggestion:</strong><br/>${data.text || "Failed to generate suggestion."}`;
    } catch (error) {
        resultDiv.innerHTML = "<p class='text-red-500'>Error generating reply.</p>";
    }
}

// ------------------------------------------
// AGENT 3: Influencer Ads (New: Functional)
// ------------------------------------------
async function generateInfluencerPhoto() {
    const influencerFile = document.getElementById('influencer-input');
    const productFile = document.getElementById('product-input');
    const resultDiv = document.getElementById('influencer-results');
    const btn = document.getElementById('gen-influencer-btn');

    if (influencerFile.files.length === 0 || productFile.files.length === 0) {
        return alert("Please upload both an influencer face and a product image.");
    }

    resultDiv.innerHTML = "<p class='text-gray-500'>Synthesizing a new photorealistic influencer post... (Takes ~10 seconds)</p>";
    btn.innerHTML = "Generating...";
    btn.disabled = true;

    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('influencer_image', influencerFile.files[0]);
    formData.append('product_image', productFile.files[0]);

    try {
        const response = await fetch('/api/influencer-photo', {
            method: 'POST',
            body: formData // No Content-Type header needed for FormData
        });
        const data = await response.json();
        
        btn.innerHTML = "Generate Influencer Ad";
        btn.disabled = false;

        if (data.imageUrl) {
            resultDiv.innerHTML = `
                <div class="mt-4 p-4 result-card">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Final Influencer Creative:</p>
                    <img src="${data.imageUrl}" class="rounded-xl shadow-md max-w-full h-auto mx-auto" alt="AI Generated Influencer Ad">
                    <p class="text-xs text-gray-500 mt-2">Example composite for a 'Moshi.suit' case.</p>
                </div>`;
        } else {
            resultDiv.innerHTML = "<p class='text-red-500'>Error generating image.</p>";
        }
    } catch (error) {
        btn.innerHTML = "Generate Influencer Ad";
        btn.disabled = false;
        resultDiv.innerHTML = "<p class='text-red-500'>Server connection failed.</p>";
    }
}
