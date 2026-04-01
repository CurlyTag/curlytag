import { template } from '../curlytag.js';

template.addPath('playground/');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`  ✓ ${message}`);
    } else {
        failed++;
        console.error(`  ✗ ${message}`);
    }
}

// Test 1: loop template
const loop = await template.render('examples/loop/template', { team: ['Alice', 'Bob', 'Carol'] });
assert(loop.includes('Alice'), 'loop template contains Alice');
assert(loop.includes('Bob'), 'loop template contains Bob');

// Test 2: conditions template
const admin = await template.render('examples/conditions/template', { role: 'admin' });
assert(typeof admin === 'string', 'conditions template returns a string');

// Test 3: filters template
const filters = await template.render('examples/filters/template', {
    title: 'hello',
    greeting: 'Hello world',
    price: 9.999,
    tags: ['js', 'html']
});
assert(filters.includes('HELLO'), 'filters template applies upper');

// Test 4: nested template
const nested = await template.render('examples/nested/template', {
    title: 'Team',
    users: [
        { name: 'Alice', active: true, roles: ['admin'] },
        { name: 'Bob', active: false, roles: ['editor'] }
    ]
});
assert(nested.includes('Alice'), 'nested template contains Alice');
assert(nested.includes('ADMIN'), 'nested template contains ADMIN');

// Test 5: cache
template.cache.clear();
await template.render('examples/loop/template', { team: ['X'] });
assert(template.cache.has('examples/loop/template'), 'template is cached after first render');

// Test 6: non-existent file
const missing = await template.render('examples/does-not-exist/template', {});
assert(missing === '', 'non-existent file returns empty string');

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
