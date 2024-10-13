const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const folderPath = "./public/System/IconsPng"; // replace with your folder path
const outputFolder = "./public/System/Icons"; // replace with your output folder path

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach((file) => {
    if (path.extname(file) === ".png") {
      const inputFile = path.join(folderPath, file);
      const outputFile = path.join(outputFolder, file.replace(".png", ".webp"));

      sharp(inputFile)
        .webp()
        .toFile(outputFile)
        .then(() => {
          console.log(`Converted ${file} to WebP`);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
});
