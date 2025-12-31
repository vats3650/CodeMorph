import JSZip from 'jszip';
import { ProjectFile, MigrationStatus, CodeLanguage } from '../types';

/**
 * Helper to determine language from extension
 */
const getLanguageFromPath = (path: string): CodeLanguage => {
    if (path.endsWith('.java')) return CodeLanguage.JAVA;
    if (path.endsWith('.py')) return CodeLanguage.PYTHON;
    if (path.endsWith('.cbl') || path.endsWith('.cob')) return CodeLanguage.COBOL;
    if (path.endsWith('.go')) return CodeLanguage.GO;
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return CodeLanguage.TYPESCRIPT;
    if (path.endsWith('.js') || path.endsWith('.jsx')) return CodeLanguage.JAVASCRIPT;
    return CodeLanguage.UNKNOWN;
};

/**
 * Parses a ZIP file and returns a flat list of files with their content.
 */
export const processZipFile = async (file: File): Promise<ProjectFile[]> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const files: ProjectFile[] = [];

  const promises: Promise<void>[] = [];

  loadedZip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      // Skip hidden files or binaries generally (simple check)
      if (relativePath.includes('__MACOSX') || relativePath.startsWith('.')) return;

      const promise = zipEntry.async('string').then((content) => {
        files.push({
          path: relativePath,
          content: content,
          type: 'file',
          language: getLanguageFromPath(relativePath),
          status: 'pending',
          modernContent: null,
          unitTests: null,
          documentation: null,
          securityIssues: []
        });
      });
      promises.push(promise);
    }
  });

  await Promise.all(promises);
  return files.sort((a, b) => a.path.localeCompare(b.path));
};

/**
 * Fetches the file tree of a public GitHub repository.
 */
export const fetchGitHubRepoTree = async (repoUrl: string): Promise<ProjectFile[]> => {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = repoUrl.match(regex);
  
  if (!match) {
    throw new Error('Invalid GitHub URL. Format: https://github.com/owner/repo');
  }

  const owner = match[1];
  const repo = match[2].replace('.git', '');

  let defaultBranch = 'main';
  try {
     const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
     if (repoInfoRes.ok) {
         const repoInfo = await repoInfoRes.json();
         defaultBranch = repoInfo.default_branch;
     }
  } catch (e) {
      console.warn("Could not fetch repo info, defaulting to main");
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
  
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
      if (response.status === 403) throw new Error("GitHub API rate limit exceeded. Please try again later.");
      if (response.status === 404) throw new Error("Repository not found or private.");
      throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  const data = await response.json();
  
  const files: ProjectFile[] = data.tree
    .filter((item: any) => item.type === 'blob')
    .map((item: any) => ({
      path: item.path,
      content: null, // Lazy load
      type: 'file',
      url: `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${item.path}`,
      language: getLanguageFromPath(item.path),
      status: 'pending',
      modernContent: null,
      unitTests: null,
      documentation: null,
      securityIssues: []
    }));

  return files;
};

export const fetchFileContent = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file content");
    return await response.text();
};
