const sass = require('sass');
const pug = require('pug');
const fs = require('fs');
const path = require('path');

const pugFiles = ['index'];

const startTime = Date.now();

console.log('Start building Mars Inc.');

console.log('Removing old files');

let rmDir = function (dirPath) {
  try { var files = fs.readdirSync(dirPath); }
  catch (e) { return; }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }
  fs.rmdirSync(dirPath);
};

if (fs.existsSync('./dist')) {
  rmDir('./dist');
}
fs.mkdirSync('./dist');

// pug to html
for (const pugFile of pugFiles) {
  console.log(`Rendering ${pugFile}.pug`);
  const html = pug.renderFile(`./template/${pugFile}.pug`, {
    name: 'Test'
  });
  console.log(`Writing ${pugFile}.html`);
  fs.writeFileSync(`./dist/${pugFile}.html`, html);
}


// scss to css


// move static files

const buildTime = Math.round((Date.now() - startTime) / 100) / 10;
console.log(`Mars Inc was built in ${buildTime}s.`);
