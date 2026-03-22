const fs = require('fs');
const { google } = require('googleapis');

(async () => {
  const sa = JSON.parse(fs.readFileSync('note-to-excel-7333ce8d7055.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({ credentials: sa, scopes: ['https://www.googleapis.com/auth/drive'] });
  const drive = google.drive({ version: 'v3', auth });
  const fileId = '1ddeG-UAl0VZzuaVtKbzcHc3HeakeRIyZQUsfU-BgCrM';
  try {
    const r = await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: fs.createReadStream('tmp-notes.xlsx')
      },
      fields: 'id,name,mimeType'
    });
    console.log(JSON.stringify(r.data, null, 2));
  } catch (e) {
    console.error(e.message);
    if (e.response && e.response.data) {
      console.error(JSON.stringify(e.response.data, null, 2));
    }
    process.exit(1);
  }
})();
