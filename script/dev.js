const notifier = require('node-notifier');
const sass = require('sass');
const pug = require('pug');
const fs = require('fs');
const fw = require('filewatcher');

notifier.notify('Start Mars Inc. debugging.');

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

console.log('Start listening\n');

let styleError = false;
let pugError = false;

watcher.on('change', function (file, stat) {
  const errorFiles = [];
  if (file === './template') {
    console.log('Compile templates');

    for (const pugFile of pugFiles) {
      console.log(`Rendering ${pugFile}.pug`);
      try {
        const html = pug.renderFile(`./template/${pugFile}.pug`, {});
        console.log(`Writing ${pugFile}.html`);
        fs.writeFileSync(`./dist/${pugFile}.html`, html);
      } catch (e) {
        pugError = true;
        errorFiles.push(`${pugFile}.pug`);
        console.log(`Error: ${pugFile}.pug`);
        console.log(e);
      }
    }
  } else if (file === './style') {
    console.log('Compile style');

    for (const styleFile of styleFiles) {
      console.log(`Rendering ${styleFile}.scss`);
      try {
        const result = sass.renderSync({
          file: `./style/${styleFile}.scss`,
          sourceMap: true,
          outFile: `${styleFile}.css`,
        });
        console.log(`Writing ${styleFile}.css`);
        fs.writeFileSync(`./dist/style/${styleFile}.css`, result.css);
        fs.writeFileSync(`./dist/style/${styleFile}.css.map`, result.map);
      } catch (e) {
        styleError = true;
        errorFiles.push(`${styleFile}.scss`);
        console.log(`Error: ${styleFile}.scss`);
        console.log(e);
      }
    }
  }
  if (errorFiles.length > 0) {
    notifier.notify({
      title: 'Compile Error',
      message: errorFiles.join(', '),
    });
  } else {
    if (styleError) {
      styleError = false;
      notifier.notify({
        title: 'SASS Fixed',
        message: 'Styles were compiled successfully',
      });
    }
    if (pugError) {
      pugError = false;
      notifier.notify({
        title: 'Pug Fixed',
        message: 'Templates were compiled successfully',
      });
    }
  }
  console.log('Updated\n');
  if (!stat) console.log('deleted');
});
