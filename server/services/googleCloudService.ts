import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { Storage } from '@google-cloud/storage';

export interface GoogleCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink: string;
}

export interface CloudStorageFile {
  name: string;
  bucket: string;
  size: number;
  updated: Date;
  contentType: string;
  publicUrl?: string;
}

export class GoogleCloudService {
  private auth: GoogleAuth;
  private storage: Storage;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/devstorage.full_control'
      ]
    });
    
    this.storage = new Storage({
      authClient: this.auth
    });
  }

  // Drive API methods
  async authenticateUser(authCode: string): Promise<GoogleCredentials> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(authCode);
    oauth2Client.setCredentials(tokens);

    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiresAt: new Date(tokens.expiry_date!),
      scopes: tokens.scope?.split(' ') || []
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<GoogleCredentials> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token || refreshToken,
      expiresAt: new Date(credentials.expiry_date!),
      scopes: credentials.scope?.split(' ') || []
    };
  }

  async listDriveFiles(accessToken: string, folderId?: string): Promise<DriveFile[]> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const query = folderId 
      ? `'${folderId}' in parents and trashed = false`
      : "trashed = false";

    const response = await drive.files.list({
      q: query,
      fields: 'files(id,name,mimeType,size,modifiedTime,parents,webViewLink)',
      orderBy: 'modifiedTime desc'
    });

    return response.data.files?.map(file => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      size: file.size,
      modifiedTime: file.modifiedTime!,
      parents: file.parents,
      webViewLink: file.webViewLink!
    })) || [];
  }

  async createDriveFolder(accessToken: string, name: string, parentId?: string): Promise<string> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      }
    });

    return response.data.id!;
  }

  async uploadToDrive(
    accessToken: string, 
    fileName: string, 
    content: Buffer, 
    parentId?: string
  ): Promise<string> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: parentId ? [parentId] : undefined
      },
      media: {
        mimeType: 'application/octet-stream',
        body: content
      }
    });

    return response.data.id!;
  }

  // Cloud Storage methods
  async listStorageFiles(bucketName: string, prefix?: string): Promise<CloudStorageFile[]> {
    const bucket = this.storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix });

    return files.map(file => ({
      name: file.name,
      bucket: bucketName,
      size: parseInt(file.metadata.size || '0'),
      updated: new Date(file.metadata.updated),
      contentType: file.metadata.contentType || 'application/octet-stream',
      publicUrl: file.publicUrl()
    }));
  }

  async uploadToStorage(
    bucketName: string, 
    fileName: string, 
    content: Buffer,
    isPublic: boolean = false
  ): Promise<string> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.save(content, {
      metadata: {
        contentType: 'application/octet-stream'
      },
      public: isPublic
    });

    return isPublic ? file.publicUrl() : `gs://${bucketName}/${fileName}`;
  }

  async downloadFromStorage(bucketName: string, fileName: string): Promise<Buffer> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(fileName);
    
    const [contents] = await file.download();
    return contents;
  }

  async createStorageBucket(bucketName: string, location: string = 'US'): Promise<void> {
    await this.storage.createBucket(bucketName, {
      location,
      storageClass: 'STANDARD'
    });
  }

  // Permission and access control methods
  async setDrivePermissions(
    accessToken: string, 
    fileId: string, 
    permissions: { type: 'user' | 'domain' | 'anyone', role: 'reader' | 'writer' | 'owner', emailAddress?: string }[]
  ): Promise<void> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    for (const permission of permissions) {
      await drive.permissions.create({
        fileId,
        requestBody: permission
      });
    }
  }

  async getDrivePermissions(accessToken: string, fileId: string): Promise<any[]> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.permissions.list({
      fileId,
      fields: 'permissions(id,type,role,emailAddress)'
    });

    return response.data.permissions || [];
  }

  // Repository sync methods
  async syncRepositoryToDrive(
    accessToken: string,
    repositoryId: string,
    localFiles: { path: string; content: Buffer; type: string }[],
    driveFolderId: string
  ): Promise<{ fileId: string; path: string }[]> {
    const uploadedFiles: { fileId: string; path: string }[] = [];

    for (const file of localFiles) {
      const fileId = await this.uploadToDrive(
        accessToken,
        file.path,
        file.content,
        driveFolderId
      );

      uploadedFiles.push({ fileId, path: file.path });
    }

    return uploadedFiles;
  }

  async syncRepositoryToStorage(
    repositoryId: string,
    bucketName: string,
    localFiles: { path: string; content: Buffer; type: string }[]
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of localFiles) {
      const url = await this.uploadToStorage(
        bucketName,
        `repositories/${repositoryId}/${file.path}`,
        file.content,
        true // Make public for repository access
      );

      uploadedUrls.push(url);
    }

    return uploadedUrls;
  }
}

export const googleCloudService = new GoogleCloudService();