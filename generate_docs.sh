clear

echo 'Removing old duckumentation...'
rm -rf docs

echo 'Hatching new duckumentation...'
jsduck LintRoller.js --output docs --title 'LintRoller API Docs'