const {fetchUsers, fetchUserDetails, assignUsersToTask} = require('../../controllers/userControllers/userController');
const {
  fetchTasks, 
  fetchTaskDetails,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addTaskDependencies,
} = require('../../controllers/taskControllers/taskController')


const taskResolvers = {
  Query: {
    fetchTasks: fetchTasks,

    fetchTaskDetails: fetchTaskDetails,

    fetchUsers: fetchUsers,

    fetchUserDetails: fetchUserDetails,
  },

  Mutation: {
    createTask: createTask,

    updateTask: updateTask,

    deleteTask: deleteTask,
    
    assignUsersToTask: assignUsersToTask,
    
    updateTaskStatus: updateTaskStatus,

    addTaskDependencies: addTaskDependencies,

    // assignUsersToTask: asyncWrapper(async (_, { taskId, userIds }, { user }) => {
    //   logger.info("Graphql - Resolver - taskResolver - assignUsersToTask - start");
    //   authorizeRoles("admin", "project-manager", "team-lead")(user);

    //   const task = await Task.findById(taskId);
    //   if (!task) throw new Error("Task not found");

    //   const changes = [
    //     {
    //       field: "assignedUsers",
    //       oldValue: task.assignedUsers,
    //       newValue: userIds,
    //     },
    //   ];

    //   const updatedTask = await Task.findByIdAndUpdate(
    //     taskId,
    //     { assignedUsers: userIds },
    //     { new: true }
    //   ).populate("assignedUsers");

    //   await logTaskHistory(taskId, changes, user._id);

    //   logger.info("Graphql - Resolver - taskResolver - assignUsersToTask - end");
    //   return updatedTask;
    // }),

  },

  // User: {
  //   assignedTasks: asyncWrapper(async (user) => {
  //     logger.info("Graphql - Resolver - taskResolver - User - assignedTasks - start");
  //     const tasks = await Task.find({ assignedUsers: user.id });
  //     logger.info( "Graphql - Resolver - taskResolver - User - assignedTasks - end");
  //     return tasks;
  //   }),
  // },

  // Task: {
  //   assignedUsers: asyncWrapper(async (task) => {
  //     logger.info("Graphql - Resolver - taskResolver - Task - assignedUsers - start");
  //     const users = await User.find({ _id: { $in: task.assignedUsers } });
  //     logger.info("Graphql - Resolver - taskResolver - Task - assignedUsers - end");
  //     return users;
  //   }),

  //   subtasks: asyncWrapper(async (task) => {
  //     logger.info("Graphql - Resolver - taskResolver - Task - subtasks - start");
  //     const subtasks = await Task.find({ _id: { $in: task.subtasks } });
  //     logger.info("Graphql - Resolver - taskResolver - Task - subtasks - end");
  //     return subtasks;
  //   }),

  //   dependencies: asyncWrapper(async (task) => {
  //     logger.info("Graphql - Resolver - taskResolver - Task - dependencies - start");
  //     const dependencies = await Task.find({ _id: { $in: task.dependencies } });
  //     logger.info("Graphql - Resolver - taskResolver - Task - dependencies - end");
  //     return dependencies;
  //   }),
  // },
};

module.exports = taskResolvers;
