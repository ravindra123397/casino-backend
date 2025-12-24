import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

/* ================= TOKEN GENERATOR ================= */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ================= ADMIN REGISTER ================= */
/* ⚠️ Use only once or protect with env flag */
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ name, email, password });

    res.json({
      message: "Admin registered successfully",
      adminId: admin._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Admin register failed" });
  }
};

/* ================= ADMIN LOGIN ================= */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(admin._id),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};
