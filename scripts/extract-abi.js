const fs = require('fs');
const path = require('path');

// Đường dẫn file artifacts gốc (sửa lại nếu cần)
const artifactPath = path.join(__dirname, '../artifacts/contracts/TokenFactory.sol/TokenFactory.json');
// Đường dẫn file ABI đích
const abiOutputPath = path.join(__dirname, '../src/abi/TokenFactory.json');

// Đọc file artifact
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Tạo object chỉ chứa trường abi
const abiOnly = {
  contractName: artifact.contractName,
  abi: artifact.abi
};

// Ghi ra file đích
fs.writeFileSync(abiOutputPath, JSON.stringify(abiOnly, null, 2), 'utf8');

console.log('✅ ABI đã được copy sang src/abi/TokenFactory.json');