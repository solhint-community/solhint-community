const fs = require('fs')
const os = require('os')
const path = require('path')

function tmpFilePath(filename = 'test.sol') {
  const tempDirPath = os.tmpdir()
  return path.resolve(tempDirPath, filename)
}

function storeAsFile(code, filename) {
  const filePath = tmpFilePath(filename)

  fs.writeFileSync(filePath, code, 'utf-8')

  return filePath
}

function removeTmpFiles() {
  try {
    fs.unlinkSync(tmpFilePath())
  } catch (err) {
    // console.log(err);
  }
}

module.exports = { tmpFilePath, storeAsFile, removeTmpFiles }
