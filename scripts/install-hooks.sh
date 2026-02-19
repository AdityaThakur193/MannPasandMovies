#!/bin/sh
# Install git hooks for the MannPasandMovies project
# Run this once after cloning: bash scripts/install-hooks.sh

HOOK_DIR="$(git rev-parse --git-dir)/hooks"

cat > "$HOOK_DIR/pre-commit" << 'EOF'
#!/bin/sh
# Pre-commit hook: Prevent accidental commit of sensitive files

# Check for .env files
ENV_FILES=$(git diff --cached --name-only | grep -E '\.env$|\.env\..+$' | grep -v '\.env\.example$')
if [ -n "$ENV_FILES" ]; then
  echo "❌ ERROR: Attempting to commit environment file(s):"
  echo "$ENV_FILES"
  echo ""
  echo "These files may contain secrets. Remove them from staging:"
  echo "  git reset HEAD <file>"
  echo ""
  echo "If this is intentional, use: git commit --no-verify"
  exit 1
fi

# Check for common secret patterns in staged files
SECRETS_PATTERN='(mongodb\+srv://[^@]+@|GOCSPX-|AIza[0-9A-Za-z_-]{35}|sk-[a-zA-Z0-9]{20,}|-----BEGIN (RSA |EC )?PRIVATE KEY-----)'
STAGED_CONTENT=$(git diff --cached -U0 | grep -E "^\+" | grep -v "^\+\+\+" || true)
if echo "$STAGED_CONTENT" | grep -qE "$SECRETS_PATTERN"; then
  echo "❌ ERROR: Potential secret detected in staged changes!"
  echo ""
  echo "Review your staged changes for credentials/keys:"
  echo "  git diff --cached"
  echo ""
  echo "If this is a false positive, use: git commit --no-verify"
  exit 1
fi

echo "✅ Pre-commit security checks passed."
EOF

chmod +x "$HOOK_DIR/pre-commit"
echo "✅ Pre-commit hook installed successfully."
