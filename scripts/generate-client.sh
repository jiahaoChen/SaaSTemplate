#! /usr/bin/env bash

set -e
set -x

cd backend
python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../oneapi.json
cd ..
mv oneapi.json frontend/config/
cd frontend
npm run openapi
