const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').required(),
  assignedUsers: Joi.array().items(Joi.string().hex().length(24)).optional(),
  subtasks: Joi.array().items(Joi.string().hex().length(24)).optional(),
  dependencies: Joi.array().items(Joi.string().hex().length(24)).optional()
});

const updateTaskSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  assignedUsers: Joi.array().items(Joi.string().hex().length(24)).optional(),
  subtasks: Joi.array().items(Joi.string().hex().length(24)).optional(),
  dependencies: Joi.array().items(Joi.string().hex().length(24)).optional()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
