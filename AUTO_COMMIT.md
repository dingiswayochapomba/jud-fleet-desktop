# Auto-Commit Service

Automatically commit and push changes to GitHub every 15 minutes.

## Quick Start

### Windows
```bash
./auto-commit.bat
```
Or double-click `auto-commit.bat`

### macOS/Linux
```bash
bash auto-commit.sh
```
or
```bash
chmod +x auto-commit.sh
./auto-commit.sh
```

## How It Works

1. **Monitors for changes** - Every 15 minutes, the script checks for any uncommitted changes
2. **Auto-stages files** - All modified files are automatically staged (`git add -A`)
3. **Creates commits** - Changes are committed with a timestamp message
4. **Pushes to GitHub** - Commits are automatically pushed to the current branch

## Features

✅ Runs continuously in the background  
✅ Checks every 15 minutes  
✅ Auto-stages all changes  
✅ Creates timestamped commit messages  
✅ Pushes to GitHub automatically  
✅ Shows status updates in console  
✅ Reports untracked files  
✅ Handles errors gracefully  

## Example Output

```
🚀 Starting auto-commit service...
Repository: C:\mantle\DevOps\fleet desktop
Commit interval: 15 minutes

📍 Current branch: main

⏰ 2026-01-09 17:45:30 - Checking for changes...
📝 Changes detected, committing...
✓ Committed: Auto-commit: 2026-01-09 17:45:30
✓ Pushed to GitHub successfully

💤 Waiting 15 minutes until next check...
---
```

## Requirements

- Git installed and configured
- GitHub repository initialized (`.git` directory present)
- Git credentials configured (SSH key or PAT token)
- Network connection to GitHub

## Stopping the Service

**Windows:** Press `Ctrl+C` in the command prompt  
**macOS/Linux:** Press `Ctrl+C` in the terminal

## Troubleshooting

### "Git repository not found"
- Make sure you're running the script from the repository root directory
- Check that `.git/` folder exists

### "Push failed"
- Verify your GitHub credentials are configured
- Check internet connection
- Ensure you have push permissions for the repository
- Check that your SSH key or PAT token is still valid

### No commits happening
- Check that you actually have file changes
- Verify git is working: `git status`
- Check file permissions

## Background Process (Optional)

### Windows - Run as background service
```bash
start /B auto-commit.bat
```

### macOS/Linux - Run with nohup
```bash
nohup bash auto-commit.sh &
```

## Integration with Development

Run this alongside your development:
1. **Terminal 1:** `npm run dev` (start dev server)
2. **Terminal 2:** `bash auto-commit.sh` (start auto-commit)

Your changes will be automatically saved to GitHub every 15 minutes while you work!

## Disabling Auto-Commit for Specific Files

Add files to `.gitignore` to prevent them from being committed:

```
# .gitignore
node_modules/
.env.local
*.log
dist/
```

## Advanced: Customize Commit Interval

Edit the script and change this line:

**Bash:**
```bash
INTERVAL=900  # Change 900 to desired seconds (e.g., 300 for 5 min)
```

**Batch:**
```batch
timeout /t 900 /nobreak
REM Change 900 to desired seconds (e.g., 300 for 5 min)
```

## Security Notes

- Ensure your SSH key has a passphrase
- Consider using a GitHub Personal Access Token (PAT) for HTTPS
- Review auto-committed changes regularly to catch mistakes
- Keep `.gitignore` updated to prevent accidental commits of sensitive files

## License

This auto-commit service is part of the Judiciary Fleet Management Desktop App.
