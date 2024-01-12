#!/usr/bin/env bash
# -*- coding: utf-8 -*-

# This script is used to generate a changelog for the current release.

git log --pretty=format:'- %d%s' --decorate=short $(git describe --tags --abbrev=0 $(git rev-list --tags --skip=1 --max-count=1))..$(git describe --tags --abbrev=0) > NEW_CHANGELOG.md || echo "Not enough tags for changelog generation" > NEW_CHANGELOG.md

# git log --pretty=format:'- %d%s' --decorate=short > NEW_CHANGELOG.md

awk '!seen[$0]++' NEW_CHANGELOG.md > temp.txt && mv temp.txt NEW_CHANGELOG.md

grep -v '^- Merge ' NEW_CHANGELOG.md > temp.txt && mv temp.txt NEW_CHANGELOG.md
