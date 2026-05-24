// Anki Import/Export Utilities

// Export study set to Anki format
export function exportToAnki(title, cards) {
    let ankiContent = '';
    
    cards.forEach(card => {
        // Anki format: Front<tab>Back
        ankiContent += `${card.term}\t${card.definition}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([ankiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_anki_deck.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import Anki deck (tab-separated format)
export function importAnkiDeck(content) {
    const lines = content.split('\n');
    const cards = [];
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        
        // Split by tab
        const parts = trimmedLine.split('\t');
        if (parts.length >= 2) {
            const term = parts[0].trim();
            const definition = parts[1].trim();
            
            if (term && definition) {
                cards.push({ term, definition });
            }
        }
    });
    
    return cards;
}

// Export to CSV
export function exportToCSV(title, cards) {
    let csvContent = 'Term,Definition\n';
    
    cards.forEach(card => {
        // Escape quotes and wrap in quotes if contains comma
        const term = card.term.includes(',') || card.term.includes('"') 
            ? `"${card.term.replace(/"/g, '""')}"` 
            : card.term;
        const definition = card.definition.includes(',') || card.definition.includes('"')
            ? `"${card.definition.replace(/"/g, '""')}"`
            : card.definition;
        
        csvContent += `${term},${definition}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import CSV using PapaParse
export function importCSV(file, callback) {
    Papa.parse(file, {
        complete: (results) => {
            const cards = [];
            
            results.data.forEach((row, index) => {
                // Skip header row if it exists
                if (index === 0 && (row[0]?.toLowerCase() === 'term' || row[0]?.toLowerCase() === 'front')) {
                    return;
                }
                
                if (Array.isArray(row) && row.length >= 2) {
                    const term = String(row[0] || '').trim();
                    const definition = String(row[1] || '').trim();
                    
                    if (term && definition) {
                        cards.push({ term, definition });
                    }
                }
            });
            
            callback(cards);
        },
        error: (error) => {
            console.error('CSV parsing error:', error);
            callback([]);
        }
    });
}

// Format date helper
export function formatDate(date) {
    if (!date) return 'Unknown';
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
}

// Shuffle array
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
