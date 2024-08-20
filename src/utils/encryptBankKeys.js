import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY; // Ensure this is a 32-byte key
console.log("hello",secretKey)

if (!secretKey) {
  console.log('SECRET_KEY environment variable is not set');
}

// if (secretKey.length !== 32) {
//   console.log('SECRET_KEY must be 32 bytes long');
// }

// Encrypt function
// export const encrypt = (text) => {
//   const iv = crypto.randomBytes(16); // Initialization vector
//   const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
//   let encrypted = cipher.update(text, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return iv.toString('hex') + ':' + encrypted;
// };
export const encrypt = (text) => {
  return new Promise((resolve, reject) => {
    try {
      const iv = crypto.randomBytes(16); // Initialization vector
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      resolve(iv.toString('hex') + ':' + encrypted);
    } catch (err) {
      reject(err);
    }
  });
};


// Decrypt function
export const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};


/* -------------------------------------------------------------------------- */
/*                       PROCESS FOR DECRYPT THE VALUES                       */
/* -------------------------------------------------------------------------- */


// VendorBankSchema.methods.toJSON = function() {
//   const bank = this;
//   const bankObject = bank.toObject();

//   bankObject.keys.forEach(key => {
//     key.value = key.value ? decrypt(key.value) : key.value;
//   });

//   return bankObject;
// };
