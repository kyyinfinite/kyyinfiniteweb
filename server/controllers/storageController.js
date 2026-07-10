const { v4: uuidv4 } = require('uuid');
const { getBucket } = require('../config/firebase');
const ProjectAsset = require('../models/ProjectAsset');

/**
 * GET /api/assets/:id
 * Returns the full asset document including the embedded `changelogs` array.
 */
async function getAssetById(req, res) {
  try {
    const asset = await ProjectAsset.findById(req.params.id).lean();
    if (!asset || !asset.isPublished) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    return res.status(200).json(asset);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load asset', error: error.message });
  }
}

/**
 * POST /api/assets/upload-url
 * Generate a Firebase-signed upload URL for a new asset file.
 */
async function generateSignedUploadUrl(req, res) {
  try {
    const { fileName, contentType, assetType, category } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({ message: 'fileName and contentType are required' });
    }

    const typeKey = category || assetType || 'misc';
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `assets/${typeKey}/${uuidv4()}-${safeName}`;
    const bucket = getBucket();
    const file = bucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    return res.status(200).json({
      signedUrl,
      storagePath,
      publicUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate signed upload URL', error: error.message });
  }
}

/**
 * POST /api/assets
 * Create a new marketplace asset. Accepts both the new blueprint fields
 * (name, category, currentVersion, downloadUrl, changelogs) and the legacy
 * fields (title, assetType, version, firebaseCdnUrl) for backwards compatibility.
 */
async function createAsset(req, res) {
  try {
    const {
      name,
      title,
      description,
      category,
      assetType,
      currentVersion,
      version,
      downloadUrl,
      firebaseCdnUrl,
      firebaseStoragePath,
      tags,
      changelogs,
    } = req.body;

    if (!name && !title) {
      return res.status(400).json({ message: 'name (or title) is required' });
    }
    if (!category && !assetType) {
      return res.status(400).json({ message: 'category (or assetType) is required' });
    }

    const asset = await ProjectAsset.create({
      name: name || title,
      title: title || name,
      description,
      category,
      assetType,
      currentVersion: currentVersion || version || '1.0.0',
      version: version || currentVersion || '1.0.0',
      downloadUrl: downloadUrl || firebaseCdnUrl || '',
      firebaseCdnUrl: firebaseCdnUrl || downloadUrl || '',
      firebaseStoragePath: firebaseStoragePath || '',
      tags: Array.isArray(tags) ? tags : [],
      changelogs: Array.isArray(changelogs) ? changelogs : [],
    });

    return res.status(201).json(asset);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create asset', error: error.message });
  }
}

/**
 * GET /api/assets
 * Public list endpoint. Supports filtering by the new `category` query param
 * (whatsapp-bot | snippet | plugin) and falls back to the legacy `assetType`
 * filter for older clients. Also supports `search` (text) and `category` from
 * the Landing page category cards.
 */
async function listAssets(req, res) {
  try {
    const { assetType, category, search } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    else if (assetType) query.assetType = assetType;

    if (search) query.$text = { $search: search };

    const assets = await ProjectAsset.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list assets', error: error.message });
  }
}

/**
 * GET /api/assets/admin/all
 * Admin-only list of every asset (including unpublished).
 */
async function listAssetsAdmin(req, res) {
  try {
    const assets = await ProjectAsset.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list assets', error: error.message });
  }
}

/**
 * PUT /api/assets/:id
 * Update an asset. Accepts the new blueprint fields and keeps legacy fields
 * in sync via the schema's pre-validate hook. Also supports pushing a new
 * changelog entry via `{ pushChangelog: { version, notes, fileUrl, releaseDate } }`.
 */
async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const { pushChangelog, ...updates } = req.body;

    const asset = await ProjectAsset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Apply scalar updates
    Object.keys(updates).forEach((key) => {
      asset.set(key, updates[key]);
    });

    // Optionally push a new changelog entry (release a new version)
    if (pushChangelog && pushChangelog.version) {
      asset.changelogs.unshift({
        version: pushChangelog.version,
        releaseDate: pushChangelog.releaseDate || Date.now(),
        notes: Array.isArray(pushChangelog.notes) ? pushChangelog.notes : [],
        fileUrl: pushChangelog.fileUrl || '',
      });
      asset.currentVersion = pushChangelog.version;
      asset.version = pushChangelog.version;
      if (pushChangelog.fileUrl) {
        asset.downloadUrl = pushChangelog.fileUrl;
        asset.firebaseCdnUrl = pushChangelog.fileUrl;
      }
    }

    await asset.save();
    return res.status(200).json(asset.toObject());
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update asset', error: error.message });
  }
}

/**
 * DELETE /api/assets/:id
 */
async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const asset = await ProjectAsset.findById(id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.firebaseStoragePath) {
      try {
        const bucket = getBucket();
        await bucket.file(asset.firebaseStoragePath).delete({ ignoreNotFound: true });
      } catch {
        /* best-effort cleanup */
      }
    }

    await asset.deleteOne();
    return res.status(200).json({ message: 'Asset deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete asset', error: error.message });
  }
}

/**
 * POST /api/assets/:id/download
 * Increments the download counter and returns the canonical download URL
 * for the latest version. Used by the ChangelogsPage hero button.
 */
async function downloadAsset(req, res) {
  try {
    const { id } = req.params;
    const asset = await ProjectAsset.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const latestFileUrl =
      (asset.changelogs && asset.changelogs[0] && asset.changelogs[0].fileUrl) ||
      asset.downloadUrl ||
      asset.firebaseCdnUrl;

    return res.status(200).json({
      downloadUrl: latestFileUrl,
      downloadCount: asset.downloadCount,
      version: asset.currentVersion || asset.version,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process download', error: error.message });
  }
}

/**
 * GET /api/assets/:id/changelogs
 * Returns just the embedded changelog array for the requested asset.
 * Convenient for clients that only need the release timeline.
 */
async function getAssetChangelog(req, res) {
  try {
    const asset = await ProjectAsset.findById(req.params.id).select('changelogs name currentVersion').lean();
    if (!asset || !asset.isPublished) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    const entries = Array.isArray(asset.changelogs)
      ? [...asset.changelogs].sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0))
      : [];
    return res.status(200).json({
      name: asset.name,
      currentVersion: asset.currentVersion,
      changelogs: entries,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load changelog', error: error.message });
  }
}

module.exports = {
  generateSignedUploadUrl,
  createAsset,
  listAssets,
  getAssetById,
  listAssetsAdmin,
  updateAsset,
  deleteAsset,
  downloadAsset,
  getAssetChangelog,
};
