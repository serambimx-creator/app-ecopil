const https = require('https');
require('dotenv').config({ path: '.env.local' });

const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!key) {
    console.error("No API Key found.");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log(`Querying: ${url.replace(key, 'KEY')}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else {
                console.log("---- AVAILABLE MODELS ----");
                if (json.models) {
                    json.models.forEach(m => console.log(`- ${m.name}`));
                } else {
                    console.log("No models found in response:", json);
                }
                console.log("--------------------------");
            }
        } catch (e) {
            console.error("Parse Error:", e, data);
        }
    });
}).on('error', (e) => {
    console.error("Request Error:", e);
});
