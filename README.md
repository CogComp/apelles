# Apelles

This is a visualization library designed around cogcomp's NLP datastructures.

## Basics 

Requirements: NodeJS, NPM should be installed.

To install dependencies:
`npm install` in the root directory to install required NodeJS modules.

There are two use-cases for the system: 

 1. Demo for visualization of annotations (served over networks) 
 2. Diff-ing tool for local files containing annotations 

### Running the demo server 

To start the dev server:
`node server.js`

### Local comparison and display tool

`comparison.js` provides a tool for comparing several annotation versions of the same text.

Usage:

1. Create two or more folders, representing versions, of annotation JSON files with identical file names.

   Example: `prediction/sample.json` and `gold/sample.json`

1. Start server with `node comparison.js --port <PORT> <FOLDER#1> <FOLDER#2>`.
   This command can be run from any working directory, with `<FOLDER>` relative to current working directory.

   Example: `node comparison.js --port 3154 prediction gold`
   
1. Browse `<SERVER ADDRESS>:<PORT>`. All files named according to 1. will be shown under the first drop-down list. Multiple files and view types can be chosen to display vertically in order.

   Example: `localhost:3154`

This tool can also be used to display annotation files if only one version is specified.
