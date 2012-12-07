clear

echo 'Removing old duckumentation...'
rm -rf docs

echo 'Hatching new duckumentation...'
jsduck PhantomLint.js --output docs --title 'PhantomLint API Docs'