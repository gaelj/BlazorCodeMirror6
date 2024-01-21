#!/bin/bash
dotnet tool restore

git fetch --all
git pull

dotnet tool update dotnet-outdated-tool

dotnet build
dotnet outdated --upgrade:Auto -vl Major

dotnet clean
dotnet restore --no-cache
dotnet build

nugethierarchy -s=. -o=dependency-tree.txt

dotnet symbol --recurse-subdirectories . --symbols --overwrite # --cache-directory "$HOME"/.symbols
