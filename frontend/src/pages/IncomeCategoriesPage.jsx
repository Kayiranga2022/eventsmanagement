import React, { useEffect, useState } from 'react';
import {
  getIncomeCategories,
  createIncomeCategory,
  deleteIncomeCategory,
  updateIncomeCategory,
} from '../services/incomeCategoryService';
import CategoryForm from '../components/CategoryForm'; // Assuming CategoryForm is also updated for consistency

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const IncomeCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getIncomeCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load income categories:', error);
      // You might want to set an error state here to display to the user
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      await createIncomeCategory(categoryData);
      loadCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
      // Handle error display
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income category? This action cannot be undone.')) {
      try {
        await deleteIncomeCategory(id);
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
      await updateIncomeCategory(editingId, { name: editName });
      cancelEditing();
      loadCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      // Handle error display
    }
  };

  return (
    <div className="container py-4">
      <div className="mx-auto" style={{ maxWidth: '720px' }}>
        <h3 className="mb-4 text-dark fw-bold text-center">
          <i className="fas fa-hand-holding-usd me-2 text-success"></i> Manage Income Categories
        </h3>

        <div className="mb-4">
          <CategoryForm onSubmit={handleAddCategory} label="Add New Income Category" />
        </div>

        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-success text-white py-3 border-0 rounded-top-3">
            <h5 className="mb-0 fw-semibold">
              <i className="fas fa-list-alt me-2"></i> Income Category List
            </h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Category Name</th>
                  <th scope="col" style={{ width: '180px' }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center text-muted py-4">
                      <i className="fas fa-box-open me-2"></i> No income categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveEdit();
                            }}
                            autoFocus
                          />
                        ) : (
                          <span className="fw-medium">{cat.name}</span>
                        )}
                      </td>
                      <td className="text-end">
                        {editingId === cat.id ? (
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-success rounded-pill px-3" // Removed trailing comment
                              onClick={saveEdit}
                              title="Save Changes"
                            >
                              <i className="fas fa-save me-1"></i> Save
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3" // Removed trailing comment
                              onClick={cancelEditing}
                              title="Cancel Editing"
                            >
                              <i className="fas fa-times me-1"></i> Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill" // Removed trailing comment
                              onClick={() => startEditing(cat)}
                              title="Edit Category"
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill" // Removed trailing comment
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

export default IncomeCategoriesPage;