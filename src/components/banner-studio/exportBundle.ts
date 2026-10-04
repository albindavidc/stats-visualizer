import JSZip from 'jszip';
import { ProjectItem } from './types';

export function createReadmeContent(username: string): string {
  const user = username.trim() || 'YOUR_USERNAME';

  return `# Hi there, I'm ${user} 👋

<div align="center">
  <!-- Profile Terminal Banner (Animated SVG) -->
  <img src="profile.svg" alt="${user}'s GitHub Profile Banner" width="100%" />
</div>

<br/>

### 🛠️ Featured Projects & Systems

<!-- START_PROJECTS_LIST -->
<div align="center">
  <p><em>Automated project cards refreshed daily by GitHub Actions.</em></p>
</div>
<!-- END_PROJECTS_LIST -->

---

### 🚀 Automated Deployment
This banner and project showcase is powered by GitHub Actions.
- **Workflow:** \`.github/workflows/projects.yml\`
- **Source Configuration:** \`projects.json\`
- **Terminal Banner:** \`profile.svg\`

<div align="center">
  <sub>Generated with <b>Profile Banner Studio</b></sub>
</div>
`;
}

export const WORKFLOW_YML = `name: Update Projects Data

on:
  schedule:
    - cron: '0 0 * * *' # Runs daily at midnight UTC
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - 'projects.json'

permissions:
  contents: write

jobs:
  update-showcase:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install requests

      - name: Fetch Live GitHub Repository Data
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: python .github/scripts/fetch_data.py

      - name: Generate Project Showcase
        run: python .github/scripts/generate_projects.py

      - name: Commit and push if updated
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add -A
          git diff --quiet && git diff --staged --quiet || (git commit -m "chore(projects): update live repository showcase [skip ci]" && git push)
`;

export const FETCH_DATA_PY = `#!/usr/bin/env python3
"""
fetch_data.py
Reads projects.json and queries GitHub's REST API for live metadata (stars, forks, description, language).
Outputs projects_data.json.
"""
import os
import json
import requests

def main():
    if not os.path.exists("projects.json"):
        print("projects.json not found, skipping fetch.")
        return

    with open("projects.json", "r", encoding="utf-8") as f:
        projects = json.load(f)

    token = os.environ.get("GITHUB_TOKEN")
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "profile-banner-studio"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    enriched = []
    for proj in projects:
        repo = proj.get("repo", "").strip()
        data = {
            "name": proj.get("name", ""),
            "repo": repo,
            "logo": proj.get("logo", ""),
            "description": proj.get("description", ""),
            "tags": proj.get("tags", []),
            "stars": 0,
            "forks": 0,
            "language": "Code"
        }

        if repo and "/" in repo:
            try:
                url = f"https://api.github.com/repos/{repo}"
                resp = requests.get(url, headers=headers, timeout=10)
                if resp.status_code == 200:
                    api_data = resp.json()
                    data["stars"] = api_data.get("stargazers_count", 0)
                    data["forks"] = api_data.get("forks_count", 0)
                    data["language"] = api_data.get("language") or "Code"
                    if not data["description"]:
                        data["description"] = api_data.get("description") or ""
                    print(f"✓ Fetched {repo}: {data['stars']} stars")
                else:
                    print(f"! Failed to fetch {repo}: HTTP {resp.status_code}")
            except Exception as e:
                print(f"! Error querying {repo}: {e}")

        enriched.append(data)

    with open("projects_data.json", "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2)
    print("✓ Successfully saved projects_data.json")

if __name__ == "__main__":
    main()
`;

export const GENERATE_PROJECTS_PY = `#!/usr/bin/env python3
"""
generate_projects.py
Reads projects_data.json (or projects.json) and formats project cards into README.md between:
<!-- START_PROJECTS_LIST --> and <!-- END_PROJECTS_LIST -->.
"""
import os
import json
import re

def render_project_markdown(project):
    name = project.get("name", "Project")
    repo = project.get("repo", "")
    desc = project.get("description", "")
    tags = project.get("tags", [])
    stars = project.get("stars", 0)
    forks = project.get("forks", 0)
    lang = project.get("language", "")

    repo_url = f"https://github.com/{repo}" if repo else "#"
    tags_str = " ".join([f"\`#{t}\`" for t in tags]) if tags else ""

    stats_badge = f"⭐ {stars} &nbsp;|&nbsp; 🍴 {forks}" if (stars or forks) else ""
    if lang:
        stats_badge += f" &nbsp;|&nbsp; 💻 {lang}"

    return f"""
### 📦 [{name}]({repo_url})
> {desc}

{stats_badge}

{tags_str}
"""

def main():
    source_file = "projects_data.json" if os.path.exists("projects_data.json") else "projects.json"
    if not os.path.exists(source_file):
        print(f"{source_file} not found, skipping generation.")
        return

    with open(source_file, "r", encoding="utf-8") as f:
        projects = json.load(f)

    cards_md = "\\n".join([render_project_markdown(p) for p in projects])
    new_section = f"<!-- START_PROJECTS_LIST -->\\n{cards_md}\\n<!-- END_PROJECTS_LIST -->"

    if os.path.exists("README.md"):
        with open("README.md", "r", encoding="utf-8") as f:
            readme = f.read()

        pattern = re.compile(r"<!-- START_PROJECTS_LIST -->.*?<!-- END_PROJECTS_LIST -->", re.DOTALL)
        if pattern.search(readme):
            updated_readme = pattern.sub(new_section, readme)
        else:
            updated_readme = readme + "\\n\\n" + new_section

        with open("README.md", "w", encoding="utf-8") as f:
            f.write(updated_readme)
        print("✓ Successfully updated README.md with project cards")
    else:
        print("README.md not found, creating new one.")
        with open("README.md", "w", encoding="utf-8") as f:
            f.write(f"# Projects Showcase\\n\\n{new_section}\\n")

if __name__ == "__main__":
    main()
`;

export async function downloadStarterBundle(
  svgString: string,
  projects: ProjectItem[],
  username: string
): Promise<void> {
  const zip = new JSZip();

  // 1. profile.svg
  zip.file('profile.svg', svgString);

  // 2. projects.json (strip UI internal IDs)
  const cleanProjects = projects.map(({ name, repo, logo, description, tags }) => ({
    name,
    repo,
    logo,
    description,
    tags
  }));
  zip.file('projects.json', JSON.stringify(cleanProjects, null, 2));

  // 3. logos/.gitkeep
  zip.file('logos/.gitkeep', '# Place custom project logo png/svg files here\n');

  // 4. README.md
  zip.file('README.md', createReadmeContent(username));

  // 5. .github/workflows/projects.yml
  zip.file('.github/workflows/projects.yml', WORKFLOW_YML);

  // 6. .github/scripts/fetch_data.py
  zip.file('.github/scripts/fetch_data.py', FETCH_DATA_PY);

  // 7. .github/scripts/generate_projects.py
  zip.file('.github/scripts/generate_projects.py', GENERATE_PROJECTS_PY);

  // Generate and download zip
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${username.trim() || 'profile'}-banner-starter.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
