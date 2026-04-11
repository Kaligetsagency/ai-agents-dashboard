require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const Replicate = require('replicate');

const app = express();
app.use(cors());
app.use(express.json());

// Set up memory storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize APIs (Ensure these are in your Vercel Environment Variables!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// Helper function to convert uploaded files to Base64 for Replicate
function fileToGenerativePart(fileBuffer, mimeType) {
    return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

// ------------------------------------------
// AGENT 1: Real Product Photos (Replicate)
// ------------------------------------------
app.post('/api/photo', upload.single('image'), async (req, res) => {
    try {
        const { vibe } = req.body;
        const file = req.file;

        if (!file || !vibe) {
            return res.status(400).json({ success: false, error: "Image and vibe are required." });
        }

        // Convert the uploaded image to Base64 URI
        const imageURI = fileToGenerativePart(file.buffer, file.mimetype);

        // Call REAL Replicate API using an Image-to-Image model
        const output = await replicate.run(
            "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672ff6afce5cb6ef165fe4204",
            {
                input: {
                    image: imageURI,
                    prompt: `Professional product photography, ${vibe}, 8k resolution, photorealistic, commercial ad quality`,
                    prompt_strength: 0.8,
                    num_outputs: 1
                }
            }
        );

        // Output from this model is an array of URLs
        res.json({ success: true, imageUrl: output[0] });

    } catch (error) {
        console.error("Replicate Image Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate image. Check Replicate API Key or logs." });
    }
});

// ------------------------------------------
// AGENT 2: Real Meta Ads & Gemini Rewrite
// ------------------------------------------
app.post('/api/meta', async (req, res) => {
    try {
        const { competitorName } = req.body;
        let rawAds = [];

        // Try the REAL Meta API
        try {
            const token = process.env.META_ACCESS_TOKEN;
            const url = `https://graph.facebook.com/v19.0/ads_archive?search_terms=${competitorName}&ad_type=ALL&ad_active_status=ACTIVE&ad_reached_countries=["US"]&access_token=${token}`;
            const metaResponse = await fetch(url);
            const data = await metaResponse.json();
            
            if (data.data && data.data.length > 0) {
                // Grab the first 2 ads to save processing time
                rawAds = data.data.slice(0, 2).map(ad => ({
                    page_id: ad.page_name || competitorName,
                    primary_text: ad.primary_text || "No text found in ad."
                }));
            }
        } catch (metaError) {
            console.log("Meta API failed or no token provided. Falling back to Gemini generation.");
        }

        // If Meta failed or found no ads, let Gemini invent competitive ads
        if (rawAds.length === 0) {
            rawAds = [
                { page_id: competitorName, primary_text: "Generate a generic competitive ad for this brand." }
            ];
        }

        // Process through REAL Gemini to rewrite
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const processedAds = await Promise.all(rawAds.map(async (ad) => {
            const aiPrompt = `My competitor (${ad.page_id}) is running an ad about their products. Write a new, highly engaging, 3-sentence Facebook ad for MY e-commerce store that sounds even better and steals their customers. Respond only with the new ad copy.`;
            
            try {
                const result = await model.generateContent(aiPrompt);
                const response = await result.response;
                ad.rewritten_copy = response.text().trim();
            } catch (aiError) {
                ad.rewritten_copy = "AI failed to rewrite this ad. Check Gemini API key.";
            }
            return ad;
        }));

        res.json({ success: true, ads: processedAds });

    } catch (error) {
        console.error("Meta/Gemini Error:", error);
        res.status(500).json({ success: false, error: "Failed to process ads. Check logs." });
    }
});

// ------------------------------------------
// AGENT 4: Real Social Leads (Gemini)
// ------------------------------------------
app.post('/api/gemini', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ success: true, text: response.text().trim() });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ success: false, error: "AI Error. Ensure your Google Gemini API key is correct in Vercel." });
    }
});

// ------------------------------------------
// AGENT 3: Real Influencer Ads (Replicate)
// ------------------------------------------
app.post('/api/influencer-photo', upload.fields([{ name: 'influencer_image', maxCount: 1 }, { name: 'product_image', maxCount: 1 }]), async (req, res) => {
    try {
        const influencerFile = req.files['influencer_image'][0];
        const productFile = req.files['product_image'][0];

        if (!influencerFile || !productFile) {
            return res.status(400).json({ success: false, error: "Both images are required." });
        }

        // Note: Real multi-image synthesis requires specific advanced models (like IP-Adapter).
        // For this real code, we will use the product image as the base, and prompt for a person.
        const productURI = fileToGenerativePart(productFile.buffer, productFile.mimetype);

        const output = await replicate.run(
            "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672ff6afce5cb6ef165fe4204",
            {
                input: {
                    image: productURI,
                    prompt: `A beautiful influencer holding this product, photorealistic, instagram style, high quality`,
                    prompt_strength: 0.7,
                    num_outputs: 1
                }
            }
        );

        res.json({ success: true, imageUrl: output[0] });

    } catch (error) {
        console.error("Replicate Influencer Error:", error);
        res.status(500).json({ success: false, error: "Failed to generate influencer image." });
    }
});

module.exports = app;
