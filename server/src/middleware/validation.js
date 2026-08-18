const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'any.required': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  role: Joi.string().valid('user', 'admin', 'manager').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  assignedTo: Joi.string().hex().length(24).required(),
  team: Joi.string().hex().length(24).required(),
  tags: Joi.array().items(Joi.string()).default([]),
  dueDate: Joi.date().iso().required(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100),
  description: Joi.string().trim().min(10).max(1000),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  assignedTo: Joi.string().hex().length(24),
  tags: Joi.array().items(Joi.string()),
  dueDate: Joi.date().iso(),
});

const createTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().max(200),
});

const updateTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  description: Joi.string().trim().max(200),
});

const addMemberSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  role: Joi.string().valid('owner', 'admin', 'member').default('member'),
});

const removeMemberSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  email: Joi.string().email(),
  avatar: Joi.string().uri(),
});

const validation = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    next();
  };
};

module.exports = {
  validation,
  schemas: {
    register: validation(registerSchema),
    login: validation(loginSchema),
    createTask: validation(createTaskSchema),
    updateTask: validation(updateTaskSchema),
    createTeam: validation(createTeamSchema),
    updateTeam: validation(updateTeamSchema),
    addMember: validation(addMemberSchema),
    removeMember: validation(removeMemberSchema),
    updateProfile: validation(updateProfileSchema),
  },
};
