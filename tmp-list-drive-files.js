const fs = require('fs');
const { google } = require('googleapis');

(async () => {
  const sa = JSON.parse(fs.readFileSync('note-to-excel-7333ce8d7055.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  const drive = google.drive({ version: 'v3', auth });
  const folderId = '1jfur-CSkDL4fsugHWp2LI-YtzSpPlT5J';
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,owners(emailAddress))',
    pageSize: 50,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true
  });
  console.log(JSON.stringify(res.data.files || [], null, 2));
})();
