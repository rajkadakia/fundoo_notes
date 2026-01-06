import Note from '../models/note.model.js';
import { redisClient } from '../config/redis.config.js';

const CACHE_EXPIRY = 3600;
const NOTES_LIMIT = 20;

const getCacheKey = (userId, filter = 'all') => `notes:${userId}:${filter}`;

export const createNoteService = async (noteData) => {
  const note = await Note.create(noteData);
  await invalidateUserCache(noteData.userId);
  return note;
};

export const getAllNotesService = async (userId, page = 1, limit = NOTES_LIMIT) => {
  const cacheKey = getCacheKey(userId, 'all');
  
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Redis get error:', error);
  }

  const skip = (page - 1) * limit;
  const notes = await Note.find({ userId, isTrash: false })
    .populate('labels')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  try {
    await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(notes));
  } catch (error) {
    console.error('Redis set error:', error);
  }

  return notes;
};

export const getArchivedNotesService = async (userId, page = 1, limit = NOTES_LIMIT) => {
  const cacheKey = getCacheKey(userId, 'archived');
  
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Redis get error:', error);
  }

  const skip = (page - 1) * limit;
  const notes = await Note.find({ userId, isArchived: true, isTrash: false })
    .populate('labels')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  try {
    await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(notes));
  } catch (error) {
    console.error('Redis set error:', error);
  }

  return notes;
};

export const getTrashedNotesService = async (userId, page = 1, limit = NOTES_LIMIT) => {
  const cacheKey = getCacheKey(userId, 'trash');
  
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Redis get error:', error);
  }

  const skip = (page - 1) * limit;
  const notes = await Note.find({ userId, isTrash: true })
    .populate('labels')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  try {
    await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(notes));
  } catch (error) {
    console.error('Redis set error:', error);
  }

  return notes;
};

export const getNotesByLabelService = async (userId, labelId, page = 1, limit = NOTES_LIMIT) => {
  const cacheKey = getCacheKey(userId, `label:${labelId}`);
  
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error('Redis get error:', error);
  }

  const skip = (page - 1) * limit;
  const notes = await Note.find({ userId, labels: labelId, isTrash: false })
    .populate('labels')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  try {
    await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(notes));
  } catch (error) {
    console.error('Redis set error:', error);
  }

  return notes;
};

export const getNoteByIdService = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, userId }).populate('labels');
  return note;
};

export const updateNoteService = async (noteId, userId, updateData) => {
  const note = await Note.findOne({ _id: noteId, userId });
  
  if (!note) {
    return null;
  }

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      note[key] = updateData[key];
    }
  });

  // Smart Color Logic (Color -> State)
  if (updateData.color) {
      const color = updateData.color.toLowerCase();
      if (color === '#fffde7') { // Material Yellow 50 -> Archive
          note.isArchived = true;
          note.isTrash = false;
      }
      if (color === '#5f6368') { // Grey 700 -> Trash
          note.isTrash = true;
          note.isArchived = false;
      }
  }

  // Smart State Logic (State -> Color)
  if (updateData.isTrash === true) {
      note.color = '#5f6368'; // Grey
  }
  
  if (updateData.isArchived === true) {
      note.color = '#fffde7'; // Yellow
  }

  if (updateData.isArchived === false) {
      note.color = '#ffffff'; // Unarchive -> Default
  }

  if (updateData.isTrash === false) {
      // Restore -> Default (White)
      note.color = '#ffffff'; 
  }

  const updatedNote = await note.save();
  await invalidateUserCache(userId);
  
  return updatedNote;
};

export const deleteNoteService = async (noteId, userId) => {
  const note = await Note.findOneAndDelete({ _id: noteId, userId });
  
  if (note) {
    await invalidateUserCache(userId);
  }
  
  return note;
};

export const togglePinNoteService = async (noteId, userId) => {
  const note = await Note.findOne({ _id: noteId, userId });
  
  if (!note) {
    return null;
  }

  note.isPinned = !note.isPinned;
  const updatedNote = await note.save();
  await invalidateUserCache(userId);
  
  return updatedNote;
};

const invalidateUserCache = async (userId) => {
  try {
    const patterns = [
      getCacheKey(userId, 'all'),
      getCacheKey(userId, 'archived'),
      getCacheKey(userId, 'trash'),
      `notes:${userId}:label:*`
    ];

    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        await redisClient.del(pattern);
      }
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
