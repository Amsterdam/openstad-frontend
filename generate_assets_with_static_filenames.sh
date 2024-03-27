#!/bin/bash

# Run the command to generate files
node apostrophe.js apostrophe:generation --create-bundle assets

# Define the directory where the files are located
assets_directory="assets/public/apos-minified"
generation_id_file="assets/data/generation"

# Get the filenames starting with "anon-" and ending with ".css" and ".js"
css_file=$(find "$assets_directory" -type f -name "anon-*.css" -print -quit)
js_file=$(find "$assets_directory" -type f -name "anon-*.js" -print -quit)

# Check if environment variables are set and files are found
if [[ -n $STATIC_ASSETS_FILENAME_CONSTANT && -n $css_file && -n $js_file ]]; then
    # Rename the files with the values from environment variables
    mv "$css_file" "$assets_directory/anon-$STATIC_ASSETS_FILENAME_CONSTANT.css"
    mv "$js_file" "$assets_directory/anon-$STATIC_ASSETS_FILENAME_CONSTANT.js"
    echo "$STATIC_ASSETS_FILENAME_CONSTANT" > "$generation_id_file"
    echo "Files renamed successfully."
elif [[ -z $CSS_FILENAME || -z $JS_FILENAME ]]; then
    echo "Not renaming files: Environment variable STATIC_ASSETS_FILENAME_CONSTANT is not set."
else
    echo "Error: .css and .js files not found for renaming."
fi