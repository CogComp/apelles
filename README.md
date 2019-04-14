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

`comparison.js` provides a tool for viewing annotations from static 
files (TextAnnotations serialized as json}, including comparing several 
different versions of the same annotation of the same text.

Usage for comparing multiple annotation versions:

1. Create two or more folders, representing versions, of annotation JSON files with identical file names.

   Example: `prediction/sample.json` and `gold/sample.json`

1. Start server with `node comparison.js --port <PORT> <FOLDER#1> <FOLDER#2>`.
   This command can be run from any working directory, with `<FOLDER>` relative to current working directory.

   Example: `node comparison.js --port 3154 prediction gold`
   
1. Browse `<SERVER ADDRESS>:<PORT>`. All files named according to 1. will be shown under the first drop-down list. Multiple files and view types can be chosen to display vertically in order.

   Example: `localhost:3154`

Usage for visualizing a single version of annotations:

Same as for multiple versions, but specify a single directory.

## Adding a new annotation type
If the name is not already in the available view list, in apelles/public/comparison.html edit the selectpicker element
`<select class="selectpicker col-xs-12" id="view-selector" data-actions-box="true" multiple>`
by adding a new option:
`<option value="MENU_VERSION_OF_YOUR_VIEW_NAME" selected>YOUR_VIEW_NAME</option>`