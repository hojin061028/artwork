Set-Location "c:\Users\25학번\Desktop\star design\out"
if (Test-Path .git) { Remove-Item .git -Recurse -Force }
git init
git checkout -b gh-pages
git add .
git commit -m "Manual Deploy"
git remote add origin https://github.com/hojin061028/artwork.git
git config --global http.postBuffer 524288000
git push -f origin gh-pages --verbose
