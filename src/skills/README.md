# AEGIS Agent Skills Module

This module provides a standalone `SkillsManager` for discovering and parsing `SKILL.md` files following the Agent Skills open standard.

## Installation / Attachment

To attach this to another AEGIS Agentic App:

1. **Copy the `skills` directory** (containing `manager.ts`) to your project.
2. **Ensure dependencies**: Standard `fs` and `path` modules are utilized.
3. **Instantiate the Manager**:

```typescript
import { SkillsManager } from './src/skills/manager.js';

// Supply config path if scanning a custom content repository
const manager = new SkillsManager('/absolute/path/to/my/skills');
const skills = manager.listSkills();

console.log(skills);
```

## Structure

Each skill should be a self-contained folder under the scanned directory:

skills/
└── skill_name/
    ├── SKILL.md       # Frontmatter (name, description) + markdown
    └── scripts/        # (Optional) tools

## Standard Context Inclusion

When running agent templates, match `dataquad` preferences with loaded skills content and inject:

```typescript
const combinedInstructions = skills.map(s => `## Skill: ${s.name}\n${s.content}`).join('\n\n');
```
