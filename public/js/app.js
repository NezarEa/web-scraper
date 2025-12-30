const form = document.getElementById('scraperForm');
const urlInput = document.getElementById('url');
const submitBtn = document.getElementById('submitBtn');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const resultsDiv = document.getElementById('results');
const clearCacheLink = document.getElementById('clearCache');

let isLoading = false;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    const url = urlInput.value.trim();
    if (!url || !isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }
    
    await scrapeUrl(url);
});

async function scrapeUrl(url) {
    setLoading(true);
    hideMessages();
    
    try {
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        displayResults(data);
        showSuccess('Scraping successful');
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

function displayResults(data) {
    const { url, title, meta, headings, paragraphs, links, images, stats, fromCache, scrapedAt } = data;
    
    let html = `
        <div style="margin-bottom: 20px;">
            <h2 style="font-size: 20px; margin-bottom: 16px;">Results</h2>
            ${fromCache ? '<span style="font-size: 12px; color: #666; background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">From cache</span>' : ''}
        </div>
    `;
    
    // Stats
    html += `
        <div class="result-card">
            <h3>Statistics</h3>
            <div class="stats">
                <div class="stat-box"><span class="number">${stats.totalHeadings}</span><span class="label">Headings</span></div>
                <div class="stat-box"><span class="number">${stats.totalParagraphs}</span><span class="label">Paragraphs</span></div>
                <div class="stat-box"><span class="number">${stats.totalLinks}</span><span class="label">Links</span></div>
                <div class="stat-box"><span class="number">${stats.totalImages}</span><span class="label">Images</span></div>
                <div class="stat-box"><span class="number">${stats.wordCount}</span><span class="label">Words</span></div>
            </div>
        </div>
    `;
    
    // Title
    html += `<div class="result-card"><h3>Title</h3><p>${escapeHtml(title)}</p></div>`;
    
    // Meta
    if (meta && (meta.description || meta.keywords)) {
        html += `<div class="result-card"><h3>Metadata</h3>`;
        if (meta.description) html += `<p><strong>Description:</strong> ${escapeHtml(meta.description)}</p>`;
        if (meta.keywords) html += `<p><strong>Keywords:</strong> ${escapeHtml(meta.keywords)}</p>`;
        html += `</div>`;
    }
    
    // Headings
    if (headings && headings.length > 0) {
        html += `<div class="result-card"><h3>Headings (${headings.length})</h3>`;
        headings.slice(0, 10).forEach(h => {
            html += `<div class="list-item"><strong>${h.level}:</strong> ${escapeHtml(h.text)}</div>`;
        });
        if (headings.length > 10) html += `<p style="color: #999; font-size: 14px;">... and ${headings.length - 10} more</p>`;
        html += `</div>`;
    }
    
    // Paragraphs
    if (paragraphs && paragraphs.length > 0) {
        html += `<div class="result-card"><h3>Paragraphs (${paragraphs.length})</h3>`;
        paragraphs.slice(0, 5).forEach(p => {
            const truncated = p.length > 150 ? p.substring(0, 150) + '...' : p;
            html += `<p style="margin-bottom: 10px; font-size: 13px; line-height: 1.5;">• ${escapeHtml(truncated)}</p>`;
        });
        if (paragraphs.length > 5) html += `<p style="color: #999; font-size: 14px;">... and ${paragraphs.length - 5} more</p>`;
        html += `</div>`;
    }
    
    // Images
    if (images && images.length > 0) {
        html += `
            <div class="result-card">
                <h3>Images (${images.length})</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; margin-top: 12px;">
        `;
        
        images.forEach(img => {
            html += `
                <div style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; background: #f9fafb;">
                    <img src="${escapeHtml(img.src)}" 
                         alt="${escapeHtml(img.alt)}" 
                         style="width: 100%; height: 120px; object-fit: cover; display: block;"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22120%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22150%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2212%22%3EImage%3C/text%3E%3C/svg%3E'">
                    ${img.alt ? `<div style="padding: 8px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; max-height: 50px; overflow: hidden;">${escapeHtml(img.alt)}</div>` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Links
    if (links && links.length > 0) {
        html += `<div class="result-card"><h3>Links (${links.length})</h3>`;
        links.slice(0, 8).forEach(link => {
            html += `<div class="list-item"><a href="${escapeHtml(link.url)}" target="_blank">${escapeHtml(link.text || 'Link')}</a></div>`;
        });
        if (links.length > 8) html += `<p style="color: #999; font-size: 14px;">... and ${links.length - 8} more</p>`;
        html += `</div>`;
    }
    
    // Info
    html += `
        <div class="result-card">
            <h3>Info</h3>
            <p><strong>URL:</strong> <a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></p>
            <p><strong>Scraped:</strong> ${new Date(scrapedAt).toLocaleString()}</p>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    
    setTimeout(() => resultsDiv.scrollIntoView({ behavior: 'smooth' }), 100);
}

clearCacheLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Clear cache?')) return;
    
    try {
        const response = await fetch('/api/cache/clear', { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Cache cleared');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showError('Error clearing cache');
    }
});

function setLoading(loading) {
    isLoading = loading;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? '...' : 'Scrape';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
}

function hideMessages() {
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}