/**
 * Employee Service
 * Purpose: Implements business logic for Employee CRUD operations, search, filters, pagination,
 * unique email/phone checks, status updates, and soft deletes.
 */

const Employee = require('../models/employeeModel');

/**
 * Get all employees with search, department/status filters, and pagination.
 */
const getAllEmployees = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Filter out soft-deleted records
  const filter = { isDeleted: false };

  // Search filter across Name, Email, or Employee Code
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { employeeCode: searchRegex },
    ];
  }

  // Filter by Department
  if (query.department && query.department !== 'ALL') {
    filter.department = query.department;
  }

  // Filter by Status (Active/Inactive)
  if (query.status && query.status !== 'ALL') {
    filter.status = query.status;
  }

  // Execute database query with count for total pagination
  const [employees, total] = await Promise.all([
    Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    employees,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get single employee by ID.
 */
const getEmployeeById = async (id) => {
  const employee = await Employee.findOne({ _id: id, isDeleted: false });
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  return employee;
};

/**
 * Create a new employee.
 */
const createEmployee = async (employeeData) => {
  // Check unique Email constraint
  const existingEmail = await Employee.findOne({
    email: employeeData.email.toLowerCase(),
    isDeleted: false,
  });
  if (existingEmail) {
    const error = new Error('An employee with this email address already exists');
    error.statusCode = 400;
    throw error;
  }

  // Check unique Phone constraint
  const existingPhone = await Employee.findOne({
    phone: employeeData.phone,
    isDeleted: false,
  });
  if (existingPhone) {
    const error = new Error('An employee with this phone number already exists');
    error.statusCode = 400;
    throw error;
  }

  const newEmployee = new Employee(employeeData);
  await newEmployee.save(); // Triggers pre-validate auto-code generation
  return newEmployee;
};

/**
 * Update employee details.
 */
const updateEmployee = async (id, updateData) => {
  const employee = await getEmployeeById(id);

  // Check unique Email constraint if email is being updated
  if (updateData.email && updateData.email.toLowerCase() !== employee.email) {
    const existingEmail = await Employee.findOne({
      email: updateData.email.toLowerCase(),
      _id: { $ne: id },
      isDeleted: false,
    });
    if (existingEmail) {
      const error = new Error('An employee with this email address already exists');
      error.statusCode = 400;
      throw error;
    }
  }

  // Check unique Phone constraint if phone is being updated
  if (updateData.phone && updateData.phone !== employee.phone) {
    const existingPhone = await Employee.findOne({
      phone: updateData.phone,
      _id: { $ne: id },
      isDeleted: false,
    });
    if (existingPhone) {
      const error = new Error('An employee with this phone number already exists');
      error.statusCode = 400;
      throw error;
    }
  }

  Object.assign(employee, updateData);
  await employee.save();
  return employee;
};

/**
 * Toggle active/inactive status of an employee.
 */
const toggleEmployeeStatus = async (id, status) => {
  const employee = await getEmployeeById(id);
  employee.status = status;
  await employee.save();
  return employee;
};

/**
 * Soft delete an employee (Sets isDeleted: true).
 */
const softDeleteEmployee = async (id) => {
  const employee = await getEmployeeById(id);
  employee.isDeleted = true;
  await employee.save();
  return employee;
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  softDeleteEmployee,
};
