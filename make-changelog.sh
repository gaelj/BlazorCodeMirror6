#!/usr/bin/env bash
# -*- coding: utf-8 -*-

# This script is used to generate a changelog for the current release.

# Usage: ./make-changelog.sh

##git log --pretty=format:'%d%s' --decorate=short $(git describe --tags --abbrev=0 $(git rev-list --tags --skip=1 --max-count=1))..$(git describe --tags --abbrev=0) > NEW_CHANGELOG.md || echo "Not enough tags for changelog generation" > NEW_CHANGELOG.md
## git log --pretty=format:'%d%s' --decorate=short > NEW_CHANGELOG.md
git log --pretty=format:'%s' --decorate=short "$(git describe --tags --abbrev=0 "$(git rev-list --tags --max-count=1)")"..HEAD > NEW_CHANGELOG.md || echo "Not enough tags for changelog generation" > NEW_CHANGELOG.md

#git log --pretty=format:'%s' --decorate=short $(git rev-list --tags --skip=0 --max-count=1)..$(git rev-list --tags --skip=1 --max-count=2) > NEW_CHANGELOG.md || echo "Not enough tags for changelog generation" > NEW_CHANGELOG.md

#git log --pretty=format:'%s' --decorate=short 9d3bceaf29eda2f3731f52caf1af03e70d024cfb..e293607ff0c023e54f42386027c974886284d3e7 > NEW_CHANGELOG.md || echo "Not enough tags for changelog generation" > NEW_CHANGELOG.md
#git log --pretty=format:'%s' --decorate=short e293607ff0c023e54f42386027c974886284d3e7..96a2bedadb341e4a7e8ead5151c4786e10eb31a9 > NEW_CHANGELOG.md || echo "Not enough tags for changelog generation" > NEW_CHANGELOG.md

# remove duplicate lines
awk '!seen[$0]++' NEW_CHANGELOG.md > temp.txt && mv temp.txt NEW_CHANGELOG.md

# remove merge commits
grep -v '^Merge ' NEW_CHANGELOG.md > temp.txt && mv temp.txt NEW_CHANGELOG.md

# sort lines alphabetically (including emoji characters in utf8)
LC_ALL=C sort -f -o NEW_CHANGELOG.md NEW_CHANGELOG.md

declare -A emoji_map
declare -A emoji_map
emoji_map=(
    ["🎨"]="Improve structure / format of the code"
    ["⚡️"]="Improve performance"
    ["🔥"]="Remove code or files"
    ["🐛"]="Fix a bug"
    ["🚑"]="Critical hotfix"
    ["✨"]="Introduce new features"
    ["📝"]="Add or update documentation"
    ["🚀"]="Deploy stuff"
    ["💄"]="Add or update the UI and style files"
    ["🎉"]="Begin a project"
    ["✅"]="Add, update, or pass tests"
    ["🔒️"]="Fix security issues"
    ["🔐"]="Add or update secrets"
    ["🔖"]="Release / Version tags"
    ["🚨"]="Fix compiler / linter warnings"
    ["🚧"]="Work in progress"
    ["💚"]="Fix CI Build"
    ["⬇️"]="Downgrade dependencies"
    ["⬆️"]="Upgrade dependencies"
    ["📌"]="Pin dependencies to specific versions"
    ["👷"]="Add or update CI build system"
    ["📈"]="Add or update analytics or track code"
    ["♻️"]="Refactor code"
    ["➕"]="Add a dependency"
    ["➖"]="Remove a dependency"
    ["🔧"]="Add or update configuration files"
    ["🔨"]="Add or update development scripts"
    ["🌐"]="Internationalization and localization"
    ["✏️"]="Fix typos"
    ["💩"]="Write bad code that needs to be improved"
    ["⏪"]="Revert changes"
    ["🔀"]="Merge branches"
    ["📦"]="Add or update compiled files or packages"
    ["👽"]="Update code due to external API changes"
    ["🚚"]="Move or rename resources (e.g., files, paths)"
    ["📄"]="Add or update license"
    ["💥"]="Introduce breaking changes"
    ["🍱"]="Add or update assets"
    ["♿"]="Improve accessibility"
    ["💡"]="Document source code"
    ["🍻"]="Write code drunkenly"
    ["💬"]="Add or update text and literals"
    ["🗃"]="Perform database related changes"
    ["🔊"]="Add or update logs"
    ["🔇"]="Remove logs"
    ["👥"]="Add or update contributor(s)"
    ["🚸"]="Improve user experience / usability"
    ["🏗"]="Make architectural changes"
    ["📱"]="Work on responsive design"
    ["🤡"]="Mock things"
    ["🥚"]="Add or update an easter egg"
    ["🙈"]="Add or update a .gitignore file"
    ["📸"]="Add or update snapshots"
    ["⚗️"]="Perform experiments"
    ["🔍"]="Improve SEO"
    ["🏷️"]="Add or update types"
    ["🌱"]="Add or update seed files"
    ["🚩"]="Add, update, or remove feature flags"
    ["🥅"]="Catch errors"
    ["💫"]="Add or update animations and transitions"
    ["🗑️"]="Deprecate code that needs to be cleaned up"
    ["🛂"]="Work on code related to authorization, roles, and permissions"
)

# retrieve the emoji from each commit message and create a title line for each emoji
while IFS= read -r line; do
    # Extract the emoji from the start of the line
    current_emoji=$(echo "$line" | cut -d ' ' -f1)

    # If the emoji has changed, print a title line
    if [ "$current_emoji" != "$previous_emoji" ]; then
        # if previous_emoji is defined
        if [ -n "$previous_emoji" ]; then
            echo ""
        fi
        title=${emoji_map[$current_emoji]}
        echo "### $current_emoji $title"
        echo ""
        previous_emoji="$current_emoji"
    fi

    # modify the original line to remove the first word
    line=$(echo "$line" | cut -d ' ' -f2-)
    echo "- $line"

done < "NEW_CHANGELOG.md" > "temp.txt" && mv "temp.txt" "NEW_CHANGELOG.md"
