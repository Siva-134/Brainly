const link = process.argv[2] || 'https://github.com/facebook/react';

async function testFetch() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(link, { 
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': 'text/html'
            }
        });
        clearTimeout(timeoutId);
        if (response.ok) {
            const html = await response.text();
            const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
            const twitterImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
            const thumbnail = ogImage ? ogImage[1] : (twitterImage ? twitterImage[1] : '');
            console.log("THUMBNAIL FOUND:", thumbnail);
        } else {
            console.log("HTTP Error:", response.status);
        }
    } catch(e) {
        console.error("FETCH FAILED:", e.message);
    }
}
testFetch();
