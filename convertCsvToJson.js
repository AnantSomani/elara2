const csv = require('csvtojson');
const fs = require('fs');

const inputFile = 'transcript_segments_rows.csv'; // your CSV file
const outputFile = 'transcript_segments.json';

csv()
  .fromFile(inputFile)
  .then((jsonObj) => {
    fs.writeFileSync(outputFile, JSON.stringify(jsonObj, null, 2));
    console.log(`✅ Converted ${inputFile} to ${outputFile}`);
  })
  .catch((err) => {
    console.error('❌ Error converting CSV to JSON:', err);
  }); 