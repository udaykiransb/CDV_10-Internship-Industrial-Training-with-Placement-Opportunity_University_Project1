/**
 * Convert JSON array to CSV string
 * @param {Array<Object>} data - Array of objects to convert
 * @param {Array<string>} headers - Specific fields to include as headers
 * @returns {string} - CSV formatted string
 */
const jsonToCsv = (data, headers) => {
    if (!data || !data.length) return '';

    // If headers not provided, use keys from first object
    const columnHeaders = headers || Object.keys(data[0]);
    
    const csvRows = [];
    
    // Add header row
    csvRows.push(columnHeaders.join(','));

    // Add data rows
    for (const row of data) {
        const values = columnHeaders.map(header => {
            const val = row[header];
            // Handle nested objects or arrays (simplified)
            const cellValue = (val === null || val === undefined) ? '' : 
                             (typeof val === 'object') ? JSON.stringify(val).replace(/"/g, '""') : 
                             String(val).replace(/"/g, '""');
            
            // Wrap in quotes if contains comma, newline or quotes
            return `"${cellValue}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

module.exports = {
    jsonToCsv,
};
