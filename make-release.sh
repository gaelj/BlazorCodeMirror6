#!/usr/bin/env bash
# -*- coding: utf-8 -*-

# This script is used to generate a new release.

# Usage: ./make-release.sh

# print latest tag
last_version=$(git describe --tags --abbrev=0 "$(git rev-list --tags --max-count=1)")
echo "Current version: $last_version"

# Ask if the user wants a major, minor or patch release
echo "What kind of release is this?"
select yn in "major" "minor" "patch"; do
    case $yn in
        patch ) new_version=$(semver -i patch "$last_version"); break;;
        minor ) new_version=$(semver -i minor "$last_version"); break;;
        major ) new_version=$(semver -i major "$last_version"); break;;
    esac
done

echo "New version: $new_version"

# Update main changelog
sed -i "3i## $new_version - $(date +%Y-%m-%d)\n\n" CHANGELOG.md
sed -i '4r NEW_CHANGELOG.md' CHANGELOG.md
git add ./*CHANGELOG.md
git commit -m "📝 Update changelog for $new_version"

# Bump version in all .csproj files
dotnet setversion -r "$new_version"
git add ./**/*.csproj
git commit -m "🔖 Bump version to $new_version"

# Add git tag
git tag -a "$new_version" -m "🔖 $new_version"
