#!/bin/bash

# Run the command to generate files
node apostrophe.js apostrophe:generation --create-bundle assets

# Define the directory where the files are located
directory="assets/public/apos-minified"

# Get the filenames starting with "anon-" and ending with ".css" and ".js"
css_file=$(find "$directory" -type f -name "anon-*.css" -print -quit)
js_file=$(find "$directory" -type f -name "anon-*.js" -print -quit)

# Check if files are found
if [[ -n $css_file && -n $js_file ]]; then
    # Rename the files with the values from environment variables
    mv "$css_file" "$directory/anon-handmatig-overschreven.css"
    mv "$js_file" "$directory/anon-handmatig-overschreven.js"
    echo "Files renamed successfully."
else
    echo "Error: Files not found."
fi
