const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');

// Colors to replace:
// Green/Emerald: 20, 184, 106 | 20,184,106 | #14b86a | #22c55e | #0f766e | #9ce7ba | #34d399
// Amber/Orange: 245, 158, 11 | 245,158,11 | #f59e0b | #f97316 | #249,115,22 | #fb7185
// Blue/Sky/Cyan: 14, 165, 233 | 14,165,233 | #0ea5e9 | #38bdf8 | #0369a1 | #7dd3fc | #2dd4bf | #22d3ee

// New Palette (Violet / Rose):
// Violet RGB: 124, 58, 237
// Rose RGB: 225, 29, 72

css = css.replace(/rgba\(\s*20\s*,\s*184\s*,\s*106/g, 'rgba(124, 58, 237'); // green to violet
css = css.replace(/rgba\(\s*245\s*,\s*158\s*,\s*11/g, 'rgba(225, 29, 72'); // amber to rose
css = css.replace(/rgba\(\s*14\s*,\s*165\s*,\s*233/g, 'rgba(225, 29, 72'); // sky blue to rose (for gradients)
css = css.replace(/rgba\(\s*249\s*,\s*115\s*,\s*22/g, 'rgba(124, 58, 237'); // orange to violet

// Hex replacements
css = css.replace(/#14b86a/gi, '#7C3AED');
css = css.replace(/#0ea5e9/gi, '#E11D48');
css = css.replace(/#f59e0b/gi, '#FB7185');
css = css.replace(/#0f766e/gi, '#5B21B6'); // dark teal to dark violet
css = css.replace(/#9ce7ba/gi, '#C4B5FD'); // light green to light violet
css = css.replace(/#22c55e/gi, '#7C3AED');
css = css.replace(/#38bdf8/gi, '#A78BFA');
css = css.replace(/#0369a1/gi, '#881337'); // dark sky to dark rose
css = css.replace(/#7dd3fc/gi, '#FDA4AF'); // light sky to light rose
css = css.replace(/#2dd4bf/gi, '#A78BFA');
css = css.replace(/#22d3ee/gi, '#FB7185');
css = css.replace(/#f97316/gi, '#E11D48');
css = css.replace(/#fb7185/gi, '#E11D48'); // wait fb7185 is already pink, it's fine
css = css.replace(/#34d399/gi, '#C4B5FD');
css = css.replace(/#8b5cf6/gi, '#7C3AED');
css = css.replace(/#a78bfa/gi, '#C4B5FD');

fs.writeFileSync('src/index.css', css, 'utf-8');
console.log('CSS updated successfully!');
