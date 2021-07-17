const fs = require("fs");
const {execSync} = require("child_process");

function rmdir(path) {
  try { var files = fs.readdirSync(path); }
  catch(e) { return; }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = path + '/' + files[i];
      try {
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        } else {
          rmdir(filePath);
        }
      } catch(err) {
        console.log(`Failed to unlink ${filePath}: ${err.message}`);
      }
    }
  }
  fs.rmdirSync(path);
}

function mkdir(path) {
  fs.mkdirSync(path);
}

function cldir(path) {
  rmdir(path);
  mkdir(path);
}

function exec(cmd, args) {
  const result = execSync(cmd, args);
  return result;
}

function clean() {
  console.log("Cleaning...");
  cldir("./build");
}

function compile() {
  console.log('Compiling...');
  exec('tsc');
}

function bundle() {
  console.log("Bundling...");
  exec('cp -r ./config ./build/config');
  exec('cp build.json ./build');
}

function build() {
  let t0 = Date.now();
  clean();
  compile();
  bundle();
  console.log("Build completed in " + (Date.now() - t0) + " ms");
}

function prebuild() {
  const commit = String(exec('git rev-parse HEAD')).trim().slice(0, 7);
  const build = {
    'name': 'api',
    'commit': commit,
  };
  fs.writeFile('build.json', JSON.stringify(build, null, 2), () => {});
}

if (process.argv.includes('--build-dev')) {
  prebuild();
} else {
  build();
}
