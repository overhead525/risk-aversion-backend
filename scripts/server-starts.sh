# Test the core server
npm run server
PID=$!
sleep 7
kill $PID
