const { v4: uuidv4 } = require('uuid');
const { getBucket } = require('../config/firebase');
const ProjectAsset = require('../models/ProjectAsset');

async function generateSignedUploadUrl(req, res) {
  try {
    const { fileName, contentType, category } = req.body;

    if (!fileName || !contentType || !category) {
      return res.status(400).json({ message: 'fileName, contentType and category are required' });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `assets/${category}/${uuidv4()}-${safeName}`;
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
    const { name, description, category, currentVersion, downloadUrl, firebaseStoragePath, tags, releaseNotes } = req.body;

    if (!name || !description || !category || !downloadUrl || !firebaseStoragePath) {
      return res.status(400).json({ message: 'Missing required asset fields' });
    }

    const version = currentVersion || '1.0.0';

    const asset = await ProjectAsset.create({
      name,
      description,
      category,
      currentVersion: version,
      downloadUrl,
      firebaseStoragePath,
      tags: Array.isArray(tags) ? tags : [],
      changelogs: [
        {
          version,
          releaseDate: new Date(),
          notes: Array.isArray(releaseNotes) ? releaseNotes : ['Initial release'],
          fileUrl: downloadUrl,
        },
      ],
    });

    return res.status(201).json(asset);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create asset', error: error.message });
  }
}

async function listAssets(req, res) {
  try {
    const { category, search } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const assets = await ProjectAsset.find(query).sort({ createdAt: -1 }).lean();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list assets', error: error.message });
  }
}

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

async function getAssetBySlug(req, res) {
  try {
    const asset = await ProjectAsset.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    return res.status(200).json(asset);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load asset', error: error.message });
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

    return res.status(200).json({ downloadUrl: asset.downloadUrl, downloadCount: asset.downloadCount });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process download', error: error.message });
  }
}

async function addChangelogEntry(req, res) {
  try {
    const { id } = req.params;
    const { version, notes, fileUrl, makeCurrentVersion } = req.body;

    if (!version || !fileUrl) {
      return res.status(400).json({ message: 'version and fileUrl are required' });
    }

    const asset = await ProjectAsset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    asset.changelogs.unshift({
      version,
      releaseDate: new Date(),
      notes: Array.isArray(notes) ? notes : [],
      fileUrl,
    });

    if (makeCurrentVersion !== false) {
      asset.currentVersion = version;
      asset.downloadUrl = fileUrl;
    }

    await asset.save();
    return res.status(201).json(asset);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add changelog entry', error: error.message });
  }
}

async function downloadChangelogVersion(req, res) {
  try {
    const { id, changelogId } = req.params;
    const asset = await ProjectAsset.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const entry = asset.changelogs.id(changelogId);
    if (!entry) {
      return res.status(404).json({ message: 'Changelog entry not found' });
    }

    return res.status(200).json({ downloadUrl: entry.fileUrl });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process download', error: error.message });
  }
}

module.exports = {
  generateSignedUploadUrl,
  createAsset,
  listAssets,
  getAssetById,
  getAssetBySlug,
  listAssetsAdmin,
  updateAsset,
  deleteAsset,
  downloadAsset,
  addChangelogEntry,
  downloadChangelogVersion,
};
