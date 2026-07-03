@echo off
echo WARNING: This script will rewrite your entire Git history to remove client/.env
echo Make sure you have revoked the exposed credentials in Google Cloud Console first!
pause

git filter-branch --force --index-filter "git rm --cached --ignore-unmatch client/.env" --prune-empty --tag-name-filter cat -- --all

echo.
echo History rewritten. Please run:
echo git push origin --force --all
echo to overwrite the remote repository history.
pause
