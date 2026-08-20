/**
 * Employee Controller
 * Purpose: Handles HTTP requests for Employee CRUD actions, status updates, and soft deletion.
 */

const employeeService = require('../services/employeeService');
const { HTTP_STATUS } = require('../constants');

/**
 * @desc    Get all employees (with search, filter, pagination)
 * @route   GET /api/v1/employees
 * @access  Private (Admin)
 */
const getEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Employees fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single employee details
 * @route   GET /api/v1/employees/:id
 * @access  Private (Admin)
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new employee
 * @route   POST /api/v1/employees
 * @access  Private (Admin)
 */
const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/v1/employees/:id
 * @access  Private (Admin)
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate/Deactivate employee status
 * @route   PATCH /api/v1/employees/:id/status
 * @access  Private (Admin)
 */
const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Status must be Active or Inactive',
      });
    }
    const employee = await employeeService.toggleEmployeeStatus(req.params.id, status);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Employee status changed to ${status}`,
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete an employee
 * @route   DELETE /api/v1/employees/:id
 * @access  Private (Admin)
 */
const deleteEmployee = async (req, res, next) => {
  try {
    await employeeService.softDeleteEmployee(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Employee soft-deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get employees with capacity and availability metrics
 * @route   GET /api/v1/employees/capacity
 * @access  Private (Receptionist, Admin)
 */
const getEmployeeCapacity = async (req, res, next) => {
  try {
    const employees = await employeeService.getEmployeeCapacityList(req.query);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { employees },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  getEmployeeCapacity,
};
