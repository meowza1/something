#!/bin/bash

# Extract unique URLs from the downloaded file
URLS=$(grep -o 'https://[^"]*' /home/runner/workspace/juju/message.txt | sort -u)

echo "Checking $URL_COUNT URLs for 404s..."
echo ""

# Counter for tracking
COUNT=0
FOUND_404=0

for url in $URLS; do
    COUNT=$((COUNT + 1))
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$STATUS" = "404" ]; then
        echo "404 NOT FOUND: $url"
        FOUND_404=$((FOUND_404 + 1))
    elif [ "$STATUS" != "200" ] && [ "$STATUS" != "301" ] && [ "$STATUS" != "302" ]; then
        echo "STATUS $STATUS: $url"
    fi
done

echo ""
echo "Check complete. Checked $COUNT URLs."
if [ $FOUND_404 -eq 0 ]; then
    echo "No 404 errors found."
else
    echo "Found $FOUND_404 URLs returning 404."
fi