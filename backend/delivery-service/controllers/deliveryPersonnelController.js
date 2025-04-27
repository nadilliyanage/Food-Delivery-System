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
        message: "Missing required fields",
        required: ["vehicleType", "vehicleNumber", "licenseNumber"],
      });
    }

    // Verify user exists
    try {
      const userResponse = await axios.get(
        `${AUTH_SERVICE_URL}/api/auth/users/${userId}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      if (!userResponse.data) {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(
        "Error verifying user:",
        error.response?.data || error.message
      );
      return res.status(500).json({
        message: "Error verifying user",
        error: error.response?.data?.message || error.message,
      });
    }

    // Check if user has a pending registration
    const existingRegistration = await DeliveryPersonnel.findOne({
      user: userId,
      registrationStatus: "pending",
    });

    if (existingRegistration) {
      return res
        .status(400)
        .json({ message: "You already have a pending registration" });
    }

    // Create new registration
    const registration = new DeliveryPersonnel({
      vehicleType,
      vehicleNumber,
      licenseNumber,
      user: userId,
      registrationStatus: "pending",
    });

    await registration.save();

    res.status(201).json({
      message: "Registration submitted successfully",
      registration,
    });
  } catch (error) {
    console.error("Error in registration:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      message: "Error processing registration",
      error: error.message,
    });
  }
};

// Get pending registrations (admin only)
const getPendingRegistrations = async (req, res) => {
  try {
    const pendingRegistrations = await DeliveryPersonnel.find({
      registrationStatus: "pending",
    });

    // Fetch user details for each registration
    const registrationsWithUserDetails = await Promise.all(
      pendingRegistrations.map(async (registration) => {
        try {
          const userResponse = await axios.get(
            `${AUTH_SERVICE_URL}/api/auth/users/${registration.user}`,
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );

          return {
            ...registration.toObject(),
            user: userResponse.data,
          };
        } catch (error) {
          console.error(
            `Error fetching user details for registration ${registration._id}:`,
            error
          );
          return {
            ...registration.toObject(),
            user: null,
          };
        }
      })
    );

    res.json(registrationsWithUserDetails);
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res
      .status(500)
      .json({
        message: "Error fetching pending registrations",
        error: error.message,
      });
  }
};

// Get approved registrations (admin only)
const getApprovedRegistrations = async (req, res) => {
  try {
    const approvedRegistrations = await DeliveryPersonnel.find({
      registrationStatus: "approved",
    });

    // Fetch user details for each registration
    const registrationsWithUserDetails = await Promise.all(
      approvedRegistrations.map(async (registration) => {
        try {
          const userResponse = await axios.get(
            `${AUTH_SERVICE_URL}/api/auth/users/${registration.user}`,
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );

          return {
            ...registration.toObject(),
            user: userResponse.data,
          };
        } catch (error) {
          console.error(
            `Error fetching user details for registration ${registration._id}:`,
            error
          );
          return {
            ...registration.toObject(),
            user: null,
          };
        }
      })
    );

    res.json(registrationsWithUserDetails);
  } catch (error) {
    console.error("Error fetching approved registrations:", error);
    res
      .status(500)
      .json({
        message: "Error fetching approved registrations",
        error: error.message,
      });
  }
};

// Get rejected registrations (admin only)
const getRejectedRegistrations = async (req, res) => {
  try {
    const rejectedRegistrations = await DeliveryPersonnel.find({
      registrationStatus: "rejected",
    });

    // Fetch user details for each registration
    const registrationsWithUserDetails = await Promise.all(
      rejectedRegistrations.map(async (registration) => {
        try {
          const userResponse = await axios.get(
            `${AUTH_SERVICE_URL}/api/auth/users/${registration.user}`,
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );

          return {
            ...registration.toObject(),
            user: userResponse.data,
          };
        } catch (error) {
          console.error(
            `Error fetching user details for registration ${registration._id}:`,
            error
          );
          return {
            ...registration.toObject(),
            user: null,
          };
        }
      })
    );

    res.json(registrationsWithUserDetails);
  } catch (error) {
    console.error("Error fetching rejected registrations:", error);
    res
      .status(500)
      .json({
        message: "Error fetching rejected registrations",
        error: error.message,
      });
  }
};

// Update registration status (admin only)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId, status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const registration = await DeliveryPersonnel.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // If approved, update user role to delivery_personnel first
    if (status === "approved") {
      try {
        const userResponse = await axios.patch(
          `${AUTH_SERVICE_URL}/api/auth/users/${registration.user}`,
          { role: "delivery_personnel" },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );

        if (!userResponse.data) {
          return res.status(500).json({
            message: "Failed to update user role",
            error: "User role update failed",
          });
        }
      } catch (error) {
        console.error("Error updating user role:", error);
        return res.status(500).json({
          message: "Failed to update user role",
          error: error.response?.data?.message || error.message,
        });
      }
    }

    // If rejected or moving back to pending, check for other approved registrations before changing role
    if (status === "rejected" || status === "pending") {
      try {
        const otherApprovedRegistrations = await DeliveryPersonnel.find({
          user: registration.user,
          _id: { $ne: registration._id },
          registrationStatus: "approved",
        });

        if (otherApprovedRegistrations.length === 0) {
          const userResponse = await axios.patch(
            `${AUTH_SERVICE_URL}/api/auth/users/${registration.user}`,
            { role: "customer" },
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );

          if (!userResponse.data) {
            return res.status(500).json({
              message: "Failed to update user role",
              error: "User role update failed",
            });
          }
        }
      } catch (error) {
        console.error("Error updating user role:", error);
        return res.status(500).json({
          message: "Failed to update user role",
          error: error.response?.data?.message || error.message,
        });
      }
    }

    // Update registration status
    registration.registrationStatus = status;
    await registration.save();

    res.json({
      message: "Registration status updated successfully",
      registration,
      userRole:
        status === "approved"
          ? "delivery_personnel"
          : status === "rejected" || status === "pending"
          ? "customer"
          : undefined,
    });
  } catch (error) {
    console.error("Error updating registration status:", error);
    res
      .status(500)
      .json({
        message: "Error updating registration status",
        error: error.message,
      });
  }
};

// Get delivery personnel profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find delivery personnel by user ID
    const deliveryPersonnel = await DeliveryPersonnel.findOne({
      user: userId,
    }).select("-__v");

    if (!deliveryPersonnel) {
      return res.status(404).json({
        message: "Delivery personnel profile not found",
        error: "Profile not found for this user",
      });
    }

    // Get user details from auth service
    try {
      const userResponse = await axios.get(
        `${AUTH_SERVICE_URL}/api/auth/users/${userId}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      const profile = {
        ...deliveryPersonnel.toObject(),
        name: userResponse.data.name,
        email: userResponse.data.email,
        phone: userResponse.data.phone,
      };

      res.json(profile);
    } catch (userError) {
      console.error("Error fetching user details:", userError);
      // If user details fetch fails, still return delivery personnel data
      res.json(deliveryPersonnel);
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update delivery personnel profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      vehicleType,
      vehicleNumber,
      licenseNumber,
      address,
      isAvailable,
      workingHours,
    } = req.body;

    // Validate required fields
    if (!vehicleType || !vehicleNumber || !licenseNumber) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["vehicleType", "vehicleNumber", "licenseNumber"],
      });
    }

    // Validate vehicle type
    if (!["motorcycle", "bicycle", "car", "scooter"].includes(vehicleType)) {
      return res.status(400).json({
        message: "Invalid vehicle type",
        allowedTypes: ["motorcycle", "bicycle", "car", "scooter"],
      });
    }

    // Find delivery personnel by user ID
    const deliveryPersonnel = await DeliveryPersonnel.findOne({ user: userId });

    if (!deliveryPersonnel) {
      return res.status(404).json({
        message: "Delivery personnel profile not found",
        error: "Profile not found for this user",
      });
    }

    // Update profile fields
    deliveryPersonnel.vehicleType = vehicleType;
    deliveryPersonnel.vehicleNumber = vehicleNumber;
    deliveryPersonnel.licenseNumber = licenseNumber;
    if (address) deliveryPersonnel.address = address;
    if (isAvailable !== undefined) deliveryPersonnel.isAvailable = isAvailable;
    if (workingHours) {
      if (workingHours.start)
        deliveryPersonnel.workingHours.start = workingHours.start;
      if (workingHours.end)
        deliveryPersonnel.workingHours.end = workingHours.end;
    }

    await deliveryPersonnel.save();

    // Get updated profile with user details
    try {
      const userResponse = await axios.get(
        `${AUTH_SERVICE_URL}/api/auth/users/${userId}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      const updatedProfile = {
        ...deliveryPersonnel.toObject(),
        name: userResponse.data.name,
        email: userResponse.data.email,
        phone: userResponse.data.phone,
      };

      res.json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (userError) {
      console.error("Error fetching updated user details:", userError);
      // If user details fetch fails, still return delivery personnel data
      res.json({
        message: "Profile updated successfully",
        profile: deliveryPersonnel,
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Get user's delivery personnel registrations
const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Find all registrations for the user
    const registrations = await DeliveryPersonnel.find({ user: userId }).sort({
      createdAt: -1,
    }); // Sort by newest first

    if (!registrations || registrations.length === 0) {
      return res.json({
        message: "No registration requests found",
        registrations: [],
      });
    }

    res.json({
      message: "Registration requests retrieved successfully",
      registrations,
    });
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    res.status(500).json({
      message: "Error fetching registration requests",
      error: error.message,
    });
  }
};

module.exports = {
  registerDeliveryPersonnel,
  getPendingRegistrations,
  getApprovedRegistrations,
  getRejectedRegistrations,
  updateRegistrationStatus,
  getProfile,
  updateProfile,
  getUserRegistrations,
};
