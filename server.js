require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------------------------------
// API Route 1: Gemini (Text & Evaluation)
// ------------------------------------------
app.post('/api/gemini', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ success: true, text: response.text() });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ success: false, error: "Failed to connect to AI" });
    }
});

// ------------------------------------------
// API Route 2: Meta Ads (Ad Thief)
// ------------------------------------------
app.post('/api/meta', async (req, res) => {
    try {
        const { competitorName } = req.body;
        const token = process.env.META_ACCESS_TOKEN;
        
        const url = `https://graph.facebook.com/v19.0/ads_archive?search_terms=${competitorName}&ad_type=ALL&ad_active_status=ACTIVE&ad_reached_countries=["US"]&access_token=${token}`;
        
        const metaResponse = await fetch(url);
        const data = await metaResponse.json();

        res.json({ success: true, ads: data.data || [] });
    } catch (error) {
        console.error("Meta Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch from Meta" });
    }
});

// VERCEL FIX: Export the app instead of using app.listen()
module.exports = app;
