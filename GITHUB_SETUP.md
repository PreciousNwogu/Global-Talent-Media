# Connecting Local Repository to GitHub

## Steps to Connect Your Local Repository to GitHub

### 1. Initialize Git (if not already done)

```bash
git init
```

### 2. Add Remote Repository

```bash
git remote add origin https://github.com/PreciousNwogu/Global-Talent-Media.git
```

### 3. Verify Remote Connection

```bash
git remote -v
```

You should see:
```
origin  https://github.com/PreciousNwogu/Global-Talent-Media.git (fetch)
origin  https://github.com/PreciousNwogu/Global-Talent-Media.git (push)
```

### 4. Stage All Files

```bash
git add .
```

### 5. Commit Changes

```bash
git commit -m "Initial commit: Global Talent Media Hub web app"
```

### 6. Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## If You Get Authentication Errors

### Option 1: Use Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when prompted:
   ```
   Username: your-github-username
   Password: your-personal-access-token
   ```

### Option 2: Use SSH (Alternative)

1. Generate SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add SSH key to GitHub:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key

3. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:PreciousNwogu/Global-Talent-Media.git
   ```

## Important Notes

- **Never commit `.env` files** - They contain sensitive information
- **`.gitignore` is configured** - Sensitive files are excluded
- **Database file** - `backend/database/database.sqlite` is ignored
- **Vendor/node_modules** - Already ignored (too large for git)

## Verify What Will Be Committed

Before committing, check what files will be added:

```bash
git status
```

Make sure `.env` files are NOT listed.

## Troubleshooting

### "Repository not found"
- Check repository URL is correct
- Verify you have access to the repository
- Make sure repository exists on GitHub

### "Permission denied"
- Use Personal Access Token instead of password
- Or set up SSH authentication

### "Branch already exists"
- The repository might not be empty
- Try: `git pull origin main --allow-unrelated-histories` first
- Then: `git push -u origin main`

