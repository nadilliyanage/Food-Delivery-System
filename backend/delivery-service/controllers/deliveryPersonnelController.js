const DeliveryPersonnel = require("../models/DeliveryPersonnel");
const axios = require("axios");
require("dotenv").config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

// Register as delivery personnel
const registerDeliveryPersonnel = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Validate required fields
    const { vehicleType, vehicleNumber, licenseNumber } = req.body;
    if (!vehicleType || !vehicleNumber || !licenseNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['vehicleType', 'vehicleNumber', 'licenseNumber']
      });
    }

    // Verify user exists
    try {
      const userResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/${userId}`, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });
      
      if (!userResponse.data) {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error verifying user:', error.response?.data || error.message);
      return res.status(500).json({ 
        message: 'Error verifying user',
        error: error.response?.data?.message || error.message
      });
    }

    // Check if user has a pending registration
    const existingRegistration = await DeliveryPersonnel.findOne({ 
      user: userId,
      registrationStatus: 'pending'
    });
    
    if (existingRegistration) {
      return res.status(400).json({ message: 'You already have a pending registration' });
    }

    // Create new registration
    const registration = new DeliveryPersonnel({
      vehicleType,
      vehicleNumber,
      licenseNumber,
      user: userId,
      registrationStatus: 'pending'
    });

    await registration.save();
    
    res.status(201).json({ 
      message: 'Registration submitted successfully', 
      registration 
    });
  } catch (error) {
    console.error('Error in registration:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: 'Error processing registration', 
      error: error.message
    });
  }
};

// Get pending registrations (admin only)
const getPendingRegistrations = async (req, res) => {
  try {
    const pendingRegistrations = await DeliveryPersonnel.find({ registrationStatus: 'pending' })
      .populate('user', 'name email phone');
    res.json(pendingRegistrations);
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    res.status(500).json({ message: 'Error fetching pending registrations' });
  }
};

// Get approved registrations (admin only)
const getApprovedRegistrations = async (req, res) => {
  try {
    const approvedRegistrations = await DeliveryPersonnel.find({ registrationStatus: 'approved' })
      .populate('user', 'name email phone');
    res.json(approvedRegistrations);
  } catch (error) {
    console.error('Error fetching approved registrations:', error);
    res.status(500).json({ message: 'Error fetching approved registrations' });
  }
};

// Get rejected registrations (admin only)
const getRejectedRegistrations = async (req, res) => {
  try {
    const rejectedRegistrations = await DeliveryPersonnel.find({ registrationStatus: 'rejected' })
      .populate('user', 'name email phone');
    res.json(rejectedRegistrations);
  } catch (error) {
    console.error('Error fetching rejected registrations:', error);
    res.status(500).json({ message: 'Error fetching rejected registrations' });
  }
};

// Update registration status (admin only)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId, status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const registration = await DeliveryPersonnel.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.registrationStatus = status;
    await registration.save();

    // If approved, update user role to delivery_personnel
    if (status === 'approved') {
      try {
        await axios.put(`${AUTH_SERVICE_URL}/api/auth/users/${registration.user}`, 
          { role: 'delivery_personnel' },
          {
            headers: {
              'Authorization': req.headers.authorization
            }
          }
        );
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    }

    // If rejected or moving back to pending, check for other approved registrations before changing role
    if (status === 'rejected' || status === 'pending') {
      try {
        const otherApprovedRegistrations = await DeliveryPersonnel.find({
          user: registration.user,
          _id: { $ne: registration._id },
          registrationStatus: 'approved'
        });

        if (otherApprovedRegistrations.length === 0) {
          await axios.put(`${AUTH_SERVICE_URL}/api/auth/users/${registration.user}`, 
            { role: 'customer' },
            {
              headers: {
                'Authorization': req.headers.authorization
              }
            }
          );
        }
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    }

    res.json({ message: 'Registration status updated successfully', registration });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ message: 'Error updating registration status' });
  }
};

module.exports = {
  registerDeliveryPersonnel,
  getPendingRegistrations,
  getApprovedRegistrations,
  getRejectedRegistrations,
  updateRegistrationStatus
}; 