import Label from '../models/label.model.js';
import Note from '../models/note.model.js';

export const createLabel = async (req, res) => {
  // ... existing code ...
  try {
    const { name } = req.body;
    const label = await Label.create({
      name,
      userId: req.user._id
    });
    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLabels = async (req, res) => {
    // ... existing code ...
  try {
    const labels = await Label.find({ userId: req.user._id });
    res.json(labels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLabelById = async (req, res) => {
    // ... existing code ...
  try {
    const label = await Label.findOne({ _id: req.params.id, userId: req.user._id });
    if (label) {
      res.json(label);
    } else {
      res.status(404).json({ message: 'Label not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLabel = async (req, res) => {
    // ... existing code ...
  try {
    const label = await Label.findOne({ _id: req.params.id, userId: req.user._id });

    if (label) {
      label.name = req.body.name || label.name;
      const updatedLabel = await label.save();
      res.json(updatedLabel);
    } else {
      res.status(404).json({ message: 'Label not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLabel = async (req, res) => {
  try {
    const labelId = req.params.id;
    const userId = req.user._id;

    const label = await Label.findOneAndDelete({ _id: labelId, userId });
    
    if (label) {
      // Remove label reference from all notes
      await Note.updateMany(
        { userId, labels: labelId },
        { $pull: { labels: labelId } }
      );
      
      res.json({ message: 'Label removed and references cleaned' });
    } else {
      res.status(404).json({ message: 'Label not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
