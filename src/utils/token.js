const generateToken = (id) => {
  return Buffer.from(String(id)).toString('base64');
};

const verifyToken = (token) => {
  try {
    const id = Buffer.from(token, 'base64').toString('ascii');
    return { id };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export { generateToken, verifyToken };
