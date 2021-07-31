const sass = require('sass');
const pug = require('pug');
const fs = require('fs');

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


const startTime = Date.now();

console.log('Start building Mars Inc.');

// clean
console.log('Removing old files');

let rmDir = function (dirPath) {
  const files = fs.readdirSync(dirPath);
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
fs.mkdirSync('./dist/style');

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
for (const styleFile of styleFiles) {
  console.log(`Rendering ${styleFile}.scss`);
  const result = sass.renderSync({ file: `./style/${styleFile}.scss` });
  console.log(`Writing ${styleFile}.css`);
  fs.writeFileSync(`./dist/style/${styleFile}.css`, result.css);
}


// move static files
function copyDir(src, dist) {
  if (!fs.existsSync(dist) || !fs.lstatSync(dist).isDirectory()) {
    fs.mkdirSync(dist);
  }

  const paths = fs.readdirSync(src);
  paths.forEach((path) => {
    const _src = src + '/' + path;
    const _dist = dist + '/' + path;
    console.log(`Copying ${_src}`);
    const stat = fs.statSync(_src);

    // 判断是文件还是目录
    if (stat.isFile()) {
      fs.writeFileSync(_dist, fs.readFileSync(_src));
    } else if (stat.isDirectory()) {
      // 当是目录是，递归复制
      copyDir(_src, _dist);
    }
  });
}

copyDir('./static', './dist');

const buildTime = Math.round((Date.now() - startTime) / 100) / 10;
console.log(`Mars Inc was built in ${buildTime}s.`);
