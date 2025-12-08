// hash.js
const bcrypt = require("bcrypt");

const password = "Abc12345"; // 你想要的新密码，自己决定

bcrypt.hash(password, 10).then((hash) => {
  console.log("Plain password:", password);
  console.log("Bcrypt hash:", hash);
});
