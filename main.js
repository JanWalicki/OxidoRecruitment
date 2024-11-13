import OpenAI from "openai";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_OXIDO_API_KEY,
});


// calling Open AI to generate HTML code from article content
async function generateHtmlFromArticle(articleText)
{
    const systemPrompt = 
    `You are an AI assistant tasked with generating structured HTML code for articles, incorporating placeholders for images and adhering to specific formatting guidelines.
        Your output should only include content between <body> and </body> tags.

        Formatting Instructions:

        1. Structure Content:
        - Use appropriate HTML tags for clear hierarchy:
            - <h1> for the main title.
            - <h2> for primary sections, and <h3> for subsections.
            - <p> for paragraphs, <ul> or <ol> for lists, and <blockquote> for quotes.
            - Use <strong> and <em> for emphasis where appropriate.

        2. Image Placeholders:
        - Insert image placeholders within relevant sections using:
            <img src="image_placeholder.jpg" alt="...">.
        - Alt text: Provide detailed descriptions that will guide an AI image generator to create relevant images.
        - **Images must be placed only above paragraphs**. **Do not place images above headings, titles, or directly beside them**. 
        - **Images should not be placed next to small or short paragraphs**, as this disrupts the flow of text. Instead, ensure images are placed above larger, more substantial paragraphs to maintain visual and textual balance.

        3. Article Structure:
        - Wrap the entire article content in <article> tags.
        - Always use classes for styling:
            - "title" for the main title.
            - "article-image" for image placeholders.
            - "article" for the article wrapper.
            - "article-paragraph" for paragraphs.
            - "subtitle" for section/subsection titles.
        - If the author is mentioned, include the author's name with the class "author" at the end.

        4. Restrictions:
        - Exclude <html>, <head>, or <body> tags. Only include content between <body> and </body>.
        - Do not include CSS, JavaScript, or any other external content.

        Ensure the HTML is clean, well-structured, and optimized for content-heavy articles, following these guidelines strictly.`;

    
    const userPrompt = 
    `Generate HTML content for an article. Use appropriate HTML structure with sections and subsections. 
     Include descriptive placeholders for images using <img src="image_placeholder.jpg" alt="..."> and ensure each image has a relevant
     Return only the HTML code to be inserted between <body> and </body>, without including <html>, <head>, or <body> tags.
     Article content: ${articleText}`


     try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt},
                { role: "user", content: userPrompt},
            ],
        });

        return completion.choices[0].message.content.toString();
    } catch (error) {
        console.error(`Błąd podczas generowania HTML: ${error}`);
        throw error;
    }
}



// loading article content from file
async function loadArticleContent(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        return data;
    } catch (err) {
        console.error("Error reading file:", err);
        throw err;
    }
}

// saving HTML AI generated code to file
async function saveHtmlToFile(content, filePath) {
    fs.writeFile(filePath, content, function (err) {
        if (err) throw err;
        console.log(`Succesfully saved content to a file: ${filePath}`);
    });
}


async function main() {
    const articlePath = 'articleContent.txt';
    const htmlOutputPath = 'artykul.html';

    const articleContent = await loadArticleContent(articlePath);
    const htmlContent = await generateHtmlFromArticle(articleContent);

    await saveHtmlToFile(htmlContent, htmlOutputPath);
}

main();
