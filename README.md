# Note To Excel Fullstack App

He thong ghi chu web voi dong bo Excel tuc thi sau moi thay doi du lieu.

## 1) Tong quan

Muc tieu duoc trien khai:
- Nguoi dung tao note tren web (content, url, annotation optional)
- Group theo normalizedKey (khong phan biet dau, hoa-thuong, khoang trang, ky tu ngan cach)
- Moi group map 1 sheet trong 1 file Excel duy nhat
- Sau POST/PATCH/DELETE note va PATCH group, backend sync file Excel ngay
- MongoDB la source of truth, Excel la file mirror du lieu moi nhat

## 2) Cau truc thu muc

- backend/
	- src/
		- config/
		- controllers/
		- middlewares/
		- models/
		- routes/
		- services/
			- excel/
		- utils/
			- normalize/
			- sort/
			- excel/
		- tests/
		- seed/
		- app.js
		- server.js
	- storage/data/
	- package.json
- frontend/
	- src/
		- components/
		- pages/
		- services/
		- App.jsx
		- main.jsx
		- styles.css
	- package.json
- .env.example
- package.json

## 3) Database schema (Mongoose)

Collection groups:
- _id
- displayName
- normalizedKey (unique index)
- sheetName
- createdAt
- updatedAt

Collection notes:
- _id
- groupId (index)
- originalContent
- normalizedKeySnapshot (index)
- url
- annotation (optional)
- createdAt
- updatedAt

## 4) Quy tac normalize

normalizeContent(content):
- Unicode normalize NFKC
- lower-case theo locale vi
- normalize NFD + bo combining marks
- doi d -> d
- doi _ . - va cac dau ngan cach thanh space
- bo ky tu dac biet khong can thiet
- collapse multiple spaces + trim

Vi du:
- phan ga -> phan ga
- PhAn_ga -> phan ga
- PHAN-GA -> phan ga

## 5) Quy tac sort note trong sheet

sortNotesForSheet(notes):
- Note co annotation dung truoc note khong annotation
- Neu ca 2 deu co annotation: sort annotation tang dan, locale vi, case-insensitive
- Neu annotation bang nhau: tie-break theo createdAt tang dan
- Neu ca 2 khong co annotation: createdAt tang dan

Lua chon createdAt tang dan de dam bao thu tu thoi gian on dinh, de truy vet lich su.

## 6) Quy tac ten sheet

makeSafeSheetName(name):
- Loai ky tu cam: \\ / ? * [ ]
- Trim va collapse spaces
- Gioi han 31 ky tu
- Neu trung ten sau format: them suffix (2), (3)...

## 7) Kien truc dong bo Excel

- MongoDB la source of truth
- ExcelSyncService dung queue promise chain de serialize ghi file
- Moi mutation goi enqueueSync ngay sau khi DB commit
- WorkbookService rebuild toan bo workbook tu DB roi ghi de an toan
- Ghi file theo temp file -> replace file chinh de giam nguy co corruption
- Neu sync fail: retry inline 1 lan, neu tiep tuc fail thi status pending va tu dong schedule retry nen

File chinh:
- backend/storage/data/notes.xlsx

## 8) API

- POST /api/notes
- GET /api/groups
- GET /api/groups/:id
- GET /api/groups/:id/notes
- PATCH /api/groups/:id
- PATCH /api/notes/:id
- DELETE /api/notes/:id
- GET /api/excel/download

POST /api/notes response:
- success
- note
- group
- excelSyncStatus: success | pending
- message

## 9) Huong dan chay local

Yeu cau:
- Node.js 18+
- MongoDB local

Cai dat:
1. npm install
2. Copy .env.example thanh .env va cap nhat neu can
3. Chay backend + frontend:
	 - npm run dev

URL mac dinh:
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

Seed data:
- npm run seed --workspace backend

Test backend:
- npm test --workspace backend

Build frontend:
- npm run build --workspace frontend

## 10) Hanh vi update/delete

Update note:
- Neu originalContent doi -> normalizedKey moi
- Tu dong chuyen sang group phu hop
- Sync Excel ngay sau update

Delete note:
- Xoa note trong DB
- Sync Excel ngay
- Neu group khong con note: xoa group va workbook rebuild se khong con sheet do

Rename group:
- Patch displayName group
- Sheet name duoc cap nhat lai an toan trong qua trinh workbook rebuild

## 11) Test da bao phu

- normalize logic
- sort logic
- safe sheet name logic
- group matching logic
- excel sync retry + queue serialization
- concurrent create note cung normalizedKey

## 12) Ghi chu production

- Hien tai pending sync la in-memory retry, don gian va de van hanh
- Neu can manh hon cho production, co the them outbox collection de luu sync jobs persistent
- Khi scale nhieu instance backend, can distributed lock (Redis lock / queue worker) de dam bao mot writer cho file Excel

## 13) Deploy Heroku

Da chuan bi san cho Heroku:
- Procfile: web: npm run start
- Root script: heroku-postbuild build frontend
- Backend se phuc vu frontend static tu frontend/dist

Lenh deploy:
1. heroku login
2. heroku create <ten-app>
3. heroku config:set MONGODB_URI="mongodb+srv://ai-tree:lJZ3CqKUX74X1Dep@ai-tree.urphxgk.mongodb.net/note_to_excel?appName=ai-tree"
4. heroku config:set EXCEL_FILE_PATH="./storage/data/notes.xlsx"
5. heroku config:set CORS_ORIGIN="https://<ten-app>.herokuapp.com"
6. git push heroku main

Ghi chu:
- Heroku filesystem la ephemereal, file Excel co the mat sau restart dyno.
- Da bo sung luu Excel len Google Drive de ben vung va khong phu thuoc filesystem local.

## 14) Cau hinh Google Drive

He thong sync Excel theo thu tu:
1. Rebuild workbook tu MongoDB
2. Ghi file local tam
3. Upload/overwrite file notes.xlsx tren Google Drive

Can thiet lap:
1. Tao Google Cloud Service Account va bat Google Drive API
2. Tao 1 folder tren Google Drive de chua file Excel
3. Share folder do cho service account email (quyen Editor)
4. Set env vars:
	- DRIVE_SYNC_ENABLED=true
	- GOOGLE_DRIVE_FOLDER_ID=<folder_id>
	- GOOGLE_DRIVE_FILE_NAME=notes.xlsx
	- GOOGLE_SERVICE_ACCOUNT_EMAIL=<service_account_email>
	- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<private_key_1_line, dung \\n cho xuong dong>

Neu file da ton tai san tren Drive, co the set them:
- GOOGLE_DRIVE_FILE_ID=<file_id>

Tren Heroku, cap nhat config vars:
- heroku config:set DRIVE_SYNC_ENABLED=true
- heroku config:set GOOGLE_DRIVE_FOLDER_ID=<folder_id>
- heroku config:set GOOGLE_DRIVE_FILE_NAME=notes.xlsx
- heroku config:set GOOGLE_SERVICE_ACCOUNT_EMAIL=<service_account_email>
- heroku config:set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="<private_key_escaped>"