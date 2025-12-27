import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSourceFiles } from '../../src/scanner';
import { glob } from 'glob';

// Mock glob
vi.mock('glob', () => ({
    glob: vi.fn(),
}));

describe('scanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call glob with correct pattern and default ignores', async () => {
        const mockFiles = ['file1.ts', 'file2.tsx'];
        (glob as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockFiles);

        const dir = '/test/dir';
        const files = await getSourceFiles(dir);

        expect(glob).toHaveBeenCalledWith(`${dir}/**/*.{js,jsx,ts,tsx}`, {
            nodir: true,
            ignore: ['**/node_modules/**', '**/dist/**'],
        });
        expect(files).toEqual(mockFiles);
    });

    it('should include custom excludes in ignore list', async () => {
        (glob as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const dir = '/test/dir';
        const excludes = ['**/*.test.ts', 'temp/**'];
        await getSourceFiles(dir, excludes);

        expect(glob).toHaveBeenCalledWith(`${dir}/**/*.{js,jsx,ts,tsx}`, {
            nodir: true,
            ignore: ['**/node_modules/**', '**/dist/**', ...excludes],
        });
    });
});
