const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Security: Set security HTTP headers
app.use(helmet());

// Performance: Compress all responses
app.use(compression());

// Security: Enable CORS
app.use(cors());

// Security & Performance: Limit payload size
app.use(express.json({ limit: '2mb' }));

// Security: Rate limiting to prevent DoS & brute-forcing
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});
app.use(globalLimiter);

// Stricter rate limiter for AI operations
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 15,
    message: { error: "Too many AI operations from this IP, please try again after a minute" },
});
app.use('/chat', aiLimiter);
app.use('/improve', aiLimiter);
app.use('/metrics', aiLimiter);
app.use('/variants/tailor', aiLimiter);
app.use('/cover-letter', aiLimiter);
app.use('/match', aiLimiter);
app.use('/analyze-repo', aiLimiter);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_testing');

// Global Puppeteer browser instance to improve performance and avoid memory leaks
let globalBrowser = null;
async function getBrowser() {
    if (!globalBrowser) {
        globalBrowser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] 
        });
    }
    return globalBrowser;
}

// Graceful shutdown
process.on('SIGINT', async () => {
    if (globalBrowser) await globalBrowser.close();
    process.exit(0);
});

// EXACT Gemini system prompts for all 5 chat stages
const chatStagePrompts = {
    1: `You are an expert Resume Coach. Stage 1: Intake and Assessment.
Your goal is to gather the user's basic information, target role, and past experience context.
Ask 1-2 clarifying questions at most. Do NOT draft any bullet points yet. Keep responses under 50 words and friendly.`,
    
    2: `You are an expert Resume Coach. Stage 2: Organizing Experience.
Your goal is to help the user structure their work history chronologically and identify gaps or overlaps.
Focus on identifying key achievements before writing them out. Ask for specific metrics and numbers.`,
    
    3: `You are an expert Resume Coach. Stage 3: Drafting Bullets.
Your goal is to draft strong, action-oriented bullet points using the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
Provide 2-3 drafts for the user's recent roles, using strong action verbs.`,
    
    4: `You are an expert Resume Coach. Stage 4: Review and Polish.
Your goal is to review the drafted resume against industry standards. Suggest improvements for ATS optimization, keyword matching, grammar, and impact score. Encourage brevity.`,
    
    5: `You are an expert Resume Coach. Stage 5: Finalization.
Your goal is to provide a final sign-off, suggest matching templates (Modern vs Classic), and guide the user on interview preparation and cover letter generation next steps.`
};

// 1. /chat Route
app.post('/chat', async (req, res) => {
    try {
        const { message, stage = 1, history = [] } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });
        
        // Map history to the required format if needed: 
        // Gemini SDK history format: { role: 'user'|'model', parts: [{text: '...'}] }
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro", 
            systemInstruction: chatStagePrompts[stage] 
        });
        
        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage([{ text: message }]);
        const response = result.response.text();
        
        res.json({ reply: response });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to process chat message" });
    }
});

// 2. /improve Route
app.post('/improve', async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required to improve" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `Improve the following resume bullet for impact, clarity, and brevity. Incorporate this context: ${context || 'None'}.
Original text: "${text}"
Provide ONLY the improved bullet point as plain text without extraneous conversation or quotes.`;
        
        const result = await model.generateContent(prompt);
        res.json({ improved_text: result.response.text().trim() });
    } catch (error) {
        console.error("Improve Error:", error);
        res.status(500).json({ error: "Failed to improve text" });
    }
});

// 3. /metrics Route
app.post('/metrics', async (req, res) => {
    try {
        const { resume_content } = req.body;
        if (!resume_content) return res.status(400).json({ error: "Resume content is required" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `You are an expert ATS (Applicant Tracking System). Analyze the following resume content and return ONLY a valid JSON object representing scores representing percentage (0-100) for ATS compatibility, grammar, impact, brevity, and overall score. Do NOT wrap in markdown \`\`\`json blocks.
        Format strictly as: {"ats_score": 85, "grammar_score": 90, "impact_score": 75, "brevity_score": 80, "overall_score": 82}.
        Resume Content: ${JSON.stringify(resume_content)}`;
        
        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        if(rawText.startsWith('```json')) rawText = rawText.replace('```json', '').replace('```', '').trim();
        if(rawText.startsWith('```')) rawText = rawText.replace('```', '').trim();
        
        const metrics = JSON.parse(rawText);
        res.json(metrics);
    } catch (error) {
        console.error("Metrics Error:", error);
        res.status(500).json({ error: "Failed to calculate metrics" });
    }
});

// 4. /variants/tailor Route
app.post('/variants/tailor', async (req, res) => {
    try {
        const { resume_content, job_description } = req.body;
        if (!resume_content || !job_description) return res.status(400).json({ error: "Resume content and Job description are required" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `You are an expert Career Strategist.
Tailor the following resume to better match this job description. Make ONLY necessary changes to highlight relevant experience and keywords without fabricating facts. Ensure brevity and high impact.
Job Description: ${job_description}
Original Resume: ${resume_content}
Provide ONLY the updated resume plain text.`;
        
        const result = await model.generateContent(prompt);
        res.json({ tailored_resume: result.response.text().trim() });
    } catch (error) {
        console.error("Tailor Error:", error);
        res.status(500).json({ error: "Failed to tailor resume" });
    }
});

// 5. /cover-letter Route
app.post('/cover-letter', async (req, res) => {
    try {
        const { resume_content, job_description } = req.body;
        if (!resume_content || !job_description) return res.status(400).json({ error: "Resume content and Job description are required" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `You are an expert Career Coach.
Write a professional, compelling cover letter based on the following resume and job description. Keep it concise (under 300 words), engaging, and highlight the most relevant achievements.
Job Description: ${job_description}
Resume: ${resume_content}
Provide ONLY the cover letter plain text content.`;
        
        const result = await model.generateContent(prompt);
        res.json({ cover_letter: result.response.text().trim() });
    } catch (error) {
        console.error("Cover Letter Error:", error);
        res.status(500).json({ error: "Failed to generate cover letter" });
    }
});

// 6. /match Route (ATS Match)
app.post('/match', async (req, res) => {
    try {
        const { resume_content, job_description } = req.body;
        if (!resume_content || !job_description) return res.status(400).json({ error: "Resume content and Job description are required" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `You are an expert ATS (Applicant Tracking System).
Analyze this resume against the job description and provide a JSON response with exactly these fields:
- "match_score": integer from 0 to 100
- "keywords_found": array of strings (important keywords from JD present in resume)
- "keywords_missing": array of strings (important keywords from JD missing from resume)

Job Description: ${job_description}
Resume: ${resume_content}
Respond ONLY with the raw JSON object.`;
        
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith('\`\`\`json')) {
            text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (text.startsWith('\`\`\`')) {
            text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }
        res.json(JSON.parse(text));
    } catch (error) {
        console.error("Match Error:", error);
        res.status(500).json({ error: "Failed to perform ATS match" });
    }
});

// 7. /pdf Route (PDF Export with Puppeteer)
app.post('/pdf', async (req, res) => {
    try {
        const { resume_content, template } = req.body;
        if (!resume_content) return res.status(400).json({ error: "Resume content is required" });

        let htmlContent = '';
        if (template === 'modern') {
            htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 2rem; color: #333; }
                    h1 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
                    p { line-height: 1.6; }
                    .content { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h1>Resume</h1>
                <div class="content">${resume_content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </body>
            </html>`;
        } else if (template === 'classic') {
            htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 2rem; color: #000; }
                    h1 { text-align: center; border-bottom: 1px solid #000; margin-bottom: 1rem; }
                    p { line-height: 1.5; }
                    .content { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <h1>Resume</h1>
                <div class="content">${resume_content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </body>
            </html>`;
        } else {
             htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 2rem; }
                    .content { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <div class="content">${resume_content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            </body>
            </html>`;
        }

        const browser = await getBrowser();
        const page = await browser.newPage();
        let pdfBuffer;
        try {
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        } finally {
            await page.close(); // Close only the page to free up memory
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error("PDF Export Error:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

// 8. /repos Route (GitHub Integration)
app.post('/repos', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: "Username is required" });
        
        let headers = { 'User-Agent': 'ResumeBuilder-App' };
        if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

        // Fetch public repos for the user
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
            headers
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch from GitHub: ${errorText}`);
        }
        
        const repos = await response.json();
        
        const simplifiedRepos = repos.map(r => ({
            name: r.name,
            description: r.description,
            url: r.html_url,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            updated_at: r.updated_at
        }));
        
        res.json({ repos: simplifiedRepos });
    } catch (error) {
        console.error("Repos Error:", error);
        res.status(500).json({ error: "Failed to fetch GitHub repos" });
    }
});

// 9. /analyze-repo Route (GitHub Repo Analysis)
app.post('/analyze-repo', async (req, res) => {
    try {
        const { username, repo } = req.body;
        if (!username || !repo) return res.status(400).json({ error: "Username and repo are required" });
        
        let headers = { 'User-Agent': 'ResumeBuilder-App' };
        if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;

        // Fetch languages
        const langResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/languages`, {
            headers
        });
        if (!langResponse.ok) throw new Error("Failed to fetch languages from GitHub");
        const languages = await langResponse.json();
        
        // Fetch README
        const readmeHeaders = { ...headers, 'Accept': 'application/vnd.github.raw' };
        const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/readme`, {
            headers: readmeHeaders
        });
        if (!readmeResponse.ok) throw new Error("Failed to fetch README from GitHub");
        const readme = await readmeResponse.text();
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `You are an expert tech resume writer.
Analyze this GitHub repository based on its languages and README. Extract the key achievements, technologies used, and purpose of the project. Format it as 2-3 impactful resume bullet points (using the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]).

Repository: ${repo}
Languages: ${JSON.stringify(languages)}
README:
${readme.substring(0, 5000)} // Truncating to avoid massive prompts

Provide ONLY the drafted bullet points as plain text.`;
        
        const result = await model.generateContent(prompt);
        res.json({ summary: result.response.text().trim(), languages });
    } catch (error) {
        console.error("Analyze Repo Error:", error);
        res.status(500).json({ error: "Failed to analyze GitHub repo" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
