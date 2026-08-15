import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';
import * as nodefs from 'node:fs/promises';
import { curlytag } from '#curlytag';

vi.mock('node:fs/promises', () => ({
    readFile: vi.fn()
}));

describe('CurlyTag fetch() path construction', () => {
    beforeEach(() => {
        vi.mocked(nodefs.readFile).mockResolvedValue('');
        curlytag.path.clear();
        curlytag.directory = '';
        curlytag.cache.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('directory (default path)', () => {
        test('simple path: directory + path + .html', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('greeting');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/greeting.html',
                'utf-8'
            );
        });

        test('one-level nested path keeps directory prefix', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('sub/page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/sub/page.html',
                'utf-8'
            );
        });

        test('deeply nested path keeps directory prefix', async () => {
            curlytag.directory = '/var/www/views/';
            await curlytag.fetch('admin/user/list');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/var/www/views/admin/user/list.html',
                'utf-8'
            );
        });

        test('addPath with single arg sets directory', async () => {
            curlytag.addPath('/my/templates/');
            await curlytag.fetch('index');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/my/templates/index.html',
                'utf-8'
            );
        });

        test('empty directory produces path starting from root segment', async () => {
            curlytag.directory = '';
            await curlytag.fetch('page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('page.html', 'utf-8');
        });
    });

    describe('namespace path resolution', () => {
        test('first segment namespace suffix is appended correctly', async () => {
            curlytag.addPath('catalog', '/themes/catalog');
            await curlytag.fetch('catalog/product/view');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/catalog/product/view.html',
                'utf-8'
            );
        });

        test('first segment namespace exact match produces no suffix', async () => {
            curlytag.addPath('catalog', '/themes/catalog');
            await curlytag.fetch('catalog');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/catalog.html',
                'utf-8'
            );
        });

        test('first segment namespace one nested segment', async () => {
            curlytag.addPath('admin', '/var/admin');
            await curlytag.fetch('admin/dashboard');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/var/admin/dashboard.html',
                'utf-8'
            );
        });

        test('first segment namespace three nested segments', async () => {
            curlytag.addPath('account', '/themes/account');
            await curlytag.fetch('account/orders/detail');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/account/orders/detail.html',
                'utf-8'
            );
        });

        test('deep namespace mid depth match builds correct path', async () => {
            curlytag.addPath('catalog/product', '/themes/product');
            await curlytag.fetch('catalog/product/view');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/product/view.html',
                'utf-8'
            );
        });

        test('deep namespace exact match produces no suffix', async () => {
            curlytag.addPath('catalog/product', '/themes/product');
            await curlytag.fetch('catalog/product');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/product.html',
                'utf-8'
            );
        });

        test('most specific namespace wins when multiple namespaces match', async () => {
            curlytag.addPath('catalog', '/themes/catalog');
            curlytag.addPath('catalog/product', '/themes/product');
            await curlytag.fetch('catalog/product/view');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/product/view.html',
                'utf-8'
            );
        });

        test('shallower namespace wins when deep namespace does not match', async () => {
            curlytag.addPath('catalog', '/themes/catalog');
            curlytag.addPath('catalog/product', '/themes/product');
            await curlytag.fetch('catalog/category/list');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/catalog/category/list.html',
                'utf-8'
            );
        });

        test('falls back to directory when no namespace matches', async () => {
            curlytag.directory = '/templates/';
            curlytag.addPath('catalog', '/themes/catalog');
            await curlytag.fetch('admin/dashboard');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/admin/dashboard.html',
                'utf-8'
            );
        });

        test('namespace does not affect path with different prefix', async () => {
            curlytag.addPath('shop', '/shop-templates');
            await curlytag.fetch('blog/post');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('blog/post.html', 'utf-8');
        });

        test('three namespaces registered correct one is selected', async () => {
            curlytag.addPath('a', '/dir-a');
            curlytag.addPath('b', '/dir-b');
            curlytag.addPath('c', '/dir-c');
            await curlytag.fetch('b/index');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('/dir-b/index.html', 'utf-8');
        });

        test('directory is ignored when namespace matches', async () => {
            curlytag.directory = '/fallback/';
            curlytag.addPath('catalog', '/themes/catalog');
            await curlytag.fetch('catalog/view');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/themes/catalog/view.html',
                'utf-8'
            );
        });
    });

    describe('addPath()', () => {
        test('two args register namespace in this.path map', async () => {
            curlytag.addPath('ns', '/path/to/ns');
            expect(curlytag.path.has('ns')).toBe(true);
            expect(curlytag.path.get('ns')).toBe('/path/to/ns');
        });

        test('one arg sets this.directory', async () => {
            curlytag.addPath('/base/');
            expect(curlytag.directory).toBe('/base/');
        });

        test('multiple addPath calls with namespaces accumulate independently', async () => {
            curlytag.addPath('a', '/dir-a');
            curlytag.addPath('b', '/dir-b');

            await curlytag.fetch('a/file');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('/dir-a/file.html', 'utf-8');

            vi.mocked(nodefs.readFile).mockClear();

            await curlytag.fetch('b/file');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('/dir-b/file.html', 'utf-8');
        });

        test('overwriting namespace replaces previous path', async () => {
            curlytag.addPath('ns', '/old-path');
            curlytag.addPath('ns', '/new-path');
            await curlytag.fetch('ns/file');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('/new-path/file.html', 'utf-8');
        });
    });

    describe('error handling', () => {
        test('returns empty string when file does not exist', async () => {
            vi.mocked(nodefs.readFile).mockRejectedValue(
                Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
            );
            const result = await curlytag.fetch('missing/file');
            expect(result).toBe('');
        });

        test('returns empty string when file read throws permission error', async () => {
            vi.mocked(nodefs.readFile).mockRejectedValue(
                Object.assign(new Error('EACCES'), { code: 'EACCES' })
            );
            const result = await curlytag.fetch('protected/file');
            expect(result).toBe('');
        });

        test('returns content when file exists', async () => {
            vi.mocked(nodefs.readFile).mockResolvedValue('Hello {{ name }}!');
            const result = await curlytag.fetch('greeting');
            expect(result).toBe('Hello {{ name }}!');
        });
    });

    describe('edge cases', () => {
        test('empty path with no directory produces just .html', async () => {
            await curlytag.fetch('');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('.html', 'utf-8');
        });

        test('empty path with directory produces directory + .html', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('/templates/.html', 'utf-8');
        });

        test('leading slash is preserved as part of path', async () => {
            curlytag.directory = '/templates';
            await curlytag.fetch('/page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/page.html',
                'utf-8'
            );
        });

        test('trailing slash is preserved as part of path', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('page/');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/page/.html',
                'utf-8'
            );
        });

        test('double slashes in path are preserved literally', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('sub//page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/sub//page.html',
                'utf-8'
            );
        });

        test('path with dot segments is preserved literally', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('sub/./page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/sub/./page.html',
                'utf-8'
            );
        });

        test('namespace matches full segment only not prefix', async () => {
            curlytag.addPath('cat', '/short');
            await curlytag.fetch('catalog/page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('catalog/page.html', 'utf-8');
        });

        test('namespace with trailing slash in stored path is preserved', async () => {
            curlytag.addPath('ns', '/dir/');
            await curlytag.fetch('ns/page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith('/dir//page.html', 'utf-8');
        });

        test('path containing dots in filename is preserved', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('page.v2');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/page.v2.html',
                'utf-8'
            );
        });

        test('path with spaces is preserved literally', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('my page');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/my page.html',
                'utf-8'
            );
        });

        test('path with unicode characters is preserved', async () => {
            curlytag.directory = '/templates/';
            await curlytag.fetch('страница');
            expect(vi.mocked(nodefs.readFile)).toHaveBeenCalledWith(
                '/templates/страница.html',
                'utf-8'
            );
        });
    });
});
