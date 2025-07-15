import React, { useEffect, useState } from 'react';
import {
  getIncomeCategories,
  createIncomeCategory,
  deleteIncomeCategory,
  updateIncomeCategory,
} from '../services/incomeCategoryService';
import CategoryForm from '../components/CategoryForm';

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
      console.error('Failed to load income categories', error);
    }
  };

  const handleAddCategory = async (categoryData) => {
    try {
      await createIncomeCategory(categoryData);
      loadCategories();
    } catch (error) {
      console.error('Failed to add category', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await deleteIncomeCategory(id);
        loadCategories();
      } catch (error) {
        console.error('Failed to delete category', error);
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
    try {
      await updateIncomeCategory(editingId, { name: editName });
      cancelEditing();
      loadCategories();
    } catch (error) {
      console.error('Failed to update category', error);
    }
  };

  return (
    <div className="container py-2">
      <div className="mx-auto" style={{ maxWidth: '640px' }}>
        <h4 className="mb-3 text-success fw-bold text-center">💰 Income Categories</h4>

        <div className="mb-3">
          <CategoryForm onSubmit={handleAddCategory} label="➕ Add New Income Category" />
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-success text-white fw-semibold">
            Category List
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover m-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th style={{ width: '150px' }} className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="text-end">
                      {editingId === cat.id ? (
                        <>
                          <button className="btn btn-sm btn-success me-1" onClick={saveEdit}>
                            💾
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={cancelEditing}>
                            ❌
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-warning me-1"
                            onClick={() => startEditing(cat)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(cat.id)}
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="2" className="text-center text-muted py-3">
                      No categories found.
                    </td>
                  </tr>
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
