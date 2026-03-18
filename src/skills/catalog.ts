export interface CatalogSkill {
    id: string;
    name: string;
    description: string;
    category: string;
    icon?: string;
    skillMd: string;
}

export const SKILLS_CATALOG: CatalogSkill[] = [
    {
        id: "code_analyzer",
        name: "Code Analyzer",
        description: "Analyze code for security issues, performance bottlenecks, and best practices.",
        category: "Development",
        icon: "Code",
        skillMd: `---
name: Code Analyzer
description: Analyze code for security and performance issues.
---

# Code Analyzer Skill

You are an expert code reviewer and security analyzer.
Your task is to review provided code snippets or files and identify:
1.  **Security Vulnerabilities** (e.g., injection, loose permissions)
2.  **Performance Inefficiencies** (e.g., slow loops, memory leaks)
3.  **Style/Quality Issues** (e.g., dead code, poor naming)

## Instructions
- Use the \`read_file\` tool to inspect code if paths are provided.
- Provide a structured report with categories: Security, Performance, Quality.
- Always suggest minimal, safe fixes.
`
    },
    {
        id: "git_assistant",
        name: "Git Assistant",
        description: "Automate git workflows, structure commits, and manage branching safely.",
        category: "DevOps",
        icon: "GitBranch",
        skillMd: `---
name: Git Assistant
description: Automate git workflows and structure commits.
---

# Git Assistant Skill

You help manage Git workflows efficiently and safely.
You must adhere to clean commit practices and branching strategies.

## Instructions
- Before committing, always check \`git status\` and \`git diff\`.
- Structure commit messages clearly (e.g., "feat: add X", "fix: fix Y").
- Help the user create branches that match feature descriptions.
- Use \`mcp_GitKraken\` tools if available to visualize or manage history.
`
    },
    {
        id: "doc_generator",
        name: "Doc Generator",
        description: "Generate comprehensive documentation, API references, and READMEs.",
        category: "Productivity",
        icon: "FileText",
        skillMd: `---
name: Doc Generator
description: Generate API docs and READMEs.
---

# Doc Generator Skill

You specialize in creating clear, concise, and structured documentation.

## Instructions
- Analyze source code before writing documentation to ensure accuracy.
- Use standard Markdown with proper headings, lists, and code blocks.
- Generate sections for:
  - **Overview**
  - **Installation**
  - **Usage Examples**
  - **API Reference** (if applicable)
- Include mermaid diagrams for complex flows if requested.
`
    }
];
