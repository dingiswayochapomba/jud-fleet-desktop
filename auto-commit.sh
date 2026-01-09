#!/bin/bash

# Auto-commit to GitHub every 15 minutes
# This script continuously monitors for changes and commits them automatically

INTERVAL=900  # 15 minutes in seconds
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting auto-commit service..."
echo "Repository: $REPO_DIR"
echo "Commit interval: 15 minutes"
echo ""

cd "$REPO_DIR"

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "❌ Git repository not found. Please initialize git first."
  exit 1
fi

# Get the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $BRANCH"
echo ""

while true; do
  echo "⏰ $(date '+%Y-%m-%d %H:%M:%S') - Checking for changes..."
  
  # Check if there are changes to commit
  if git diff-index --quiet HEAD --; then
    echo "✅ No changes detected"
  else
    echo "📝 Changes detected, committing..."
    
    # Stage all changes
    git add -A
    
    # Create a commit message with timestamp
    COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Commit
    if git commit -m "$COMMIT_MSG"; then
      echo "✓ Committed: $COMMIT_MSG"
      
      # Push to GitHub
      if git push origin "$BRANCH"; then
        echo "✓ Pushed to GitHub successfully"
      else
        echo "⚠️  Push failed. Check your connection and GitHub credentials."
      fi
    else
      echo "⚠️  Commit failed"
    fi
  fi
  
  # Check untracked files
  UNTRACKED=$(git ls-files --others --exclude-standard)
  if [ -n "$UNTRACKED" ]; then
    echo "📄 Untracked files detected:"
    echo "$UNTRACKED" | sed 's/^/   - /'
  fi
  
  echo ""
  echo "💤 Waiting 15 minutes until next check..."
  echo "---"
  
  # Wait for 15 minutes
  sleep $INTERVAL
done
