const { v4: uuidv4 } = require('uuid');
const ProjectAsset = require('../models/ProjectAsset');
const LicenseKey = require('../models/LicenseKey');
const { uploadFileToGithub, deleteFileFromGithub } = require('../services/githubStorageService');

function buildStoragePath(category, originalName) {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `assets/${category}/${uuidv4()}-${safeName}`;
}

async function createAsset(req, res) {
  try {
    const { name, description, category, currentVersion, tags, releaseNotes } = req.body;

    if (!name || !description || !category || !req.file) {
      return res.status(400).json({ message: 'name, description, category and a file are required' });
    }

    const version = currentVersion || '1.0.0';
    const storagePath = buildStoragePath(category, req.file.originalname);

    const uploaded = await uploadFileToGithub(
      storagePath,
      req.file.buffer,
      `Add ${name} v${version}`
    );

    const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : Array.isArray(tags) ? tags : [];
    const parsedNotes =
      typeof releaseNotes === 'string' ? JSON.parse(releaseNotes) : Array.isArray(releaseNotes) ? releaseNotes : ['Initial release'];

    const asset = await ProjectAsset.create({
      name,
      description,
      category,
      currentVersion: version,
      downloadUrl: uploaded.downloadUrl,
      storagePath: uploaded.storagePath,
      tags: parsedTags,
      changelogs: [
        {
          version,
          releaseDate: new Date(),
          notes: parsedNotes,
          fileUrl: uploaded.downloadUrl,
          storagePath: uploaded.storagePath,
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

    await deleteFileFromGithub(asset.storagePath).catch(() => null);
    await asset.deleteOne();

    return res.status(200).json({ message: 'Asset deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete asset', error: error.message });
  }
}

async function downloadAsset(req, res) {
  try {
    const { id } = req.params;
    const { licenseKey } = req.body || {};

    const existing = await ProjectAsset.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (existing.isPremium) {
      if (!licenseKey) {
        return res.status(402).json({ message: 'This asset requires a valid license key to download' });
      }

      const license = await LicenseKey.findOne({ key: licenseKey.trim().toUpperCase(), asset: existing._id });
      if (!license || license.status !== 'active' || license.isExpired()) {
        return res.status(403).json({ message: 'Invalid, revoked, or expired license key' });
      }
    }

    const asset = await ProjectAsset.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    return res.status(200).json({ downloadUrl: asset.downloadUrl, downloadCount: asset.downloadCount });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process download', error: error.message });
  }
}

async function addChangelogEntry(req, res) {
  try {
    const { id } = req.params;
    const { version, notes, makeCurrentVersion } = req.body;

    if (!version || !req.file) {
      return res.status(400).json({ message: 'version and a file are required' });
    }

    const asset = await ProjectAsset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const storagePath = buildStoragePath(asset.category, req.file.originalname);
    const uploaded = await uploadFileToGithub(storagePath, req.file.buffer, `Add ${asset.name} v${version}`);

    const parsedNotes = typeof notes === 'string' ? JSON.parse(notes) : Array.isArray(notes) ? notes : [];

    asset.changelogs.unshift({
      version,
      releaseDate: new Date(),
      notes: parsedNotes,
      fileUrl: uploaded.downloadUrl,
      storagePath: uploaded.storagePath,
    });

    if (makeCurrentVersion !== 'false') {
      asset.currentVersion = version;
      asset.downloadUrl = uploaded.downloadUrl;
      asset.storagePath = uploaded.storagePath;
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
