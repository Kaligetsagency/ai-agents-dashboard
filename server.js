require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

// Set up memory storage for file uploads so Vercel doesn't crash
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Safely initialize Gemini AI (Won't crash if your key is missing)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ------------------------------------------
// AGENT 1: Product Photos
// ------------------------------------------
app.post('/api/photo', upload.single('image'), async (req, res) => {
    try {
        // We simulate a successful professional result.
        // Returns a high-quality stock photo of a tailored suit.
        const mockResultUrl = "https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=800"; 
        
        return res.json({ success: true, imageUrl: mockResultUrl });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

// ------------------------------------------
// AGENT 2: Meta Ads (Ad Thief)
// ------------------------------------------
app.post('/api/meta', async (req, res) => {
    try {
        const { competitorName } = req.body;
        
        // Mock data for the competitor
        let mockMetaAdsData = [
            { id: 'ad1', page_id: competitorName || 'Competitor', primary_text: `GET THE BEST TAILORED SUITS IN MOSHI! 🇹🇿 Perfect fit, premium fabric. Check out our new collection.` },
            { id: 'ad2', page_id: competitorName || 'Competitor', primary_text: `Stop wasting time. Our new software saves you 10 hours a week on suit ordering. Buy now.` }
        ];

        let processedAds = [];
        for (let ad of mockMetaAdsData) {
            // Default fallback text
            let rewritten = "Premium quality, unbeatable style. Upgrade your wardrobe today!";
            
            // Try to use Gemini to rewrite it
            if (genAI) {
                try {
                    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                    const aiPrompt = `Rewrite this ad: "${ad.primary_text}" to be highly engaging for my e-commerce store.`;
                    const result = await model.generateContent(aiPrompt);
                    const response = await result.response;
                    rewritten = response.text().trim();
                } catch(e) {
                    console.log("Gemini failed, using fallback.");
                }
            }
            processedAds.push({ ...ad, rewritten_copy: rewritten });
        }

        return res.json({ success: true, ads: processedAds });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

// ------------------------------------------
// AGENT 4: Social Leads (Draft Replies)
// ------------------------------------------
app.post('/api/gemini', async (req, res) => {
    try {
        // Fallback text if Gemini fails
        let responseText = "We have the best suits in Moshi! 🇹🇿 Visit our store today for premium quality and perfect fits.";
        
        if (genAI) {
            try {
                const { prompt } = req.body;
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                if (response.text()) responseText = response.text().trim();
            } catch(e) {
                console.log("Gemini failed, using fallback.");
            }
        }

        return res.json({ success: true, text: responseText });

    } catch (error) {
         console.error(error);
         return res.status(500).json({ success: false, error: "Server error." });
    }
});

// ------------------------------------------
// AGENT 3: Influencer Ads
// ------------------------------------------
app.post('/api/influencer-photo', upload.fields([{ name: 'influencer_image', maxCount: 1 }, { name: 'product_image', maxCount: 1 }]), async (req, res) => {
    try {
        // Simulates a high-quality photorealistic composite of an influencer wearing a suit.
        const mockResultUrl = "https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?auto=compress&cs=tinysrgb&w=800";
        
        return res.json({ success: true, imageUrl: mockResultUrl });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server error." });
    }
});

module.exports = app;
