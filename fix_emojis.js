const fs = require('fs');
const file = 'c:\\Users\\Rahul Chib\\Downloads\\Finance_Next\\Finance_Next\\app\\api\\chat\\route.ts';
let code = fs.readFileSync(file, 'utf8');

// Update createButton definition
code = code.replace(
  'const createButton = (label: string, action: string, metadata: any = {}) => ({ label, action, metadata });',
  'const createButton = (label: string, action: string, metadata: any = {}, icon?: string) => ({ label, action, metadata, icon });'
);
code = code.replace(
  "const backButton = () => createButton('🔙 Back', 'BACK');",
  "const backButton = () => createButton('Back', 'BACK', {}, 'ArrowLeft');"
);

const emojiMap = {
  '🛍️': 'ShoppingBag',
  '🛒': 'ShoppingCart',
  '📦': 'Package',
  '❤️': 'Heart',
  '🏷️': 'Tag',
  '👤': 'User',
  '👔': 'Shirt',
  '👗': 'UserRound',
  '🧸': 'Smile',
  '💄': 'Sparkles',
  '🏠': 'Home',
  '🗑️': 'Trash2',
  '➕': 'Plus',
  '➖': 'Minus',
  '💳': 'CreditCard',
  '🚚': 'Truck',
  '❌': 'X',
  '✅': 'Check',
  '📍': 'MapPin',
  '🚪': 'LogOut',
  '🔙': 'ArrowLeft',
  '⚠️': 'AlertTriangle',
  '🎉': 'PartyPopper',
  '👋': 'Hand',
  '💰': 'IndianRupee',
  '📁': 'Folder'
};

// Find and process createButton calls
code = code.replace(/createButton\((['`])(.*?)\1,\s*('[^']+')(?:\s*,\s*([^)]*?))?\)/g, (match, quote, label, action, metadata) => {
  let icon = undefined;
  let newLabel = label;
  
  for (const [emoji, lucide] of Object.entries(emojiMap)) {
    if (newLabel.includes(emoji)) {
      icon = lucide;
      newLabel = newLabel.replace(emoji, '').trim();
      break;
    }
  }
  
  if (icon) {
    const meta = metadata ? metadata : '{}';
    return "createButton(" + quote + newLabel + quote + ", " + action + ", " + meta + ", '" + icon + "')";
  }
  return match;
});

// Strip all other occurrences of mapping emojis
for (const emoji of Object.keys(emojiMap)) {
  code = code.split(emoji).join('').replace(/  +/g, ' '); 
}

// Ensure formatting hasn't broken spacing too much
code = code.replace(/ "\s+\*\*/g, ' "**');
code = code.replace(/`\s+\*\*/g, '`**');

fs.writeFileSync(file, code);
console.log('Done mapping emojis in route.ts!');
