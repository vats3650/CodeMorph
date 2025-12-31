export enum CodeLanguage {
  JAVA = 'java',
  PYTHON = 'python',
  COBOL = 'cobol',
  GO = 'go',
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  UNKNOWN = 'unknown'
}

export interface MigrationConfig {
  sourceTechs: string[];
  targetTechs: string[];
}

export interface SecurityIssue {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  remediation: string;
}

export interface ConversionResult {
  modernCode: string;
  unitTests: string;
  documentation: string;
  securityReport: SecurityIssue[];
}

export type MigrationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ProjectFile {
  path: string;
  content: string | null; // Original content
  type: 'file' | 'directory';
  url?: string; // GitHub raw URL
  language?: CodeLanguage;
  
  // Migration State
  status: MigrationStatus;
  modernContent: string | null;
  unitTests: string | null;
  documentation: string | null;
  securityIssues: SecurityIssue[];
  error?: string;
}

export interface WorkspaceState {
  activeFilePath: string | null;
  isBatchProcessing: boolean;
  activeTab: 'tests' | 'security' | 'docs';
}
