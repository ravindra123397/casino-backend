export const validateImages = (req, res, next) => {
  const files = req.files;
  const allowed = ["image/jpeg", "image/png", "image/jpg"];

  for (let key of ["aadhaarFront", "aadhaarBack", "panFile"]) {
    if (!files?.[key])
      return res.status(400).json({ message: `${key} required` });

    if (!allowed.includes(files[key].mimetype))
      return res.status(400).json({ message: `${key} must be image` });
  }
  next();
};
