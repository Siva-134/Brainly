const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/auth');
const Project = require('../models/project');

// Create a new project
router.post('/add-project', userAuth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Project name is required" });
        }

        const newProject = new Project({
            name,
            userId: req.user._id
        });

        await newProject.save();

        res.status(201).json({
            message: "Project created successfully",
            data: newProject
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating project", error: error.message });
    }
});

// Get all projects for the user
router.get('/my-projects', userAuth, async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Projects fetched successfully",
            data: projects
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects", error: error.message });
    }
});

// Delete a project
router.delete('/delete-project/:projectId', userAuth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findOneAndDelete({ 
            _id: projectId, 
            userId: req.user._id 
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found or not authorized" });
        }

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting project", error: error.message });
    }
});

module.exports = router;
