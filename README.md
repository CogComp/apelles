# Apelles

This is a visualization library designed around cogcomp's NLP datastructures.

## Getting started

Requirements: NodeJS, NPM should be installed.

To install dependencies:
`npm install` in the root directory to install required NodeJS modules.

To start the dev server:
`node server.js`

## Local comparison tool

`comparison.js` provides a tool for comparing two annotation versions of the same text.

Usage:

1. Create two folders of annotation JSON files with identical file names.

   Example: `prediction/sample.json` and `gold/sample.json`

1. Start server with `node comparison.js --port <PORT> <FOLDER#1> <FOLDER#2>`.
   This command can be run from any working directory, with `<FOLDER>` relative to current working directory.

   Example: `node comparison.js --port 3154 prediction gold`
