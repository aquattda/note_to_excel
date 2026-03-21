const fs = require('fs');
const { google } = require('googleapis');

class DriveSyncService {
  constructor(options) {
    this.enabled = Boolean(options.enabled);
    this.driveFolderId = options.driveFolderId || '';
    this.driveFileName = options.driveFileName || 'notes.xlsx';
    this.driveFileId = options.driveFileId || '';

    if (!this.enabled) {
      this.driveClient = null;
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: options.serviceAccountEmail,
        private_key: options.serviceAccountPrivateKey
      },
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    this.driveClient = google.drive({ version: 'v3', auth });
  }

  async resolveDriveFileId() {
    if (!this.enabled) {
      return null;
    }

    if (this.driveFileId) {
      return this.driveFileId;
    }

    const queryParts = [
      `name = '${this.driveFileName.replace(/'/g, "\\'")}'`,
      'mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"',
      'trashed = false'
    ];

    if (this.driveFolderId) {
      queryParts.push(`'${this.driveFolderId}' in parents`);
    }

    const response = await this.driveClient.files.list({
      q: queryParts.join(' and '),
      pageSize: 1,
      fields: 'files(id, name)'
    });

    const file = response.data.files && response.data.files[0];
    if (!file) {
      return null;
    }

    this.driveFileId = file.id;
    return this.driveFileId;
  }

  async uploadWorkbook(localFilePath) {
    if (!this.enabled) {
      return {
        status: 'disabled',
        message: 'Google Drive sync is disabled'
      };
    }

    const existingFileId = await this.resolveDriveFileId();
    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: fs.createReadStream(localFilePath)
    };

    if (existingFileId) {
      const updated = await this.driveClient.files.update({
        fileId: existingFileId,
        media,
        fields: 'id, name, webViewLink, webContentLink'
      });

      return {
        status: 'success',
        fileId: updated.data.id,
        fileName: updated.data.name,
        webViewLink: updated.data.webViewLink,
        webContentLink: updated.data.webContentLink
      };
    }

    const created = await this.driveClient.files.create({
      requestBody: {
        name: this.driveFileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        parents: this.driveFolderId ? [this.driveFolderId] : undefined
      },
      media,
      fields: 'id, name, webViewLink, webContentLink'
    });

    this.driveFileId = created.data.id;
    return {
      status: 'success',
      fileId: created.data.id,
      fileName: created.data.name,
      webViewLink: created.data.webViewLink,
      webContentLink: created.data.webContentLink
    };
  }

  async streamFileToResponse(res) {
    if (!this.enabled) {
      return false;
    }

    const fileId = await this.resolveDriveFileId();
    if (!fileId) {
      return false;
    }

    const metadata = await this.driveClient.files.get({
      fileId,
      fields: 'name'
    });

    const driveResponse = await this.driveClient.files.get(
      {
        fileId,
        alt: 'media'
      },
      {
        responseType: 'stream'
      }
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${metadata.data.name || this.driveFileName}"`
    );

    await new Promise((resolve, reject) => {
      driveResponse.data.on('error', reject);
      driveResponse.data.on('end', resolve);
      driveResponse.data.pipe(res);
    });

    return true;
  }
}

module.exports = { DriveSyncService };