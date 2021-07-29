
const sass = require('sass');
const pug = require('pug');
const fs = require('fs');
const fw = require('filewatcher');

function getAllFiles(path, ext) {
  const files = [];
  for (const file of fs.readdirSync(path)) {
    if (file.startsWith('_')) continue;
    if (!file.endsWith(ext)) continue;
    files.push(file.replace(ext, ''));
  }
  return files;
}


const pugFiles = getAllFiles('./template', '.pug');
const styleFiles = getAllFiles('./style', '.scss');



var watcher = fw({
  forcePolling: false,  // try event-based watching first
  debounce: 100,         // debounce events in non-polling mode by 10ms
  interval: 1000,       // if we need to poll, do it every 1000ms
  persistent: true      // don't end the process while files are watched
});


// ... or a directory
watcher.add('./style');
watcher.add('./template');

watcher.on('change', function (file, stat) {
  console.log('File modified: %s', file);
  if (file === './template') {
    console.log('Compile templates');
    for (const pugFile of pugFiles) {
      console.log(`Rendering ${pugFile}.pug`);
      const html = pug.renderFile(`./template/${pugFile}.pug`, {
        name: 'Test'
      });
      console.log(`Writing ${pugFile}.html`);
      fs.writeFileSync(`./dist/${pugFile}.html`, html);
    }
  } else if (file === './style') {
    console.log('Compile style');
    for (const styleFile of styleFiles) {
      console.log(`Rendering ${styleFile}.scss`);
      const result = sass.renderSync({ file: `./style/${styleFile}.scss` });
      console.log(`Writing ${styleFile}.css`);
      fs.writeFileSync(`./dist/style/${styleFile}.css`, result.css);
    }
  }
  if (!stat) console.log('deleted');
});
