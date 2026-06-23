const fs = require('fs');
const content = fs.readFileSync('dump_schema.sql', 'utf16le');
const startMarker = 'CREATE TABLE `anuncio`';
const startIdx = content.indexOf(startMarker);
const endMarker = 'ENGINE=InnoDB';
let endIdx = content.indexOf(endMarker, startIdx);
if (endIdx > 0) {
  endIdx = content.indexOf(';', endIdx) + 1;
  const tableSQL = content.substring(startIdx, endIdx);
  fs.writeFileSync('anuncio_create.sql', tableSQL, 'utf8');
  console.log('Extracted', tableSQL.length, 'chars');
} else {
  console.log('NOT FOUND');
}
