import React, { useEffect, useState } from 'react';
import {
  getExpenseCategories,
  createExpenseCategory,
  deleteExpenseCategory,
  updateExpenseCategory,
} from '../services/ExpenseCategoryService';
import CategoryForm from '../components/CategoryForm'; // Assuming CategoryForm is also updated for consistency

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const ExpenseCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getExpenseCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load expense categories:', error);
      // You might want to set an error state here to display to the user
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      await createExpenseCategory(categoryData);
      loadCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
      // Handle error display
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense category? This action cannot be undone.')) {
      try {
        await deleteExpenseCategory(id);
        loadCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
        // Handle error display
      }
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editName.trim()) { // Basic validation
      alert('Category name cannot be empty.');
      return;
    }
    try {
      await updateExpenseCategory(editingId, { name: editName });
      cancelEditing();
      loadCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      // Handle error display
    }
  };

  return (
    <div className="container py-4"> {/* Increased padding for better spacing */}
      <div className="mx-auto" style={{ maxWidth: '720px' }}> {/* Slightly increased max-width for better form/table balance */}
        <h3 className="mb-4 text-dark fw-bold text-center"> {/* Consistent heading style */}
          <i className="fas fa-tags me-2 text-info"></i> Manage Expense Categories
        </h3> {/* New icon and updated title */}

        <div className="mb-4"> {/* Increased margin-bottom for spacing */}
          {/* CategoryForm will also need styling updates for consistency */}
          <CategoryForm onSubmit={handleAddCategory} label="Add New Expense Category" />
        </div>

        <div className="card shadow-sm border-0 rounded-3"> {/* Consistent card styling */}
          <div className="card-header bg-info text-white py-3 border-0 rounded-top-3"> {/* Use Bootstrap 'info' for categories, rounded top corners */}
            <h5 className="mb-0 fw-semibold">
              <i className="fas fa-list-alt me-2"></i> Expense Category List
            </h5> {/* Professional icon and clearer title */}
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0"> {/* table-hover, align-middle */}
              <thead className="table-light"> {/* Light background for table header */}
                <tr>
                  <th scope="col">Category Name</th> {/* Clearer column header */}
                  <th scope="col" style={{ width: '180px' }} className="text-end">Actions</th> {/* Adjusted width for buttons */}
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center text-muted py-4">
                      <i className="fas fa-box-open me-2"></i> No expense categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm" // Smaller control for inline editing
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyPress={(e) => { // Allow saving with Enter key
                              if (e.key === 'Enter') saveEdit();
                            }}
                            autoFocus // Focus on the input when editing starts
                          />
                        ) : (
                          <span className="fw-medium">{cat.name}</span> // Slightly bold category name
                        )}
                      </td>
                      <td className="text-end">
                        {editingId === cat.id ? (
                          <div className="d-flex justify-content-end gap-2"> {/* Align buttons and add gap */}
                            <button
                              className="btn btn-sm btn-success rounded-pill px-3" // Success color for save
                              onClick={saveEdit}
                              title="Save Changes"
                            >
                              <i className="fas fa-save me-1"></i> Save
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3" // Outline secondary for cancel
                              onClick={cancelEditing}
                              title="Cancel Editing"
                            >
                              <i className="fas fa-times me-1"></i> Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-2"> {/* Align buttons and add gap */}
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill" // Outline primary for edit
                              onClick={() => startEditing(cat)}
                              title="Edit Category"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill" // Outline danger for delete
                              onClick={() => handleDelete(cat.id)}
                              title="Delete Category"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoriesPage;