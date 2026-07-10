const { v4: uuidv4 } = require('uuid');
const { getBucket } = require('../config/firebase');
const ProjectAsset = require('../models/ProjectAsset');

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

async function generateSignedUploadUrl(req, res) {
  try {
    const { fileName, contentType, assetType } = req.body;

    if (!fileName || !contentType || !assetType) {
      return res.status(400).json({ message: 'fileName, contentType and assetType are required' });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `assets/${assetType}/${uuidv4()}-${safeName}`;
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

async function createAsset(req, res) {
  try {
    const { title, description, version, assetType, firebaseCdnUrl, firebaseStoragePath, tags } = req.body;

    if (!title || !description || !assetType || !firebaseCdnUrl || !firebaseStoragePath) {
      return res.status(400).json({ message: 'Missing required asset fields' });
    }

    const asset = await ProjectAsset.create({
      title,
      description,
      version,
      assetType,
      firebaseCdnUrl,
      firebaseStoragePath,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json(asset);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create asset', error: error.message });
  }
}

async function listAssets(req, res) {
  try {
    const { assetType, search } = req.query;
    const query = { isPublished: true };

    if (assetType) query.assetType = assetType;
    if (search) query.$text = { $search: search };

    const assets = await ProjectAsset.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list assets', error: error.message });
  }
}

async function listAssetsAdmin(req, res) {
  try {
    const assets = await ProjectAsset.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list assets', error: error.message });
  }
}

async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const asset = await ProjectAsset.findByIdAndUpdate(id, updates, { new: true });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    return res.status(200).json(asset);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update asset', error: error.message });
  }
}

async function deleteAsset(req, res) {
  try {
    const { id } = req.params;
    const asset = await ProjectAsset.findById(id);

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const bucket = getBucket();
    await bucket.file(asset.firebaseStoragePath).delete({ ignoreNotFound: true });
    await asset.deleteOne();

    return res.status(200).json({ message: 'Asset deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete asset', error: error.message });
  }
}

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

    return res.status(200).json({ downloadUrl: asset.firebaseCdnUrl, downloadCount: asset.downloadCount });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process download', error: error.message });
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
};
