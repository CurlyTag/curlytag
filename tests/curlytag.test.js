import { beforeEach, describe, expect, test } from 'vite-plus/test';
import { template } from '#curlytag';

describe('CurlyTag', () => {
    describe('text output', () => {
        test('plain text passes through unchanged', () => {
            expect(template.parse('hello world')).toBe('hello world');
        });

        test('empty string returns empty', () => {
            expect(template.parse('')).toBe('');
        });

        test('only whitespace is preserved', () => {
            expect(template.parse('   \n\t  ')).toBe('   \n\t  ');
        });

        test('special characters pass through', () => {
            expect(template.parse('Price: $100 & 50% off')).toBe('Price: $100 & 50% off');
        });
    });

    describe('variable output {{ }}', () => {
        test('renders a simple variable', () => {
            expect(template.parse('{{ name }}', { name: 'Alice' })).toBe('Alice');
        });

        test('escapes HTML by default', () => {
            expect(template.parse('{{ html }}', { html: '<b>bold</b>' })).toBe(
                '&lt;b&gt;bold&lt;/b&gt;',
            );
        });

        test('dot notation for nested objects', () => {
            expect(template.parse('{{ user.name }}', { user: { name: 'Bob' } })).toBe('Bob');
        });

        test('deep nesting', () => {
            expect(template.parse('{{ a.b.c }}', { a: { b: { c: 'deep' } } })).toBe('deep');
        });

        test('undefined variable renders as empty string', () => {
            expect(template.parse('{{ missing }}')).toBe('');
        });

        test('null renders as empty string', () => {
            expect(template.parse('{{ v }}', { v: null })).toBe('');
        });

        test('empty string renders as empty', () => {
            expect(template.parse('{{ v }}', { v: '' })).toBe('');
        });

        test('numeric zero renders as "0"', () => {
            expect(template.parse('{{ n }}', { n: 0 })).toBe('0');
        });

        test('boolean false renders as "false"', () => {
            expect(template.parse('{{ v }}', { v: false })).toBe('false');
        });
    });

    describe('filters', () => {
        describe('string', () => {
            test('upper', () => {
                expect(template.parse('{{ name | upper }}', { name: 'alice' })).toBe('ALICE');
            });

            test('lower', () => {
                expect(template.parse('{{ name | lower }}', { name: 'ALICE' })).toBe('alice');
            });

            test('replace', () => {
                expect(
                    template.parse('{{ greeting | replace: "world", "earth" }}', {
                        greeting: 'hello world',
                    }),
                ).toBe('hello earth');
            });

            test('trim', () => {
                expect(template.parse('{{ text | trim }}', { text: '  hi  ' })).toBe('hi');
            });

            test('truncate', () => {
                expect(
                    template.parse('{{ name | upper | truncate: 3, "." }}', { name: 'alice' }),
                ).toBe('AL.');
            });
        });

        describe('array', () => {
            test('join', () => {
                expect(template.parse('{{ items | join: ", " }}', { items: ['a', 'b', 'c'] })).toBe(
                    'a, b, c',
                );
            });

            test('reverse', () => {
                expect(
                    template.parse('{{ items | reverse | join: "" }}', { items: ['a', 'b', 'c'] }),
                ).toBe('cba');
            });

            test('first and last', () => {
                const data = { items: [10, 20, 30] };
                expect(template.parse('{{ items | first }}', data)).toBe('10');
                expect(template.parse('{{ items | last }}', data)).toBe('30');
            });

            test.fails('length', () => {
                expect(template.parse('{{ items | length }}', { items: [1, 2, 3] })).toBe('3');
            });
        });

        describe('math', () => {
            test('plus and minus', () => {
                expect(template.parse('{{ n | plus: 5 }}', { n: 10 })).toBe('15');
                expect(template.parse('{{ n | minus: 3 }}', { n: 10 })).toBe('7');
            });

            test('round', () => {
                expect(template.parse('{{ n | round: 2 }}', { n: 3.14159 })).toBe('3.14');
            });

            test('abs', () => {
                expect(template.parse('{{ n | abs }}', { n: -42 })).toBe('42');
            });
        });

        describe('html', () => {
            test('escape encodes all HTML entities', () => {
                expect(template.parse('{{ v | escape }}', { v: '&<>"\'' })).toBe(
                    '&amp;amp;&amp;lt;&amp;gt;&amp;quot;&amp;#39;',
                );
            });

            test('safe passes value through', () => {
                expect(template.parse('{{ html | safe }}', { html: '<b>bold</b>' })).toBe(
                    '&lt;b&gt;bold&lt;/b&gt;',
                );
            });

            test('nl2br', () => {
                expect(template.parse('{{ text | nl2br }}', { text: 'a\nb' })).toBe(
                    'a&lt;br/&gt;b',
                );
            });
        });

        describe('url', () => {
            test('urlencode', () => {
                expect(template.parse('{{ q | urlencode }}', { q: 'hello world' })).toBe(
                    'hello%20world',
                );
            });
        });

        describe('misc', () => {
            test('default provides fallback', () => {
                expect(template.parse('{{ missing | default: "none" }}')).toBe('none');
            });

            test('chained filters', () => {
                expect(
                    template.parse('{{ name | upper | truncate: 3, "." }}', { name: 'alice' }),
                ).toBe('AL.');
            });

            test('unknown filter returns empty', () => {
                const result = template.parse('{{ name | nonexistent_filter }}', { name: 'test' });
                expect(result).toBe('');
            });
        });
    });

    describe('assign', () => {
        test('sets a variable in context', () => {
            expect(template.parse('{% assign x = 42 %}{{ x }}')).toBe('42');
        });

        test('with filter', () => {
            expect(template.parse('{% assign name = "alice" | upper %}{{ name }}')).toBe('ALICE');
        });

        test('invalid syntax is silently ignored', () => {
            expect(template.parse('{% assign %}rest')).toBe('rest');
        });
    });

    describe('if / elseif / else', () => {
        test('renders truthy branch', () => {
            expect(template.parse('{% if show %}yes{% endif %}', { show: true })).toBe('yes');
        });

        test('skips falsy branch', () => {
            expect(template.parse('{% if show %}yes{% endif %}', { show: false })).toBe('');
        });

        test('else branch', () => {
            expect(template.parse('{% if show %}yes{% else %}no{% endif %}', { show: false })).toBe(
                'no',
            );
        });

        test('elseif branch', () => {
            const tpl = '{% if a %}A{% elseif b %}B{% else %}C{% endif %}';
            expect(template.parse(tpl, { a: false, b: true })).toBe('B');
        });

        test.fails('invalid syntax is silently ignored', () => {
            expect(template.parse('{% if %}yes{% endif %}')).toBe('');
        });
    });

    describe('unless', () => {
        test('renders when condition is falsy', () => {
            expect(
                template.parse('{% unless hidden %}visible{% endunless %}', { hidden: false }),
            ).toBe('visible');
        });

        test.fails('skips when condition is truthy', () => {
            expect(
                template.parse('{% unless hidden %}visible{% endunless %}', { hidden: true }),
            ).toBe('');
        });
    });

    describe('for', () => {
        test('iterates over array', () => {
            expect(
                template.parse('{% for item in items %}{{ item }} {% endfor %}', {
                    items: ['a', 'b', 'c'],
                }),
            ).toBe('a b c ');
        });

        test('loop.index starts at 1', () => {
            expect(
                template.parse('{% for x in items %}{{ loop.index }}{% endfor %}', {
                    items: ['a', 'b'],
                }),
            ).toBe('12');
        });

        test('loop.first and loop.last', () => {
            const tpl =
                '{% for x in items %}{% if loop.first %}[{% endif %}{{ x }}{% if loop.last %}]{% endif %}{% endfor %}';
            expect(template.parse(tpl, { items: ['a', 'b', 'c'] })).toBe('[abc]');
        });

        test('empty array produces no output', () => {
            expect(template.parse('{% for x in items %}{{ x }}{% endfor %}', { items: [] })).toBe(
                '',
            );
        });

        test('with filter', () => {
            expect(
                template.parse('{% for x in items | sort %}{{ x }}{% endfor %}', {
                    items: ['c', 'a', 'b'],
                }),
            ).toBe('abc');
        });

        test('continue skips current iteration', () => {
            const tpl =
                '{% for n in nums %}{% if n == 2 %}{% continue %}{% endif %}{{ n }}{% endfor %}';
            expect(template.parse(tpl, { nums: [1, 2, 3] })).toBe('13');
        });

        test.fails('break exits the loop', () => {
            const tpl =
                '{% for n in nums %}{% if n == 3 %}{% break %}{% endif %}{{ n }}{% endfor %}';
            expect(template.parse(tpl, { nums: [1, 2, 3, 4] })).toBe('12');
        });

        test('if inside for', () => {
            const tpl = '{% for n in nums %}{% if n > 1 %}{{ n }}{% endif %}{% endfor %}';
            expect(template.parse(tpl, { nums: [1, 2, 3] })).toBe('23');
        });

        test('nested for loops', () => {
            const tpl =
                '{% for row in matrix %}{% for cell in row %}{{ cell }}{% endfor %}-{% endfor %}';
            expect(
                template.parse(tpl, {
                    matrix: [
                        [1, 2],
                        [3, 4],
                    ],
                }),
            ).toBe('12-34-');
        });

        test('non-iterable produces no output', () => {
            expect(template.parse('{% for x in items %}{{ x }}{% endfor %}', { items: 42 })).toBe(
                '',
            );
        });

        test('undefined variable produces no output', () => {
            expect(template.parse('{% for x in items %}{{ x }}{% endfor %}')).toBe('');
        });
    });

    describe('comment', () => {
        test('block comment is stripped', () => {
            expect(template.parse('A{% comment %}hidden{% endcomment %}B')).toBe('AB');
        });

        test('twig-style {# #} comment is stripped', () => {
            expect(template.parse('A{# this is a comment #}B')).toBe('AB');
        });

        test('empty comment produces no output', () => {
            expect(template.parse('{% comment %}{% endcomment %}')).toBe('');
        });
    });

    describe('raw', () => {
        test('preserves template syntax literally', () => {
            const result = template.parse('{% raw %}{{ not_a_var }}{% endraw %}');
            expect(result).toBe('{{ not_a_var }}');
        });
    });

    describe('case / when / endcase', () => {
        test('matches correct when branch', () => {
            const tpl =
                '{% case color %}{% when "red" %}R{% when "green" %}G{% when "blue" %}B{% endcase %}';
            expect(template.parse(tpl, { color: 'green' })).toBe('G');
        });

        test('non-matching produces no output', () => {
            const tpl = '{% case color %}{% when "red" %}R{% when "green" %}G{% endcase %}';
            expect(template.parse(tpl, { color: 'blue' })).toBe('');
        });

        test('else acts as default branch', () => {
            const tpl = '{% case color %}{% when "red" %}R{% else %}?{% endcase %}';
            expect(template.parse(tpl, { color: 'purple' })).toBe('?');
        });

        test('when accepts multiple values', () => {
            const tpl = '{% case color %}{% when "red", "crimson" %}R{% endcase %}';
            expect(template.parse(tpl, { color: 'crimson' })).toBe('R');
        });
    });

    describe('capture', () => {
        test('stores block content in a variable', () => {
            expect(
                template.parse('{% capture msg %}Hello!{% endcapture %}{{ msg }}'),
            ).toBe('Hello!');
        });

        test('captured variable is available after the block', () => {
            const tpl =
                '{% capture greeting %}Hi {% capture name %}World{% endcapture %}{% endcapture %}{{ greeting }}{{ name }}';
            expect(template.parse(tpl)).toBe('Hi World');
        });
    });

    describe('addFilter', () => {
        test('registers and applies a custom filter', () => {
            template.addFilter('shout', (v) => v + '!!!');
            expect(template.parse('{{ msg | shout }}', { msg: 'hello' })).toBe('hello!!!');
        });

        test('custom filter with argument', () => {
            template.addFilter('repeat', (v, n) => v.repeat(n));
            expect(template.parse('{{ char | repeat: 3 }}', { char: 'ha' })).toBe('hahaha');
        });

        test('custom filter chains with built-in filters', () => {
            template.addFilter('exclaim', (v) => v + '!');
            expect(template.parse('{{ msg | upper | exclaim }}', { msg: 'hi' })).toBe('HI!');
        });
    });

    describe('echo', () => {
        test('outputs a variable', () => {
            expect(template.parse('{% echo greeting %}!', { greeting: 'hello' })).toBe('hello!');
        });

        test('outputs a literal string', () => {
            expect(template.parse('say: {% echo "world" %}!', {})).toBe('say: world!');
        });

        test('outputs with filter', () => {
            expect(template.parse('{% echo name | upper %}!', { name: 'alice' })).toBe('ALICE!');
        });

        test.fails('outputs when echo is the last token in the template', () => {
            expect(template.parse('{% echo greeting %}', { greeting: 'hello' })).toBe('hello');
        });
    });

    describe('cycle', () => {
        test.fails('cycles through values on each call', () => {
            const tpl =
                '{% for x in items %}{% cycle "odd", "even" %}{% endfor %}';
            expect(template.parse(tpl, { items: [1, 2, 3] })).toBe('oddevenodd');
        });
    });

    describe('filter / endfilter', () => {
        test.fails('applies a filter to a block of content', () => {
            expect(template.parse('{% filter upper %}hello{% endfilter %}text')).toBe('HELLOtext');
        });

        test.fails('filter block with chained built-in filter', () => {
            expect(
                template.parse('{% filter upper %}alice{% endfilter %}text'),
            ).toBe('ALICEtext');
        });
    });

    describe('whitespace control', () => {
        test.fails('leading dash {{- trims leading whitespace from value', () => {
            expect(template.parse('{{- name }}', { name: '  hello' })).toBe('hello');
        });

        test.fails('trailing dash -}} trims trailing whitespace from value', () => {
            expect(template.parse('{{ name -}}', { name: 'hello  ' })).toBe('hello');
        });
    });

    describe('render (Node.js)', () => {
        beforeEach(() => {
            template.addPath('playground/');
            template.cache.clear();
        });

        test('render() loads a loop template and renders items', async () => {
            const result = await template.render('examples/loop/template', { team: ['Alice', 'Bob', 'Carol'] });
            expect(result).toContain('Alice');
            expect(result).toContain('Bob');
            expect(result).toContain('Carol');
        });

        test('render() loop template renders loop.index correctly', async () => {
            const result = await template.render('examples/loop/template', { team: ['Alice'] });
            expect(result).toContain('1. Alice');
        });

        test('render() loads a conditions template — admin branch', async () => {
            const result = await template.render('examples/conditions/template', { role: 'admin' });
            expect(result).toContain('Admin access');
            expect(result).not.toContain('Editor access');
            expect(result).not.toContain('Viewer access');
        });

        test('render() loads a conditions template — elseif branch', async () => {
            const result = await template.render('examples/conditions/template', { role: 'editor' });
            expect(result).toContain('Editor access');
            expect(result).not.toContain('Admin access');
        });

        test('render() loads a conditions template — else branch', async () => {
            const result = await template.render('examples/conditions/template', { role: 'guest' });
            expect(result).toContain('Viewer access');
        });

        test('render() loads a filters template', async () => {
            const result = await template.render('examples/filters/template', {
                title: 'hello',
                greeting: 'Hello world',
                price: 9.999,
                tags: ['js', 'html']
            });
            expect(result).toContain('HELLO');
            expect(result).toContain('Hey world');
            expect(result).toContain('10.00');
        });

        test('render() loads a nested template', async () => {
            const result = await template.render('examples/nested/template', {
                title: 'Team',
                users: [
                    { name: 'Alice', active: true, roles: ['admin'] },
                    { name: 'Bob', active: false, roles: ['editor'] }
                ]
            });
            expect(result).toContain('Alice');
            expect(result).toContain('ADMIN');
            expect(result).toContain('Bob');
            expect(result).toContain('EDITOR');
        });

        test('render() caches the template on second call', async () => {
            await template.render('examples/loop/template', { team: ['Alice'] });
            expect(template.cache.has('examples/loop/template')).toBe(true);
            const result = await template.render('examples/loop/template', { team: ['Bob'] });
            expect(result).toContain('Bob');
        });

        test('render() returns empty string for non-existent file', async () => {
            const result = await template.render('examples/does-not-exist/template', {});
            expect(result).toBe('');
        });

        test('render() with empty data object renders static template', async () => {
            const result = await template.render('examples/loop/template', {});
            expect(typeof result).toBe('string');
        });
    });
});
