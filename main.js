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
    `You are an AI assistant generating HTML code for structured articles that include placeholders for images and follow specific formatting requirements.
     Generate content between <body> and </body> tags only, and use HTML tags appropriately to enhance readability and organization.

        When creating the article:
        1. Use appropriate HTML tags to structure the content logically and hierarchically.
            - Use <h1> for the title, <h2> for main sections, and <h3> for subsections.
            - Use <p> tags for paragraphs, <ul> or <ol> for lists, and <blockquote> for quotes.
            - Use <strong> and <em> tags for emphasis.
        2. Add placeholders for images in relevant sections of the article using <img src="image_placeholder.jpg" alt="...">.
            - Use detailed descriptions for the alt attribute that would effectively guide an AI image generation tool.
            - Always make a detailed medium to long prompt including style, content and details for AI to generate image representing a text conent. 
            - If possible include images beside of a paragraph not beside of heading.
            - always: src="image_placeholder.jpg".
            - avoid images beside of small paragraph.
        3. Do not include CSS, JavaScript, or any content outside the <body> tags.
        4. Avoid including <html>, <head>, or <body> tags in the final output. Only include content that would go between <body> and </body>.
        5. Always put output between <article></article> tags to represent it is an article
        6. Add classes to help styling "title", "article-image", "article", "article-pharagraph", "subtitle".
        7. At the end write author if found in original article with class "author".

        Ensure that the generated code is clean, adheres to these instructions, and is suitable for a structured, content-rich article.`

    
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
