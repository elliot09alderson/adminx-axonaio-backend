import { Admin } from "../models/adminModel.js";


/* ------------------ ACTIVATE AND DEACTIVATE THE EMPLOYEE ------------------ */
export const toggleEmployee = async (req, res) => {
    try {
      const employeeId = req.params.id;
      console.log(employeeId)
  
      // Find the employee by ID
      const employee = await Admin.findOne({emp_id:employeeId});
  
      if (!employee) {
        return res.status(404).json({
          status: false,
          error: "No records found",
        });
      }
  
      // Toggle the is_active status
      const newStatus = !employee.is_active;
      await Admin.updateOne(
        { emp_id: employeeId },
        { $set: { is_active: newStatus } }
      );
  
      return res.status(200).json({
        status: true,
        message: `${employee.first_name} ${employee.last_name} has been successfully ${newStatus ? "activated" : "deactivated"} `,
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  };


/* -------------------------- GET EMPLOYEE PROFILE -------------------------- */

export const getEmployeeProfile = async (req, res) => {
    try {
         const employeeId = req.user._id

        const employees = await Admin.findById(employeeId).select("-password -refreshToken");

        
        if (!employees) {
          return res.status(404).json({
            status: false,
            error: "No employees found",
          });
        }
    
        return res.status(200).json({
          status: true,
          data: employees,
        });
      } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
      }
}
/* ------------------- FETCH EMPLOYEES EXCEPT SUPER-ADMIN ------------------- */

export const fetchEmployees = async (req, res) => {
    try {
        const employees = await Admin.find({ role: { $ne: 'super_admin' } }).select('-password -refreshToken');

        
        if (!employees || employees.length === 0) {
          return res.status(404).json({
            status: false,
            error: "No employees found",
          });
        }
    
        return res.status(200).json({
          status: true,
          data: employees,
        });
      } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
      }
}

/* ------------------ ADD OR REMOVE PERMISSIONS TO/FROM EMPLOYEE ----------------- */


export const togglePermissions = async (req, res) => {


    try {

      const { employeeId, permissions, action } = req.body;

      if (!employeeId || !Array.isArray(permissions) || !['add', 'remove'].includes(action)) {
          return res.status(400).json({
              status: false,
              error: "Invalid request data",
          });
      }
        const update = action === 'add' ? { $addToSet: { permissions: { $each: permissions } } } : { $pull: { permissions: { $in: permissions } } };
        const updatedEmployee = await Admin.findOneAndUpdate({ emp_id: employeeId }, update, { new: true });

        if (!updatedEmployee) {
            return res.status(404).json({
                status: false,
                error: "employee not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: `Permissions has been successfully ${action === 'add' ? 'added to' : 'removed from'} ${updatedEmployee.role} ${updatedEmployee.first_name} ${updatedEmployee.last_name} `,
            data: updatedEmployee.permissions,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message,
        });
    }
};

export const updateEmployeeDetails = async (req, res) => {
    const { emp_id } = req.params;
    const updateData = req.body;

    if (!emp_id || !updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({
            status: false,
            error: "Invalid request data",
        });
    }

    try {
        const updatedEmployee = await Admin.findOneAndUpdate({ emp_id }, updateData, { new: true, runValidators: true });

        if (!updatedEmployee) {
            return res.status(404).json({
                status: false,
                error: "Employee not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: `Employee details updated successfully`,
            data: updatedEmployee,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            error: error.message,
        });
    }
};
