# used for linux & mac
node_version=$(node -v)
echo "Your node version: $node_version"
echo "Installing package..."
cd frontend
npm install --force
echo "Building front end..."
npm run build > /tmp/tmp.log
echo "Starting solar offset project..."
cp -r dist ../backend
cd ../backend
npm install
NODE_ENV=production npm start

